// Stream probe used by tools/check_cors_channels.js: HLS parsing and the
// playlist → variant → segment walk, against a local server.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { firstPlaylistUri } = require('../tools/lib/hls.js');
const { probeStream, SITE_ORIGIN } = require('../tools/check_cors_channels.js');

test('firstPlaylistUri: master playlist yields the first variant, resolved', () => {
    const master =
        '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000\nlow/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2000000\nhigh/index.m3u8\n';
    assert.deepEqual(firstPlaylistUri(master, 'https://cdn.example/live/master.m3u8'), {
        kind: 'variant',
        url: 'https://cdn.example/live/low/index.m3u8',
    });
});

test('firstPlaylistUri: media playlist yields the first segment (absolute URIs kept)', () => {
    const media =
        '#EXTM3U\r\n#EXT-X-TARGETDURATION:6\r\n#EXTINF:6.0,\r\nhttps://seg.example/a/1.ts\r\n';
    assert.deepEqual(firstPlaylistUri(media, 'https://cdn.example/x.m3u8'), {
        kind: 'segment',
        url: 'https://seg.example/a/1.ts',
    });
});

test('firstPlaylistUri: rejects non-HLS bodies and empty playlists', () => {
    assert.equal(firstPlaylistUri('<html>blocked</html>', 'https://x/'), null);
    assert.equal(firstPlaylistUri('#EXTM3U\n#EXT-X-ENDLIST\n', 'https://x/'), null);
    assert.equal(firstPlaylistUri(undefined, 'https://x/'), null);
});

// Local server: /ok/* sends CORS everywhere; /nosegcors/* omits it on the segment;
// /deadseg/* 404s the segment; /redirect bounces to /ok/master.m3u8.
let server;
let base;
let flakyHits = 0;
before(async () => {
    server = http.createServer((req, res) => {
        const cors = { 'access-control-allow-origin': '*' };
        const [, scenario, file] = req.url.split('/');
        if (scenario === 'redirect') {
            res.writeHead(302, { location: '/ok/master.m3u8' }).end();
            return;
        }
        if (file === 'master.m3u8') {
            res.writeHead(200, cors).end('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\nvariant.m3u8\n');
        } else if (file === 'variant.m3u8') {
            res.writeHead(200, cors).end('#EXTM3U\n#EXTINF:6,\nseg1.ts\n');
        } else if (file === 'seg1.ts') {
            if (scenario === 'deadseg') res.writeHead(404, cors).end();
            else if (scenario === 'geo') res.writeHead(403, cors).end();
            else if (scenario === 'geonocors') res.writeHead(403).end();
            else if (scenario === 'flaky' && flakyHits++ === 0) res.writeHead(404, cors).end();
            else if (scenario === 'nosegcors') res.writeHead(200).end('ts');
            else res.writeHead(200, cors).end('ts');
        } else {
            res.writeHead(404).end();
        }
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('probeStream: healthy chain passes at the segment step', async () => {
    const r = await probeStream(`${base}/ok/master.m3u8`, 3000);
    assert.equal(r.ok, true);
    assert.equal(r.step, 'segmento');
});

test('probeStream: follows redirects on the playlist', async () => {
    const r = await probeStream(`${base}/redirect/master.m3u8`, 3000);
    assert.equal(r.ok, true);
});

test('probeStream: segment without CORS fails although the playlist is fine', async () => {
    const r = await probeStream(`${base}/nosegcors/master.m3u8`, 3000);
    assert.equal(r.ok, false);
    assert.equal(r.step, 'segmento');
});

test('probeStream: dead segment fails', async () => {
    const r = await probeStream(`${base}/deadseg/master.m3u8`, 3000);
    assert.equal(r.ok, false);
    assert.equal(r.status, 404);
});

test('probeStream: segment 403 behind a CORS-approved playlist is kept as region-locked', async () => {
    const r = await probeStream(`${base}/geo/master.m3u8`, 3000);
    assert.equal(r.ok, true);
    assert.equal(r.geo, true);
});

test('probeStream: segment 403 without CORS is still a failure', async () => {
    const r = await probeStream(`${base}/geonocors/master.m3u8`, 3000);
    assert.equal(r.ok, false);
});

test('probeStream: a segment 404 is retried once (rotating live window)', async () => {
    const r = await probeStream(`${base}/flaky/master.m3u8`, 3000);
    assert.equal(r.ok, true);
});

test('probeStream: sends the published site origin', () => {
    assert.match(SITE_ORIGIN, /^https:\/\/mediahub-org\.github\.io$/);
});
