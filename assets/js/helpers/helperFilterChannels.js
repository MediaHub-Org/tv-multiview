import {
    CSS_CLASS_PRIMARY_BUTTON,
    CHANNEL_CONTAINER_ID_PREFIXES,
    COUNTRY_CODES,
} from '../constants/index.js';
import { mostrarToast } from './index.js';
import { buildErrorToastMessage, t } from '../i18n.js';

/**
 * Pasa a minúsculas y quita acentos para que "canal" encuentre "Canál".
 * @param {string|undefined|null} normalizarEsto
 * @returns {string}
 */
function normalizarInput(normalizarEsto) {
    return (
        normalizarEsto
            ?.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase() ?? ''
    );
}

/**
 * Muestra u oculta el aviso de "sin resultados" del contenedor.
 * @param {HTMLElement|null} elemento
 * @param {boolean} esOcultar
 * @param {string} textoQueNoFueEncontrado Búsqueda que no dio resultados.
 * @returns {void}
 */
function alertaNoCoincidencias(elemento, esOcultar, textoQueNoFueEncontrado) {
    if (!elemento) return;
    elemento.classList.toggle('d-none', esOcultar);
    const span = elemento.querySelector('span');
    if (span) span.textContent = textoQueNoFueEncontrado;
}

/**
 * Filtra los botones de canal por texto, respetando el filtro de país activo.
 *
 * Busca en nombre y país, sin acentos, para que la búsqueda funcione igual se
 * escriba como se escriba.
 *
 * @param {string} valorInput Texto tecleado por el usuario.
 * @param {HTMLElement} containerBotonesDeCanales Contenedor de botones a filtrar.
 * @returns {void}
 */
export function filtrarCanalesPorInput(valorInput, containerBotonesDeCanales) {
    try {
        if (!containerBotonesDeCanales) return;
        const ID_CONTENEDOR_BOTONES_CANALES = containerBotonesDeCanales.id;
        const INPUT_NORMALIZADO = normalizarInput(valorInput);
        const BOTONES_CANALES = containerBotonesDeCanales.querySelectorAll('button');
        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            if (ID_CONTENEDOR_BOTONES_CANALES.startsWith(PREFIJO)) {
                let booleanCoincidencia = false;
                let filtroPorPaisActivo = 'all';
                const botonesFiltroPorPais = document.querySelectorAll(
                    `#${PREFIJO}-collapse-botones-listado-filtro-countries button`,
                );
                botonesFiltroPorPais.forEach((boton) => {
                    const btn = /** @type {HTMLElement} */ (boton);
                    if (btn.classList.contains(CSS_CLASS_PRIMARY_BUTTON)) {
                        filtroPorPaisActivo =
                            COUNTRY_CODES[/** @type {string} */ (btn.dataset.country)] ??
                            btn.dataset.country;
                    }
                });
                BOTONES_CANALES.forEach((boton) => {
                    if (!boton) return;
                    const btn = /** @type {HTMLElement} */ (boton);
                    const contenidoBotonNormalizado = normalizarInput(
                        `${btn.dataset.country} - ${btn.textContent}`,
                    );
                    const esCoincidencia = contenidoBotonNormalizado.includes(INPUT_NORMALIZADO);
                    if (filtroPorPaisActivo !== 'all') {
                        if (btn.dataset.country === filtroPorPaisActivo) {
                            btn.classList.toggle('d-none', !esCoincidencia);
                            if (esCoincidencia) booleanCoincidencia = true;
                        } else {
                            btn.classList.add('d-none');
                        }
                    } else {
                        btn.classList.toggle('d-none', !esCoincidencia);
                        if (esCoincidencia) booleanCoincidencia = true;
                    }
                });
                const alerta = /** @type {HTMLElement|null} */ (
                    document.querySelector(`#${PREFIJO}-mensaje-alerta`)
                );
                alertaNoCoincidencias(alerta, booleanCoincidencia, INPUT_NORMALIZADO);
                break;
            }
        }
    } catch (error) {
        console.error(`Error durante filtrado canales. Error: ${error}`);
        mostrarToast(buildErrorToastMessage(t('errorFilterChannels'), error), 'danger');
        return;
    }
}
