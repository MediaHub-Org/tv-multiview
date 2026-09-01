import { CSS_CLASS_PRIMARY_BUTTON } from '../constants/index.js';
import { mostrarToast, obtenerNumeroCanalesFila } from './index.js';
import { buildErrorToastMessage, t } from '../i18n.js';

import {
    BOTONES_PERSONALIZAR_TRANSMISIONES_POR_FILA,
    CONTAINER_VISION_CUADRICULA,
} from '../main.js';

/**
 * Cambia el ancho de un canal quitando todas las clases `col-*` previas antes de
 * poner las nuevas: dos clases de columna a la vez dan un ancho impredecible.
 *
 * @param {HTMLElement} transmisionPorModifica Div del canal.
 * @param {string[]} clasesPorAñadir Clases a aplicar.
 * @returns {void}
 */
function AsignarClaseColumna(transmisionPorModifica, clasesPorAñadir) {
    if (!transmisionPorModifica || !clasesPorAñadir) return;
    const clasesAEliminar = [
        'col-12',
        'col-6',
        'col-4',
        'col-3',
        'col-2',
        'col-1',
        'col',
        'vh-100',
        'overflow-hidden',
    ];
    transmisionPorModifica.classList.remove(...clasesAEliminar);
    transmisionPorModifica.classList.add(...clasesPorAñadir);
}

/**
 * Reaplica a cada canal de la cuadrícula el ancho que toca según los canales por
 * fila elegidos y si está activo el modo de altura completa.
 *
 * En móvil el ancho lo decide el propio dispositivo, no el ajuste de escritorio.
 *
 * @returns {void}
 */
export function adjustChannelColumnCount() {
    try {
        if (typeof isMobile === 'undefined' || !CONTAINER_VISION_CUADRICULA) return;
        const transmisionesEnGrid = CONTAINER_VISION_CUADRICULA.querySelectorAll('div[data-canal]');
        const lsTransmisionesFila = localStorage.getItem('numero-class-columnas-por-fila');
        const uso100vh = localStorage.getItem('uso-100vh');
        const claseCienViewHeight = uso100vh === 'activo' ? ['vh-100', 'overflow-hidden'] : [];
        const containerVision = document.querySelector('#container-vision-cuadricula');
        if (!containerVision) return;
        if (uso100vh === 'activo') {
            containerVision.classList.add('h-100');
        } else {
            containerVision.classList.remove('h-100');
        }
        const numCanalesFila = obtenerNumeroCanalesFila();
        if (!lsTransmisionesFila || isNaN(Number(lsTransmisionesFila))) return;
        if (!isMobile.any) {
            if (transmisionesEnGrid.length < numCanalesFila && uso100vh !== 'activo') {
                for (let transmisionActiva of transmisionesEnGrid) {
                    const el = /** @type {HTMLElement} */ (transmisionActiva);
                    AsignarClaseColumna(el, [`col-${lsTransmisionesFila}`]);
                }
            } else if (transmisionesEnGrid.length < numCanalesFila) {
                for (let transmisionActiva of transmisionesEnGrid) {
                    const el = /** @type {HTMLElement} */ (transmisionActiva);
                    AsignarClaseColumna(el, ['col', ...claseCienViewHeight]);
                }
            } else {
                for (let transmisionActiva of transmisionesEnGrid) {
                    const el = /** @type {HTMLElement} */ (transmisionActiva);
                    AsignarClaseColumna(el, [`col-${lsTransmisionesFila}`]);
                    if (lsTransmisionesFila === '12' || lsTransmisionesFila === '6')
                        el.classList.add(...claseCienViewHeight);
                }
            }
        } else if (screen.orientation && screen.orientation.type === 'landscape-primary') {
            if (transmisionesEnGrid.length < numCanalesFila) {
                for (let transmisionActiva of transmisionesEnGrid) {
                    const el = /** @type {HTMLElement} */ (transmisionActiva);
                    AsignarClaseColumna(el, ['col', ...claseCienViewHeight]);
                }
            } else {
                for (let transmisionActiva of transmisionesEnGrid) {
                    const el = /** @type {HTMLElement} */ (transmisionActiva);
                    AsignarClaseColumna(el, [`col-${lsTransmisionesFila}`]);
                    if (lsTransmisionesFila === '12' || lsTransmisionesFila === '6')
                        el.classList.add(...claseCienViewHeight);
                }
            }
        } else {
            if (transmisionesEnGrid.length < numCanalesFila) {
                for (let transmisionActiva of transmisionesEnGrid) {
                    const el = /** @type {HTMLElement} */ (transmisionActiva);
                    AsignarClaseColumna(el, ['col', ...claseCienViewHeight]);
                }
            } else {
                for (let transmisionActiva of transmisionesEnGrid) {
                    const el = /** @type {HTMLElement} */ (transmisionActiva);
                    AsignarClaseColumna(el, [`col-${lsTransmisionesFila}`]);
                }
            }
        }
    } catch (error) {
        console.error('Error al ajustar clase "col" para canales activos: ', error);
        mostrarToast(
            buildErrorToastMessage(t('errorAdjustChannelsPerRow'), error),
            'danger',
            false,
        );
        return;
    }
}

/**
 * Marca el botón de "canales por fila" elegido, guarda el valor y redibuja los
 * anchos de la cuadrícula.
 *
 * @param {string|number} columnaValue Valor `col-*` de Bootstrap (12, 6, 4, 3, 2, 1).
 * @returns {void}
 */
export function ajustarClaseColTransmisionesPorFila(columnaValue) {
    const botonDejarActivo = document.querySelector(
        `#container-botones-personalizar-transmisiones-por-fila button[value='${columnaValue}']`,
    );
    if (!botonDejarActivo) return;
    BOTONES_PERSONALIZAR_TRANSMISIONES_POR_FILA.forEach((boton) => {
        boton.classList.replace(CSS_CLASS_PRIMARY_BUTTON, 'btn-light-subtle');
    });
    botonDejarActivo.classList.replace('btn-light-subtle', CSS_CLASS_PRIMARY_BUTTON);
    localStorage.setItem('numero-class-columnas-por-fila', String(columnaValue));
    adjustChannelColumnCount();
}
