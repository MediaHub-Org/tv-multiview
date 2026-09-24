/**
 * Encaja la cuadrícula de canales en el alto disponible para que la página nunca
 * tenga scroll: todas las filas caben siempre en pantalla.
 *
 * - Modo altura completa (`uso-100vh` activo): las filas se reparten el alto.
 * - Modo 16:9: cada tile mantiene la proporción y la cuadrícula se estrecha y se
 *   centra cuando las filas no cabrían a lo ancho completo.
 *
 * @module helperFitGrid
 */

const ASPECT = 16 / 9;

/**
 * Cálculo puro del tamaño de tile (sin DOM, testeable).
 *
 * @param {{ count: number, cols: number, width: number, height: number, keepAspect: boolean }} opts
 * @returns {{ rows: number, tileWidth: number, tileHeight: number, gridWidth: number }}
 */
export function computeGridFit({ count, cols, width, height, keepAspect }) {
    const safeCols = Math.max(1, Math.min(cols || 1, Math.max(count, 1)));
    const rows = Math.max(1, Math.ceil(Math.max(count, 1) / safeCols));
    const rowHeight = height / rows;
    if (!keepAspect) {
        return { rows, tileWidth: width / safeCols, tileHeight: rowHeight, gridWidth: width };
    }
    const tileWidth = Math.min(width / safeCols, rowHeight * ASPECT);
    return {
        rows,
        tileWidth,
        tileHeight: tileWidth / ASPECT,
        gridWidth: tileWidth * safeCols,
    };
}

/**
 * Columnas efectivas según la clase `col-*` que la cuadrícula ya asignó al tile.
 * `col` sin número reparte una sola fila entre todos los canales.
 *
 * @param {Element} tile
 * @param {number} count
 * @returns {number}
 */
function columnsFromTile(tile, count) {
    for (const cls of tile.classList) {
        const match = /^col-(\d+)$/.exec(cls);
        if (match) return Math.round(12 / Number(match[1]));
    }
    return count;
}

/**
 * Aplica el ajuste a `#container-vision-cuadricula` con el tamaño actual de su
 * contenedor. Seguro de llamar en cada resize o cambio de canales.
 *
 * @returns {void}
 */
export function fitGridToViewport() {
    const grid = /** @type {HTMLElement | null} */ (
        document.querySelector('#container-vision-cuadricula')
    );
    const shell = grid?.parentElement;
    if (!grid || !shell) return;
    const tiles = grid.querySelectorAll('div[data-canal]');
    if (!tiles.length) {
        grid.style.removeProperty('--tile-h');
        grid.style.removeProperty('max-width');
        return;
    }
    const { tileHeight, gridWidth } = computeGridFit({
        count: tiles.length,
        cols: columnsFromTile(tiles[0], tiles.length),
        width: shell.clientWidth,
        height: shell.clientHeight,
        keepAspect: localStorage.getItem('uso-100vh') !== 'activo',
    });
    grid.style.setProperty('--tile-h', `${Math.floor(tileHeight)}px`);
    grid.style.maxWidth = `${Math.floor(gridWidth)}px`;
}
