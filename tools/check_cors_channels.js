#!/usr/bin/env node
/**
 * Comprueba si los m3u8 son utilizables *desde un navegador*.
 *
 * report_status_channels.js solo pregunta "¿responde el servidor?", y desde Node
 * eso siempre es que sí: Node no aplica la política del mismo origen. En el sitio
 * real, video.js pide la playlist por XHR, así que un servidor que responde 200
 * pero no manda `Access-Control-Allow-Origin` deja el canal muerto igualmente —
 * es el caso de los enlaces de jmp2.uk, que pasaban el chequeo y nunca se veían.
 *
 * Manda la petición con la cabecera Origin del sitio publicado (sin ella muchos
 * servidores ni se molestan en responder cabeceras CORS) y considera utilizable
 * el stream cuyo `access-control-allow-origin` sea `*` o ese mismo origen.
 *
 * Además sigue la cadena que recorre el player: master playlist → primera variante
 * → primer segmento. Un canal cuya playlist responde bien pero cuyos segmentos están
 * caídos, o viven en otro host sin CORS, pasaba el chequeo y nunca mostraba imagen.
 * `--shallow` vuelve a comprobar solo la playlist principal.
 *
 * Escribe json-tv/cors_results.json con `{ id: boolean }` y no modifica el
 * catálogo: decide una persona a la vista del informe.
 *
 * Usage: node tools/check_cors_channels.js [--timeout=10000] [--only=id1,id2] [--shallow]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { firstPlaylistUri } = require('./lib/hls');

const CHANNELS_FILE = path.join(__dirname, '../json-tv/tv-channels.json');
const RESULTS_FILE = path.join(__dirname, '../json-tv/cors_results.json');
const SITE_ORIGIN = 'https://mediahub-org.github.io';

const timeoutArg = process.argv.find((arg) => arg.startsWith('--timeout='));
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const TIMEOUT = timeoutArg ? parseInt(timeoutArg.split('=')[1], 10) : 10000;
const ONLY = onlyArg ? new Set(onlyArg.split('=')[1].split(',')) : null;
const SHALLOW = process.argv.includes('--shallow');
const MAX_REDIRECTS = 3;
const MAX_PLAYLIST_BYTES = 256 * 1024;

/**
 * GET con la cabecera Origin del sitio, siguiendo redirecciones. Lee el cuerpo solo
 * si `readBody` (playlists); para segmentos basta con las cabeceras.
 *
 * @returns {Promise<{ok: boolean, status: number|null, acao: string|undefined, url: string, body: string}>}
 */
function fetchWithOrigin(url, timeout, readBody, redirects = 0) {
    return new Promise((resolve) => {
        const fail = { ok: false, status: null, acao: undefined, url, body: '' };
        let req;
        const done = (result) => {
            try {
                req?.destroy();
            } catch {
                /* la petición ya estaba cerrada */
            }
            resolve(result);
        };
        try {
            const lib = url.startsWith('https') ? https : http;
            req = lib.get(url, { timeout, headers: { Origin: SITE_ORIGIN } }, (res) => {
                const status = res.statusCode;
                const location = res.headers.location;
                if (status >= 300 && status < 400 && location && redirects < MAX_REDIRECTS) {
                    res.resume();
                    const next = new URL(location, url).href;
                    fetchWithOrigin(next, timeout, readBody, redirects + 1).then(done);
                    return;
                }
                const acao = res.headers['access-control-allow-origin'];
                const ok = (acao === '*' || acao === SITE_ORIGIN) && status >= 200 && status < 300;
                if (!readBody || !ok) {
                    done({ ok, status, acao, url, body: '' });
                    return;
                }
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    body += chunk;
                    if (body.length > MAX_PLAYLIST_BYTES) done({ ok, status, acao, url, body });
                });
                res.on('end', () => done({ ok, status, acao, url, body }));
                res.on('error', () => done(fail));
            });
        } catch {
            done(fail);
            return;
        }
        req.on('error', () => done(fail));
        req.on('timeout', () => done(fail));
    });
}

/**
 * Recorre playlist → variante → segmento como lo haría el player.
 *
 * @returns {Promise<{ok: boolean, status: number|null, acao: string|undefined, step: string}>}
 */
async function probeStream(url, timeout) {
    let current = await fetchWithOrigin(url, timeout, !SHALLOW);
    if (!current.ok || SHALLOW) return { ...current, step: 'playlist' };

    for (let depth = 0; depth < 2; depth++) {
        const next = firstPlaylistUri(current.body, current.url);
        if (!next) return { ...current, ok: false, step: 'playlist sin entradas' };
        const isSegment = next.kind === 'segment';
        const res = await fetchWithOrigin(next.url, timeout, !isSegment);
        if (!res.ok) return { ...res, step: isSegment ? 'segmento' : 'variante' };
        if (isSegment) return { ...res, step: 'segmento' };
        current = res;
    }
    return { ...current, ok: false, step: 'demasiados niveles' };
}

async function main() {
    const channels = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));
    const results = {};
    const sinCors = [];

    for (const [id, data] of Object.entries(channels)) {
        if (ONLY && !ONLY.has(id)) continue;
        const url = data?.signals?.m3u8_url?.[0];
        if (!url) continue;

        const { ok, status, acao, step } = await probeStream(url, TIMEOUT);
        results[id] = ok;
        if (!ok) sinCors.push({ id, status, acao: acao ?? '(ninguna)', step });
        console.log(
            `${ok ? '✓' : '✗'} ${id} [${step}] status=${status ?? 'sin respuesta'} acao=${acao ?? '-'}`,
        );
    }

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2) + '\n', 'utf8');

    console.log(
        `\nUtilizables desde el navegador: ${Object.values(results).filter(Boolean).length}`,
    );
    console.log(`Bloqueados por CORS o sin respuesta: ${sinCors.length}`);
    for (const { id, status, acao, step } of sinCors) {
        console.log(`  - ${id} (${step}: status ${status ?? 'sin respuesta'}, acao ${acao})`);
    }
    console.log(`\nResultados en ${RESULTS_FILE}`);
}

if (require.main === module) {
    main().catch((err) => {
        console.error('Error:', err.message || err);
        process.exit(1);
    });
}

module.exports = { probeStream, SITE_ORIGIN };
