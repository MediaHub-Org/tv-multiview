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
 * Escribe json-tv/cors_results.json con `{ id: boolean }` y no modifica el
 * catálogo: decide una persona a la vista del informe.
 *
 * Usage: node tools/check_cors_channels.js [--timeout=10000] [--only=id1,id2]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CHANNELS_FILE = path.join(__dirname, '../json-tv/tv-channels.json');
const RESULTS_FILE = path.join(__dirname, '../json-tv/cors_results.json');
const SITE_ORIGIN = 'https://mediahub-org.github.io';

const timeoutArg = process.argv.find((arg) => arg.startsWith('--timeout='));
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const TIMEOUT = timeoutArg ? parseInt(timeoutArg.split('=')[1], 10) : 10000;
const ONLY = onlyArg ? new Set(onlyArg.split('=')[1].split(',')) : null;

/**
 * @returns {Promise<{ok: boolean, status: number|null, acao: string|undefined}>}
 */
function probeCors(url, timeout) {
    return new Promise((resolve) => {
        const lib = url.startsWith('https') ? https : http;
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
            req = lib.get(url, { timeout, headers: { Origin: SITE_ORIGIN } }, (res) => {
                const acao = res.headers['access-control-allow-origin'];
                const status = res.statusCode;
                const permitido = acao === '*' || acao === SITE_ORIGIN;
                done({ ok: Boolean(permitido && status >= 200 && status < 400), status, acao });
            });
        } catch {
            done({ ok: false, status: null, acao: undefined });
            return;
        }
        req.on('error', () => done({ ok: false, status: null, acao: undefined }));
        req.on('timeout', () => done({ ok: false, status: null, acao: undefined }));
    });
}

async function main() {
    const channels = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));
    const results = {};
    const sinCors = [];

    for (const [id, data] of Object.entries(channels)) {
        if (ONLY && !ONLY.has(id)) continue;
        const url = data?.signals?.m3u8_url?.[0];
        if (!url) continue;

        const { ok, status, acao } = await probeCors(url, TIMEOUT);
        results[id] = ok;
        if (!ok) sinCors.push({ id, status, acao: acao ?? '(ninguna)' });
        console.log(
            `${ok ? '✓' : '✗'} ${id} status=${status ?? 'sin respuesta'} acao=${acao ?? '-'}`,
        );
    }

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2) + '\n', 'utf8');

    console.log(
        `\nUtilizables desde el navegador: ${Object.values(results).filter(Boolean).length}`,
    );
    console.log(`Bloqueados por CORS o sin respuesta: ${sinCors.length}`);
    for (const { id, status, acao } of sinCors) {
        console.log(`  - ${id} (status ${status ?? 'sin respuesta'}, acao ${acao})`);
    }
    console.log(`\nResultados en ${RESULTS_FILE}`);
}

main().catch((err) => {
    console.error('Error:', err.message || err);
    process.exit(1);
});
