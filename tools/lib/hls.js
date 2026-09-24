/**
 * Utilidades mínimas de HLS para las herramientas de mantenimiento.
 * Sin dependencias: se usan en CI y en local con Node a secas.
 */

/**
 * Primera URI útil de una playlist HLS, resuelta contra la URL de la playlist.
 * En una master playlist es la primera variante (`#EXT-X-STREAM-INF` + URI);
 * en una media playlist es el primer segmento.
 *
 * @param {string} text Contenido de la playlist.
 * @param {string} baseUrl URL desde la que se descargó (para URIs relativas).
 * @returns {{ kind: 'variant' | 'segment', url: string } | null}
 */
function firstPlaylistUri(text, baseUrl) {
    if (typeof text !== 'string' || !text.trimStart().startsWith('#EXTM3U')) return null;
    const lines = text.split(/\r?\n/).map((line) => line.trim());
    const isMaster = lines.some((line) => line.startsWith('#EXT-X-STREAM-INF'));
    for (const line of lines) {
        if (!line || line.startsWith('#')) continue;
        try {
            return { kind: isMaster ? 'variant' : 'segment', url: new URL(line, baseUrl).href };
        } catch {
            return null;
        }
    }
    return null;
}

module.exports = { firstPlaylistUri };
