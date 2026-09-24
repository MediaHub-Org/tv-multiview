/**
 * Distingue un rechazo de `play()` que significa "el stream no sirve" de uno que
 * solo significa "no se pudo reproducir *ahora*".
 * @module helperPlayRejection
 */

// AbortError: el play() se interrumpió (pause() del IntersectionObserver al quedar el
// tile fuera de vista, o un cambio de fuente). NotAllowedError: el navegador bloqueó
// el autoplay. En ambos el stream puede estar perfecto: el usuario lo arranca con el
// botón de play. Los fallos reales del stream llegan por el evento 'error' del player.
const BENIGN_PLAY_REJECTIONS = new Set(['AbortError', 'NotAllowedError']);

/**
 * @param {unknown} error Motivo del rechazo de `player.play()`.
 * @returns {boolean} true si el rechazo NO indica un stream roto.
 */
export function isBenignPlayRejection(error) {
    const name = /** @type {{ name?: unknown } | null} */ (error)?.name;
    return typeof name === 'string' && BENIGN_PLAY_REJECTIONS.has(name);
}
