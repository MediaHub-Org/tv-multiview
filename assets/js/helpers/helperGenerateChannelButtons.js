import { listChannels } from '../channelsData.js';
import {
    CSS_CLASS_SECONDARY_BUTTON,
    COUNTRY_CODES,
    CATEGORY_ICONS,
    CHANNEL_CONTAINER_ID_PREFIXES,
} from '../constants/index.js';
import { CONTAINER_VIDEO_VISION_UNICA, tele } from '../main.js';
import { mostrarToast, revisarSeñalesVacias, guardarOrdenOriginal } from './index.js';
import { insertarDivError } from './helperInsertDivError.js';
import { escapeHtml } from './helperEscape.js';
import { buildErrorToastMessage, t } from '../i18n.js';

/**
 * Pinta un botón por canal del catálogo en cada contenedor que los usa (modal,
 * offcanvas, cambiar canal y visión única).
 *
 * @returns {void}
 */
export function crearBotonesParaCanales() {
    try {
        const FRAGMENT_BOTONES_CANALES = document.createDocumentFragment();
        for (const canal of Object.keys(listChannels)) {
            let { name, /* logo, */ country, category } = listChannels[canal];
            category = typeof category === 'string' ? category.toLowerCase() : '';
            let iconoCategoria =
                category && category in CATEGORY_ICONS
                    ? CATEGORY_ICONS[category]
                    : '<i class="bi bi-tv"></i>';
            let namePais =
                country && typeof country === 'string' && COUNTRY_CODES[country.toLowerCase()]
                    ? COUNTRY_CODES[country.toLowerCase()]
                    : t('unknown');

            let botonCanal = document.createElement('button');
            botonCanal.setAttribute('data-canal', canal);
            botonCanal.setAttribute('data-country', `${namePais}`);
            botonCanal.classList.add(
                'btn',
                CSS_CLASS_SECONDARY_BUTTON,
                'd-flex',
                'justify-content-between',
                'align-items-center',
                'gap-2',
                'text-start',
                'rounded-3',
            );
            if (revisarSeñalesVacias(canal)) botonCanal.classList.add('d-none');
            const insiggniaIptv =
                listChannels[canal].iptv === true
                    ? `<span class="badge text-bg-warning ms-1" title="${t('iptvBadge')}">IPTV</span>`
                    : '';
            botonCanal.innerHTML = `<span class="flex-grow-1">${escapeHtml(name)}${insiggniaIptv}</span>
                    ${country && typeof country === 'string' && COUNTRY_CODES[country.toLowerCase()] ? `<img src="https://flagcdn.com/${country.toLowerCase()}.svg" alt="bandera ${namePais}" title="${namePais}" loading="lazy" decoding="async" class="svg-bandera rounded-1">` : ''}
                    ${iconoCategoria ? `${iconoCategoria}` : ''}`;
            // ${logo ? `<img src="${logo}" alt="logo ${name}" title="logo ${name}" class="img-logos rounded-1">` : ''}
            FRAGMENT_BOTONES_CANALES.append(botonCanal);
        }

        document
            .querySelector('#modal-canales-body-botones-canales')
            .append(FRAGMENT_BOTONES_CANALES.cloneNode(true));
        document
            .querySelector('#offcanvas-canales-body-botones-canales')
            .append(FRAGMENT_BOTONES_CANALES.cloneNode(true));
        document
            .querySelector('#modal-cambiar-canal-body-botones-canales')
            .append(FRAGMENT_BOTONES_CANALES.cloneNode(true));
        document
            .querySelector('#vision-unica-body-botones-canales')
            .append(FRAGMENT_BOTONES_CANALES.cloneNode(true));

        // Asignar eventos después de que los botones estén en el DOM
        document
            .querySelectorAll(
                '#modal-canales-body-botones-canales button, #offcanvas-canales-body-botones-canales button',
            )
            .forEach((botonCanalEnDOM) => {
                const btn = /** @type {HTMLElement} */ (botonCanalEnDOM);
                btn.addEventListener('click', () => {
                    const accionBoton = btn.classList.contains(CSS_CLASS_SECONDARY_BUTTON)
                        ? 'add'
                        : 'remove';
                    tele[accionBoton](btn.dataset.canal);
                });
            });

        document
            .querySelectorAll('#modal-cambiar-canal-body-botones-canales button')
            .forEach((botonCanalEnDOM) => {
                const btn = /** @type {HTMLElement} */ (botonCanalEnDOM);
                btn.setAttribute('data-bs-dismiss', 'modal');
            });

        document
            .querySelectorAll('#vision-unica-body-botones-canales button')
            .forEach((botonCanalEnDOM) => {
                const btn = /** @type {HTMLElement} */ (botonCanalEnDOM);
                btn.addEventListener('click', () => {
                    if (CONTAINER_VIDEO_VISION_UNICA.querySelector('div[data-canal]')) {
                        tele.remove(
                            /** @type {HTMLElement} */ (
                                CONTAINER_VIDEO_VISION_UNICA.querySelector('div[data-canal]')
                            ).dataset.canal,
                        );
                    }

                    const accionBoton = btn.classList.contains(CSS_CLASS_SECONDARY_BUTTON)
                        ? 'add'
                        : 'remove';
                    tele[accionBoton](btn.dataset.canal);
                });
            });

        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            guardarOrdenOriginal(`${PREFIJO}-body-botones-canales`);
        }
    } catch (error) {
        console.error(`Error durante creación botones para canales. Error: ${error}`);
        mostrarToast(
            buildErrorToastMessage(t('errorCreateChannelButtons'), error),
            'danger',
            false,
        );

        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            document
                .querySelector(`#${PREFIJO}-body-botones-canales`)
                .insertAdjacentElement(
                    'afterend',
                    insertarDivError(error, t('errorCreateChannelButtons')),
                );
        }
    }
}
