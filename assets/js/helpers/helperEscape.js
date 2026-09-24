/**
 * Utilidades para insertar datos del catálogo de canales en el DOM sin riesgo.
 * El catálogo se alimenta en parte de listas externas (fusión automática desde
 * teles/iptv-org), así que nombres y enlaces no son de confianza al usar innerHTML.
 * @module helperEscape
 */

/** @type {Record<string, string>} */
const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/**
 * Escapa un valor para insertarlo como texto o atributo dentro de un template HTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Devuelve la URL solo si es http(s) absoluta; si no, cadena vacía. Evita que un
 * `website` como `javascript:...` termine en el href del enlace oficial.
 * @param {unknown} url
 * @returns {string}
 */
export function safeHttpUrl(url) {
    if (typeof url !== 'string' || !url.trim()) return '';
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
    } catch {
        return '';
    }
}
