/**
 * Señal de respaldo cuando falla el m3u8 de un canal.
 * @module helperStreamFallback
 */

/**
 * Primera señal embebible disponible, en orden de fiabilidad: YouTube (nunca choca
 * con CORS), después la página embebida del canal y por último Twitch.
 *
 * @param {Record<string, any> | undefined} signals `signals` del canal.
 * @returns {'yt_id' | 'iframe_url' | 'twitch_id' | null}
 */
export function pickEmbedFallback(signals) {
    if (!signals) return null;
    if (typeof signals.yt_id === 'string' && signals.yt_id) return 'yt_id';
    if (Array.isArray(signals.iframe_url) && signals.iframe_url.some(Boolean)) return 'iframe_url';
    if (typeof signals.twitch_id === 'string' && signals.twitch_id) return 'twitch_id';
    return null;
}
