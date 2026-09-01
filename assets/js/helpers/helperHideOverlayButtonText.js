/**
 * Deja solo los iconos en la barra overlay de cada canal cuando los botones con
 * texto ya no caben a lo ancho.
 *
 * Antes de medir vuelve a mostrar el texto: si midiera con el texto oculto,
 * jamás volvería a caber y los rótulos no reaparecerían al agrandar la ventana.
 *
 * @returns {void}
 */
export function hideTextoBotonesOverlay() {
    const BARRAS_OVERLAY = document.querySelectorAll('.barra-overlay');
    BARRAS_OVERLAY.forEach((overlay) => {
        const overl = /** @type {HTMLElement} */ (overlay);
        if (!overl) return;
        const BOTONES_DENTRO_BARRA_OVERLAY = overl.querySelectorAll('.btn');
        const TEXTO_BOTONES_DENTRO_BARRA_OVERLAY = overl.querySelectorAll(
            'span:not(.dropdown-item span)',
        );

        // siempre activa texto antes de ocultarlo para tomar tamaño total, no solo del icono
        TEXTO_BOTONES_DENTRO_BARRA_OVERLAY.forEach((span) => {
            const sp = /** @type {HTMLElement} */ (span);
            if (sp && sp.style.display !== 'inline') sp.style.display = 'inline';
        });

        const overlayWidth = Math.floor(overl.offsetWidth);
        let botonesWidth = 0;

        BOTONES_DENTRO_BARRA_OVERLAY.forEach((button) => {
            if (!button) return;
            const rect = button.getBoundingClientRect();
            botonesWidth += Math.floor(rect.width) + 8; // Convertir a entero usando Math.floor() junto a 8px extra para omitir que sea justo el tamaño
        });

        const ocultar = botonesWidth >= overlayWidth;
        TEXTO_BOTONES_DENTRO_BARRA_OVERLAY.forEach((span) => {
            const sp = /** @type {HTMLElement} */ (span);
            if (!sp) return;
            if (ocultar && sp.style.display !== 'none') {
                sp.style.display = 'none';
            } else if (!ocultar && sp.style.display !== 'inline') {
                sp.style.display = 'inline';
            }
        });
    });
}
