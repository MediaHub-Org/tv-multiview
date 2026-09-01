import { listChannels } from '../channelsData.js';
import {
    CSS_CLASS_PRIMARY_BUTTON,
    COUNTRY_CODES,
    CHANNEL_CONTAINER_ID_PREFIXES,
} from '../constants/index.js';
import { filtrarCanalesPorInput, mostrarToast } from './index.js';
import { insertarDivError } from './helperInsertDivError.js';
import { buildErrorToastMessage, t } from '../i18n.js';

/**
 * Crea los botones de filtro por país a partir de los países que aparecen en el
 * catálogo, para no ofrecer filtros que no devuelven ningún canal.
 *
 * @returns {void}
 */
export function crearBotonesPaises() {
    try {
        const NUMERO_CANALES_CON_PAIS = Object.values(listChannels).map((canal) => {
            if (canal?.country !== '' && typeof canal.country === 'string') {
                return canal.country.toLowerCase();
            } else {
                return 'Desconocido';
            }
        });

        const PAISES_SIN_REPETIRSE = [...new Set(NUMERO_CANALES_CON_PAIS)];

        /** @type {Record<string, number>} */
        const CONTEO_NUMERO_CANALES_POR_PAIS = NUMERO_CANALES_CON_PAIS.reduce((conteo, country) => {
            const countryCode = /** @type {string} */ (country);
            const countryName = COUNTRY_CODES[countryCode] ?? 'Desconocido';
            conteo[countryName] = (conteo[countryName] || 0) + 1;
            return conteo;
        }, {});

        const PAISES_ORDENADOS = PAISES_SIN_REPETIRSE.filter(
            (country) => COUNTRY_CODES[/** @type {string} */ (country)],
        ).sort((a, b) => {
            const codigoA = COUNTRY_CODES[/** @type {string} */ (a)]?.toLowerCase() ?? '';
            const codigoB = COUNTRY_CODES[/** @type {string} */ (b)]?.toLowerCase() ?? '';
            return codigoA.localeCompare(codigoB);
        });

        const FRAGMENT_BOTONES_PAISES = document.createDocumentFragment();
        for (const PAIS of PAISES_ORDENADOS) {
            const paisKey = /** @type {string} */ (PAIS);
            if (COUNTRY_CODES[paisKey]) {
                let namePais = COUNTRY_CODES[paisKey];
                let cantidadCanales = CONTEO_NUMERO_CANALES_POR_PAIS[namePais] || 0;
                let botonPais = document.createElement('button');
                botonPais.setAttribute('type', 'button');
                botonPais.setAttribute('data-country', PAIS);
                botonPais.classList.add(
                    'btn',
                    'btn-outline-secondary',
                    'd-flex',
                    'justify-content-between',
                    'align-items-center',
                    'text-start',
                    'gap-2',
                    'w-100',
                    'm-0',
                    'rounded-3',
                );
                botonPais.innerHTML = `<span class="flex-grow-1">${namePais}</span>
                    <img src="https://flagcdn.com/${PAIS}.svg" alt="bandera ${namePais}" title="${namePais}" loading="lazy" decoding="async" class="svg-bandera rounded-1">
                    <span class="badge bg-secondary">${cantidadCanales}</span>`;
                FRAGMENT_BOTONES_PAISES.append(botonPais);
            }
        }

        if (!PAISES_ORDENADOS.includes('Desconocido')) {
            let cantidadDesconocido = CONTEO_NUMERO_CANALES_POR_PAIS['Desconocido'] || 0;
            let botonDesconocido = document.createElement('button');
            botonDesconocido.setAttribute('type', 'button');
            botonDesconocido.setAttribute('data-country', 'Desconocido');
            botonDesconocido.classList.add(
                'btn',
                'btn-outline-secondary',
                'd-flex',
                'justify-content-between',
                'align-items-center',
                'text-start',
                'gap-2',
                'w-100',
                'm-0',
                'rounded-3',
            );
            botonDesconocido.innerHTML = `<span class="flex-grow-1">${t('unknown')}</span><span class="badge bg-secondary">${cantidadDesconocido}</span>`;
            FRAGMENT_BOTONES_PAISES.prepend(botonDesconocido);
        }

        const BOTON_MOSTRAR_TODO_PAIS = document.createElement('button');
        BOTON_MOSTRAR_TODO_PAIS.setAttribute('type', 'button');
        BOTON_MOSTRAR_TODO_PAIS.dataset.country = 'all';
        BOTON_MOSTRAR_TODO_PAIS.classList.add(
            'btn',
            'btn-indigo',
            'd-flex',
            'justify-content-between',
            'align-items-center',
            'text-start',
            'gap-2',
            'w-100',
            'm-0',
            'rounded-3',
        );
        BOTON_MOSTRAR_TODO_PAIS.innerHTML = `<span class="flex-grow-1">${t('all')}</span><span class="badge bg-secondary">${Object.keys(listChannels).length}</span>`;
        FRAGMENT_BOTONES_PAISES.prepend(BOTON_MOSTRAR_TODO_PAIS);

        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            const contenedorBotonesFiltroPaises = document.querySelector(
                `#${PREFIJO}-collapse-botones-listado-filtro-countries`,
            );
            contenedorBotonesFiltroPaises.append(FRAGMENT_BOTONES_PAISES.cloneNode(true));
            contenedorBotonesFiltroPaises.querySelectorAll('button').forEach((botonPaisEnDom) => {
                botonPaisEnDom.addEventListener('click', () => {
                    try {
                        const country = botonPaisEnDom.dataset.country;
                        const countryKey = /** @type {string} */ (country);
                        let filtro =
                            COUNTRY_CODES[countryKey] ||
                            (countryKey === 'Desconocido'
                                ? 'Desconocido'
                                : countryKey === 'all'
                                  ? ''
                                  : '');

                        contenedorBotonesFiltroPaises
                            .querySelectorAll('button')
                            .forEach((boton) => {
                                boton.classList.replace(
                                    CSS_CLASS_PRIMARY_BUTTON,
                                    'btn-outline-secondary',
                                );
                            });
                        botonPaisEnDom.classList.replace(
                            'btn-outline-secondary',
                            CSS_CLASS_PRIMARY_BUTTON,
                        );
                        filtrarCanalesPorInput(
                            filtro,
                            document.querySelector(`#${PREFIJO}-body-botones-canales`),
                        );
                    } catch (error) {
                        contenedorBotonesFiltroPaises
                            .querySelectorAll('button')
                            .forEach((boton) => {
                                boton.classList.replace(
                                    CSS_CLASS_PRIMARY_BUTTON,
                                    'btn-outline-secondary',
                                );
                            });
                        contenedorBotonesFiltroPaises
                            .querySelector('button[data-country="all"]')
                            .classList.replace('btn-outline-secondary', CSS_CLASS_PRIMARY_BUTTON);
                        console.error(`Error al intentar activar filtro country. ${error}`);
                        mostrarToast(
                            buildErrorToastMessage(t('errorActivateCountryFilter'), error),
                            'danger',
                            false,
                        );
                        return;
                    }
                });
            });
        }
    } catch (error) {
        console.error(`Error durante creación botones para filtros countries. ${error}`);
        mostrarToast(
            buildErrorToastMessage(t('errorCreateCountryButtons'), error),
            'danger',
            false,
        );

        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            document
                .querySelector(`#${PREFIJO}-body-botones-canales`)
                .insertAdjacentElement(
                    'afterend',
                    insertarDivError(error, t('errorCreateCountryButtons')),
                );
        }
        return;
    }
}
