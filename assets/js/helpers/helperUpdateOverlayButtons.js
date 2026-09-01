import {
    BOTONES_PERSONALIZAR_OVERLAY,
    CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY,
    SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY,
} from '../main.js';
import { mostrarToast, setCheckboxState, hideTextoBotonesOverlay } from '../helpers/index.js';
import { buildErrorToastMessage, getVisibilityLabel, t } from '../i18n.js';

/**
 * Sincroniza los checkboxes de "qué botones muestra el overlay" con lo guardado
 * y aplica las clases correspondientes al `body`.
 *
 * El interruptor general manda: con el overlay oculto, los checkboxes de cada
 * botón se deshabilitan en vez de dejar activar algo que no se va a ver.
 *
 * @returns {void}
 */
export function actualizarBotonesPersonalizarOverlay() {
    try {
        BOTONES_PERSONALIZAR_OVERLAY.forEach((contenedorBoton) => {
            let botonIndividual = /** @type {HTMLInputElement} */ (
                contenedorBoton.querySelector('.btn-check')
            );
            let datasetBoton = botonIndividual.dataset.botonoverlay;
            let spanValorBoton = contenedorBoton.querySelector('span');

            if (localStorage.getItem('overlay-display') !== 'hide') {
                botonIndividual.disabled = false;
                document.body.classList.remove('d-none__barras-overlay');
                setCheckboxState(
                    /** @type {HTMLInputElement} */ (CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY),
                    /** @type {HTMLElement} */ (
                        SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY
                    ),
                    'overlay-display',
                    true,
                );
                if (localStorage.getItem(`${datasetBoton}`) === 'hide') {
                    botonIndividual.checked = false;
                    spanValorBoton.innerHTML = getVisibilityLabel(false);
                    document.body.classList.add(`d-none__barras-overlay__${datasetBoton}`);
                } else {
                    botonIndividual.checked = true;
                    spanValorBoton.innerHTML = getVisibilityLabel(true);
                    document.body.classList.remove(`d-none__barras-overlay__${datasetBoton}`);
                }
            } else {
                botonIndividual.checked = false;
                botonIndividual.disabled = true;
                spanValorBoton.innerHTML = getVisibilityLabel(false);
                document.body.classList.add('d-none__barras-overlay');
                setCheckboxState(
                    /** @type {HTMLInputElement} */ (CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY),
                    /** @type {HTMLElement} */ (
                        SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY
                    ),
                    'overlay-display',
                    false,
                );
            }

            hideTextoBotonesOverlay(); // siempre al final. Evalúa si botones overlay están haciendo desbordamiento
        });
    } catch (error) {
        console.error(
            `Error durante actualización estado botones personalizar overlay. Error: ${error}`,
        );
        mostrarToast(
            buildErrorToastMessage(t('errorUpdateOverlayButtons'), error),
            'danger',
            false,
        );
        return;
    }
}
