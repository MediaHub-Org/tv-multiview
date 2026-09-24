// Pure-logic helper tests. Node's built-in runner, no framework, no deps:
//   node --test test/
// Import the specific helper files, NOT helpers/index.js — the barrel pulls in
// DOM-dependent siblings that would blow up under Node.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { areSimilarNames } from '../assets/js/helpers/helperSimilarNames.js';
import { M3U_A_JSON } from '../assets/js/helpers/helperM3U.js';
import { readStoredObject } from '../assets/js/helpers/helperStorage.js';
import { escapeHtml, safeHttpUrl } from '../assets/js/helpers/helperEscape.js';
import { computeGridFit } from '../assets/js/helpers/helperFitGrid.js';
import { isBenignPlayRejection } from '../assets/js/helpers/helperPlayRejection.js';

// Minimal localStorage stub (Node has no DOM). Only getItem is exercised.
const store = {};
globalThis.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
};

test('areSimilarNames: case-insensitive exact match', () => {
    assert.equal(areSimilarNames('BBC One', 'bbc one'), true);
});

test('areSimilarNames: substring either direction', () => {
    assert.equal(areSimilarNames('CNN', 'CNN International'), true);
    assert.equal(areSimilarNames('Al Jazeera English', 'al jazeera'), true);
});

test('areSimilarNames: unrelated names do not match', () => {
    assert.equal(areSimilarNames('ABC', 'NBC'), false);
});

test('areSimilarNames: non-string / nullish inputs do not throw', () => {
    assert.equal(areSimilarNames(null, undefined), true); // both coerce to '' → '' includes ''
    assert.equal(areSimilarNames(123, '12'), true);
    assert.equal(areSimilarNames('news', null), true); // '' is a substring of anything
});

test('M3U_A_JSON: parses id, country, name, logo, category and stream url', async () => {
    const m3u = [
        '#EXTM3U',
        '#EXTINF:-1 tvg-id="france24.fr" tvg-logo="http://logo/f24.png" group-title="News",France 24',
        'https://example.com/france24.m3u8',
    ].join('\n');

    const out = await M3U_A_JSON(m3u);

    assert.deepEqual(out.france24, {
        name: 'France 24',
        logo: 'http://logo/f24.png',
        signals: {
            iframe_url: [],
            m3u8_url: ['https://example.com/france24.m3u8'],
            yt_id: '',
            yt_embed: '',
            yt_playlist: '',
            twitch_id: '',
        },
        website: '',
        category: 'news',
        country: 'fr',
    });
});

test('readStoredObject: missing key returns empty object', () => {
    delete store.absent;
    assert.deepEqual(readStoredObject('absent'), {});
});

test('readStoredObject: valid JSON object is returned as-is', () => {
    store.ok = JSON.stringify({ cnn: 0 });
    assert.deepEqual(readStoredObject('ok'), { cnn: 0 });
});

test('readStoredObject: corrupt/non-object JSON falls back to empty object', () => {
    store.corrupt = '{not valid json';
    assert.deepEqual(readStoredObject('corrupt'), {});
    store.scalar = '5';
    assert.deepEqual(readStoredObject('scalar'), {});
});

test('M3U_A_JSON: skips #EXTVLCOPT lines when finding the stream url', async () => {
    const m3u = [
        '#EXTM3U',
        '#EXTINF:-1 tvg-id="dw.de",DW',
        '#EXTVLCOPT:http-user-agent=Mozilla',
        'https://example.com/dw.m3u8',
    ].join('\n');

    const out = await M3U_A_JSON(m3u);
    assert.equal(out.dw.signals.m3u8_url[0], 'https://example.com/dw.m3u8');
    assert.equal(out.dw.country, 'de');
});

test('escapeHtml: neutralises markup in channel names', () => {
    assert.equal(
        escapeHtml(`<img src=x onerror="alert('1')">&`),
        '&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;&amp;',
    );
    assert.equal(escapeHtml(undefined), '');
});

test('safeHttpUrl: keeps http(s) links, drops other schemes and junk', () => {
    assert.equal(safeHttpUrl('https://example.com/live'), 'https://example.com/live');
    assert.equal(safeHttpUrl('http://example.com'), 'http://example.com/');
    assert.equal(safeHttpUrl('javascript:alert(1)'), '');
    assert.equal(safeHttpUrl(' JaVaScRiPt:alert(1)'), '');
    assert.equal(safeHttpUrl('data:text/html,hi'), '');
    assert.equal(safeHttpUrl('not a url'), '');
    assert.equal(safeHttpUrl(''), '');
    assert.equal(safeHttpUrl(null), '');
});

test('computeGridFit: 16:9 grid shrinks to fit every row on screen', () => {
    // 9 channels, 3 per row, 1366x768: rows are height-bound (256px), 16:9 tiles.
    const fit = computeGridFit({ count: 9, cols: 3, width: 1366, height: 768, keepAspect: true });
    assert.equal(fit.rows, 3);
    assert.ok(fit.tileHeight * fit.rows <= 768);
    assert.ok(Math.abs(fit.tileWidth / fit.tileHeight - 16 / 9) < 1e-9);
    assert.ok(fit.gridWidth <= 1366);
});

test('computeGridFit: 12 channels in 3 columns no longer overflow the height', () => {
    const fit = computeGridFit({ count: 12, cols: 3, width: 1366, height: 768, keepAspect: true });
    assert.equal(fit.rows, 4);
    assert.ok(fit.tileHeight * 4 <= 768 + 1e-9);
    assert.ok(fit.gridWidth < 1366); // narrower, centred grid
});

test('computeGridFit: fill mode splits the height evenly and keeps full width', () => {
    const fit = computeGridFit({ count: 4, cols: 2, width: 1000, height: 600, keepAspect: false });
    assert.deepEqual(fit, { rows: 2, tileWidth: 500, tileHeight: 300, gridWidth: 1000 });
});

test('computeGridFit: width-bound layouts keep 16:9 without exceeding the width', () => {
    const fit = computeGridFit({ count: 2, cols: 2, width: 800, height: 900, keepAspect: true });
    assert.equal(fit.rows, 1);
    assert.equal(fit.tileWidth, 400);
    assert.equal(fit.tileHeight, 225);
});

test('computeGridFit: guards against zero channels or columns', () => {
    const fit = computeGridFit({ count: 0, cols: 0, width: 800, height: 600, keepAspect: true });
    assert.equal(fit.rows, 1);
    assert.ok(Number.isFinite(fit.tileHeight));
});

test('isBenignPlayRejection: interrupted or autoplay-blocked play() is not a dead stream', () => {
    assert.equal(isBenignPlayRejection(new DOMException('interrupted', 'AbortError')), true);
    assert.equal(isBenignPlayRejection(new DOMException('blocked', 'NotAllowedError')), true);
    assert.equal(isBenignPlayRejection(new DOMException('bad src', 'NotSupportedError')), false);
    assert.equal(isBenignPlayRejection(new Error('boom')), false);
    assert.equal(isBenignPlayRejection(undefined), false);
});
