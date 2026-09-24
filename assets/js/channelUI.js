// Funciones para crear overlays y fragmentos de canal
import { listChannels } from './channelsData.js';
import { LABEL_MODAL_CAMBIAR_CANAL, MODAL_CAMBIAR_CANAL, tele } from './main.js';
import { COUNTRY_CODES, CATEGORY_ICONS, AUDIO_POP, TWITCH_BASE_URL } from './constants/index.js';
import {
    mostrarToast,
    playAudioSinDelay,
    hideTextoBotonesOverlay,
    activarTooltipsBootstrap,
    readStoredObject,
    enableKeyboardReorder,
    escapeHtml,
    safeHttpUrl,
} from './helpers/index.js';
import { acquirePlayerSlotHandle } from './helpers/helperPlayerSlots.js';
import { buildErrorToastMessage, t } from './i18n.js';

// Funciones de UI de canales extraídas de main.js
/**
 * @param {string} canalId
 * @param {string} señalUtilizar
 * @param {number} indexSeñalUtilizar
 * @returns {void}
 */
function savePreferredSignal(canalId, señalUtilizar = '', indexSeñalUtilizar = 0) {
    let lsPreferenciasSeñalCanales = readStoredObject('preferencia-señal-canales');
    lsPreferenciasSeñalCanales[canalId] = { [señalUtilizar]: indexSeñalUtilizar };
    localStorage.setItem('preferencia-señal-canales', JSON.stringify(lsPreferenciasSeñalCanales));
}

/**
 * @param {string} signalKey
 * @returns {string}
 */
function getSignalTypeLabel(signalKey) {
    if (signalKey.startsWith('iframe_')) return 'web';
    if (signalKey.startsWith('m3u8_')) return 'm3u8';
    if (signalKey.startsWith('yt_')) return 'youtube';
    if (signalKey.startsWith('twitch_')) return 'twitch';
    return signalKey.replace('_', ' ');
}

// URLs de streams con token/firma de expiración (Akamai hdntl/hdnts, CloudFront signature, etc.)
const TOKEN_PARAM_PATTERN = /[?&](?:hdntl|hdnts|token|signature|sig|auth|exp)=/i;

/**
 * @param {string} url
 * @returns {boolean}
 */
function isMixedContent(url) {
    return location.protocol === 'https:' && url.startsWith('http://');
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function hasTokenParam(url) {
    return TOKEN_PARAM_PATTERN.test(url);
}

// El navegador oculta a JS el motivo real de un fallo cross-origin (CORS vs red/DNS/timeout
// son indistinguibles vía fetch/XHR por diseño de seguridad). Esta sonda en modo 'no-cors'
// solo distingue "el servidor respondió algo" (bloqueo CORS) de "no se pudo ni conectar" (red).
/**
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function isReachableIgnoringCors(url) {
    try {
        await fetch(url, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(6000) });
        return true;
    } catch {
        return false;
    }
}

// Clasifica el fallo de un player para mostrar al usuario una razón útil en vez de un
// MEDIA_ERR_SRC_NOT_SUPPORTED genérico. Ver nota arriba sobre los límites reales de CORS en JS.
/**
 * @param {any} player
 * @param {string} urlCarga
 * @returns {Promise<string>}
 */
async function classifyStreamError(player, urlCarga) {
    if (isMixedContent(urlCarga)) return 'mixed-content';

    const codigoError = player.error()?.code;
    const yaHuboDatosEnBuffer = player.buffered().length > 0;
    // MEDIA_ERR_NETWORK (2) con datos ya buffereados = falló un segmento a mitad de
    // reproducción (404/timeout de un .ts), no la carga inicial del stream.
    if (codigoError === 2 && yaHuboDatosEnBuffer) return 'segment-error';

    const alcanzable = await isReachableIgnoringCors(urlCarga);
    if (alcanzable) return 'cors-blocked';
    return hasTokenParam(urlCarga) ? 'expired-token' : 'network-error';
}

/** @type {Record<string, { icon: string; labelKey: string }>} */
const STREAM_ERROR_PRESENTATION = {
    'mixed-content': { icon: 'bi-shield-exclamation', labelKey: 'streamErrorMixedContent' },
    'cors-blocked': { icon: 'bi-slash-circle', labelKey: 'streamErrorCorsBlocked' },
    'segment-error': { icon: 'bi-hourglass-split', labelKey: 'streamErrorSegment' },
    'expired-token': { icon: 'bi-key', labelKey: 'streamErrorTokenExpired' },
    'network-error': { icon: 'bi-wifi-off', labelKey: 'streamErrorNetwork' },
};

// Algunos mirrors aceptan la conexión y nunca responden: ni error ni datos, readyState
// se queda en 0 para siempre. Sin este timeout ese player nunca libera su cupo (ver
// helperPlayerSlots) y el resto de la cola espera un turno que no llega nunca.
export const STREAM_LOAD_TIMEOUT_MS = 15000;

/**
 * @param {string} canalId
 * @param {string} tipoSeñalParaIframe
 * @param {number|string} valorIndex
 * @returns {HTMLDivElement}
 */
export function generateStreamIframe(canalId, tipoSeñalParaIframe, valorIndex = 0) {
    valorIndex = Number(valorIndex);
    const DIV_ELEMENT = document.createElement('div');
    DIV_ELEMENT.classList.add('ratio', 'ratio-16x9', 'h-100');
    DIV_ELEMENT.setAttribute('data-canal-cambio', canalId);
    const { name, signals } = listChannels[canalId];

    /** @type {Record<string, string | undefined>} */
    const URL_POR_TIPO_SEÑAL = {
        iframe_url: signals.iframe_url && signals.iframe_url[valorIndex],
        yt_id:
            signals.yt_id &&
            `https://www.youtube-nocookie.com/embed/live_stream?channel=${signals.yt_id}&autoplay=1&mute=1&modestbranding=1&vq=medium&showinfo=0`,
        yt_embed:
            signals.yt_embed &&
            `https://www.youtube-nocookie.com/embed/${signals.yt_embed}?autoplay=1&mute=1&modestbranding=1&showinfo=0`,
        yt_playlist:
            signals.yt_playlist &&
            `https://www.youtube-nocookie.com/embed/videoseries?list=${signals.yt_playlist}&autoplay=0&mute=0&modestbranding=1&showinfo=0`,
        twitch_id:
            signals.twitch_id &&
            `https://player.twitch.tv/?channel=${signals.twitch_id}&parent=${TWITCH_BASE_URL}`,
    };

    const IFRAME_ELEMENT = document.createElement('iframe');
    IFRAME_ELEMENT.src = URL_POR_TIPO_SEÑAL[tipoSeñalParaIframe];
    IFRAME_ELEMENT.classList.add('pe-auto');
    IFRAME_ELEMENT.setAttribute('contenedor-canal-cambio', canalId);
    IFRAME_ELEMENT.allowFullscreen = true;
    IFRAME_ELEMENT.title = name;
    IFRAME_ELEMENT.referrerPolicy = 'no-referrer';

    DIV_ELEMENT.append(IFRAME_ELEMENT);
    return DIV_ELEMENT;
}

/**
 * @param {string} canalId
 * @param {string|undefined} urlCarga
 * @returns {HTMLDivElement}
 */
export function createVideoPlayer(canalId, urlCarga) {
    const DIV_ELEMENT = document.createElement('div');
    DIV_ELEMENT.setAttribute('data-canal-cambio', canalId);
    DIV_ELEMENT.classList.add('ratio', 'ratio-16x9', 'h-100');

    const buildFallbackMarkup = (icon = 'bi-camera-video-off', label = t('streamUnavailable')) => `
        <div class="d-flex flex-column justify-content-center align-items-center h-100 w-100 text-center text-body-secondary bg-dark-subtle rounded-3 border border-light-subtle p-3">
            <i class="bi ${icon} display-5 mb-2"></i>
            <div class="fw-semibold">${canalId}</div>
            <div class="small opacity-75">${label}</div>
        </div>
    `;
    const fallbackMarkup = buildFallbackMarkup();

    const videoElement = document.createElement('video');
    videoElement.id = `video-${canalId}`;
    videoElement.setAttribute('contenedor-canal-cambio', canalId);
    videoElement.classList.add(
        'position-absolute',
        'p-0',
        'video-js',
        'vjs-fill',
        'overflow-hidden',
    );
    videoElement.toggleAttribute('controls');
    videoElement.setAttribute('playsinline', '');
    DIV_ELEMENT.append(videoElement);

    if (!urlCarga || typeof urlCarga !== 'string' || !urlCarga.trim()) {
        DIV_ELEMENT.innerHTML = fallbackMarkup;
        return DIV_ELEMENT;
    }

    // http:// nunca carga en una página https (mixed content bloqueado por el navegador):
    // ni siquiera vale la pena instanciar video.js ni pedir la playlist.
    if (isMixedContent(urlCarga)) {
        const presentacion = STREAM_ERROR_PRESENTATION['mixed-content'];
        console.warn(`Mixed content bloqueado para canal "${canalId}". Source: ${urlCarga}`);
        DIV_ELEMENT.innerHTML = buildFallbackMarkup(presentacion.icon, t(presentacion.labelKey));
        return DIV_ELEMENT;
    }

    // El caller adjunta DIV_ELEMENT al DOM justo después de que esta función retorna
    // (mismo tick síncrono). Diferimos la instanciación de video.js a un microtask para
    // que el <video> ya esté en el documento y evitar el warning "element supplied is
    // not included in the DOM". Si el canal fue removido antes de que corra (add+remove
    // muy rápido), no hacemos nada: no hay nada que disponer.
    queueMicrotask(async () => {
        if (!document.body.contains(videoElement)) return;

        // Espera turno si ya hay MAX_CONCURRENT_PLAYERS cargando: instanciar video.js sobre
        // todos los canales a la vez es lo que hace que play() rechace por contención de
        // recursos, no que el stream esté caído.
        const slot = await acquirePlayerSlotHandle();
        if (!document.body.contains(videoElement)) {
            slot.release();
            return;
        }

        const player = videojs(videoElement, {
            controls: true,
            preload: 'metadata',
            // The parent .ratio.ratio-16x9 already sizes the box — the player only needs
            // to fill it. `fluid: true` would fight that: it forces video.js's own
            // padding-top aspect-ratio technique, which never computed a value here and
            // left the player at height:0 while it kept decoding and playing invisibly.
            fill: true,
            autoplay: false,
            muted: true,
            html5: { vhs: { enableLowInitialPlaylist: true } },
        });

        // Si el m3u8 falla (CORS, servidor caído, timeout, etc.) y el canal tiene un yt_id
        // de respaldo, lo usamos automáticamente en vez de mostrar solo un error: un embed
        // de YouTube es un iframe, nunca pega contra los mismos bloqueos de CORS/hotlink.
        // Siempre dispone el player: ya no se va a usar, sea cual sea el desenlace.
        /** @param {string} [tipoError] */
        const fallbackToYoutubeOrShowError = (tipoError) => {
            clearTimeout(loadTimeoutId);
            // Un mismo fallo llega por dos vías (el evento 'error' y el rechazo de
            // play(), o el timeout): disponer dos veces el mismo player lanza
            // "Invalid target for null#trigger" dentro de video.js.
            if (player.isDisposed()) return;
            player.dispose();
            const ytId = listChannels[canalId]?.signals?.yt_id;
            if (ytId) {
                DIV_ELEMENT.replaceWith(generateStreamIframe(canalId, 'yt_id'));
                return;
            }
            const presentacion = STREAM_ERROR_PRESENTATION[tipoError];
            DIV_ELEMENT.innerHTML = presentacion
                ? buildFallbackMarkup(presentacion.icon, t(presentacion.labelKey))
                : fallbackMarkup;
        };

        const loadTimeoutId = setTimeout(() => {
            console.warn(`Timeout de carga para canal "${canalId}". Source: ${urlCarga}`);
            slot.release();
            fallbackToYoutubeOrShowError('network-error');
        }, STREAM_LOAD_TIMEOUT_MS);

        player.on('dispose', () => {
            clearTimeout(loadTimeoutId);
            slot.release();
        });
        // El cupo limita cuántos players *cargan* a la vez, no cuántos reproducen: la
        // contención de recursos está en arrancar el stream. Si el cupo se mantuviera
        // mientras el canal se ve bien, con más canales sanos que cupos los últimos de
        // la cola no arrancarían nunca (7 canales buenos con 6 cupos = uno en negro).
        player.on('loadeddata', () => {
            clearTimeout(loadTimeoutId);
            slot.release();
        });

        player.on('error', async () => {
            slot.release();
            const tipoError = await classifyStreamError(player, urlCarga);
            console.warn(
                `Video.js error for channel "${canalId}" [${tipoError}]. Source: ${urlCarga}`,
            );
            fallbackToYoutubeOrShowError(tipoError);
        });

        player.src({
            src: urlCarga,
            type: 'application/x-mpegURL',
        });

        player.ready(() => {
            player.play().catch(() => {
                slot.release();
                fallbackToYoutubeOrShowError();
            });
        });
    });

    return DIV_ELEMENT;
}

// Pausa/reanuda un canal ya instanciado según esté o no en viewport (llamado por el
// IntersectionObserver de observer.js). Nunca reanuda un player que el usuario pausó
// a mano: solo retoma los que nosotros mismos pausamos por salir de vista.
/**
 * @param {string} canalId
 * @param {boolean} isVisible
 * @returns {void}
 */
export function setPlayerVisibility(canalId, isVisible) {
    const videoElement = document.querySelector(
        `div[data-canal="${canalId}"] video, div[data-canal="${canalId}"] .vjs-tech`,
    );
    if (!videoElement) return;
    const player = videojs.getPlayer(videoElement);
    if (!player) return;

    if (!isVisible) {
        if (!player.paused()) {
            player.__autoPausedByVisibility = true;
            player.pause();
        }
        return;
    }

    if (player.__autoPausedByVisibility) {
        player.__autoPausedByVisibility = false;
        player.play().catch(() => {});
    }
}

// Busca el <video> de video.js dentro de un contenedor de canal y lo dispone,
// si existe. Evita fugas de memoria y requests HLS colgados al remover o
// reemplazar un canal/señal sin destruir el player anterior.
/**
 * @param {Element|undefined} containerDiv
 * @returns {void}
 */
export function disposeVideoPlayer(containerDiv) {
    const videoElement = containerDiv?.querySelector('video');
    if (!videoElement) return;
    const player = videojs.getPlayer(videoElement);
    if (player && typeof player.dispose === 'function') {
        player.dispose();
    }
}

/**
 * @param {string} canalId
 * @param {string} tipoSeñalCargada
 * @param {number|string} valorIndex
 * @returns {DocumentFragment|undefined}
 */
export function createChannelOverlay(canalId, tipoSeñalCargada, valorIndex = 0) {
    try {
        let { name = 'Nombre Canal', signals, website, country, category } = listChannels[canalId];

        valorIndex = Number(valorIndex);
        category = typeof category === 'string' ? category.toLowerCase() : '';
        let iconoCategoria =
            typeof category === 'string' && category in CATEGORY_ICONS
                ? CATEGORY_ICONS[category]
                : '<i class="bi bi-tv"></i>';

        const FRAGMENT_OVERLAY = document.createDocumentFragment();
        const DIV_ELEMENT = document.createElement('div');
        DIV_ELEMENT.id = `overlay-de-canal-${canalId}`;
        DIV_ELEMENT.classList.add(
            'position-absolute',
            'w-100',
            'h-100',
            'bg-transparent',
            'pe-none',
            'me-1',
            'd-flex',
            'gap-2',
            'justify-content-end',
            'align-items-start',
            'align-content-start',
            'flex-wrap',
            'top-0',
            'end-0',
            'barra-overlay',
        );

        const BOTON_SELECCIONAR_SEÑAL_CANAL = document.createElement('button');
        BOTON_SELECCIONAR_SEÑAL_CANAL.id = 'overlay-boton-selecionar-señal';
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('type', 'button');
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('aria-label', t('selectDifferentSignal'));
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('title', t('selectDifferentSignal'));
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('data-bs-toggle', 'dropdown');
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('aria-expanded', 'false');

        BOTON_SELECCIONAR_SEÑAL_CANAL.innerHTML = `<span>${t('selectSignal')}</span><i class="bi bi-collection" data-bs-toggle="tooltip" data-bs-title="${t('selectDifferentSignal')}"></i>`;
        BOTON_SELECCIONAR_SEÑAL_CANAL.classList.add(
            'btn',
            'btn-sm',
            'btn-dark-subtle',
            'dropdown-toggle',
            'd-flex',
            'justify-content-center',
            'align-items-center',
            'gap-1',
            'p-0',
            'px-1',
            'pe-auto',
            'mt-1',
            'rounded-3',
        );

        const DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL = document.createElement('ul');
        DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.classList.add('dropdown-menu');

        for (const key in signals) {
            let iconoSeñal = '<i class="bi bi-globe"></i>';
            if (key.startsWith('iframe_')) {
                iconoSeñal = '<i class="bi bi-globe"></i>';
            } else if (key.startsWith('m3u8_')) {
                iconoSeñal = '<i class="bi bi-play-btn"></i>';
            } else if (key.startsWith('yt_')) {
                iconoSeñal = '<i class="bi bi-youtube"></i>';
            } else if (key.startsWith('twitch_')) {
                iconoSeñal = '<i class="bi bi-twitch"></i>';
            }

            const value = signals[key];
            if (Array.isArray(value) && value.length > 0) {
                value.forEach((url, index) => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('dropdown-item', 'pe-auto', 'py-2', 'user-select-none');
                    if (tipoSeñalCargada === key && valorIndex === index)
                        listItem.classList.add('bg-indigo', 'fw-bold');
                    listItem.innerHTML =
                        value.length === 1
                            ? `${iconoSeñal} ${getSignalTypeLabel(key)}`
                            : `${iconoSeñal} ${getSignalTypeLabel(key)} <span class="fst-italic">${index}</span>`;
                    listItem.addEventListener('click', () => {
                        DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.querySelectorAll(
                            '.dropdown-item',
                        ).forEach((item) => {
                            item.classList.remove('bg-indigo', 'fw-bold');
                        });
                        listItem.classList.add('bg-indigo', 'fw-bold');
                        savePreferredSignal(canalId, key.toString(), Number(index));
                        updateActiveSignal(canalId);
                    });
                    DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.append(listItem);
                });
            } else if (typeof value === 'string' && value !== '') {
                const listItem = document.createElement('li');
                listItem.classList.add('dropdown-item', 'pe-auto', 'py-2', 'user-select-none');
                if (tipoSeñalCargada === key) listItem.classList.add('bg-indigo', 'fw-bold');
                listItem.innerHTML = `${iconoSeñal} ${getSignalTypeLabel(key)}`;
                listItem.addEventListener('click', () => {
                    DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.querySelectorAll(
                        '.dropdown-item',
                    ).forEach((item) => {
                        item.classList.remove('bg-indigo', 'fw-bold');
                    });
                    listItem.classList.add('bg-indigo', 'fw-bold');
                    savePreferredSignal(canalId, key.toString());
                    updateActiveSignal(canalId);
                });
                DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.append(listItem);
            }
        }

        const MOVE_CHANNEL_BUTTON = document.createElement('button');
        MOVE_CHANNEL_BUTTON.id = 'overlay-boton-mover';
        MOVE_CHANNEL_BUTTON.setAttribute('type', 'button');
        MOVE_CHANNEL_BUTTON.setAttribute('aria-label', t('moveChannel'));
        MOVE_CHANNEL_BUTTON.setAttribute('title', t('moveChannel'));
        MOVE_CHANNEL_BUTTON.setAttribute('data-bs-toggle', 'tooltip');
        MOVE_CHANNEL_BUTTON.setAttribute('data-bs-title', t('moveChannel'));
        MOVE_CHANNEL_BUTTON.innerHTML = `<span>${t('move')}</span><i class="bi bi-arrows-move"></i>`;
        MOVE_CHANNEL_BUTTON.classList.add(
            'btn',
            'btn-sm',
            'btn-dark-subtle',
            'p-0',
            'px-1',
            'd-flex',
            'gap-1',
            'pe-auto',
            'mt-1',
            'rounded-3',
            'clase-para-mover',
        );
        // Sortable.js solo escucha el puntero; las flechas cubren el mismo gesto
        // para quien navega con teclado.
        enableKeyboardReorder(MOVE_CHANNEL_BUTTON);

        const CHANGE_CHANNEL_BUTTON = document.createElement('button');
        CHANGE_CHANNEL_BUTTON.id = 'overlay-boton-cambiar';
        CHANGE_CHANNEL_BUTTON.setAttribute('type', 'button');
        CHANGE_CHANNEL_BUTTON.setAttribute('aria-label', t('changeChannel'));
        CHANGE_CHANNEL_BUTTON.setAttribute('title', t('changeChannel'));
        CHANGE_CHANNEL_BUTTON.setAttribute('data-bs-toggle', 'tooltip');
        CHANGE_CHANNEL_BUTTON.setAttribute('data-bs-title', t('changeChannel'));
        CHANGE_CHANNEL_BUTTON.setAttribute('data-button-cambio', canalId);
        CHANGE_CHANNEL_BUTTON.innerHTML = `<span>${t('change')}</span><i class="bi bi-arrow-repeat"></i>`;
        CHANGE_CHANNEL_BUTTON.classList.add(
            'btn',
            'btn-sm',
            'btn-dark-subtle',
            'p-0',
            'px-1',
            'd-flex',
            'gap-1',
            'pe-auto',
            'mt-1',
            'rounded-3',
        );
        CHANGE_CHANNEL_BUTTON.addEventListener('click', () => {
            LABEL_MODAL_CAMBIAR_CANAL.textContent = name;
            LABEL_MODAL_CAMBIAR_CANAL.setAttribute('id-canal-cambio', canalId);
            new bootstrap.Modal(/** @type {HTMLElement} */ (MODAL_CAMBIAR_CANAL)).show();
        });

        const OFFICIAL_CHANNEL_LINK = document.createElement('a');
        OFFICIAL_CHANNEL_LINK.id = 'overlay-boton-pagina-oficial';
        OFFICIAL_CHANNEL_LINK.title = t('officialPage');
        if (tipoSeñalCargada === 'yt_id')
            website = `https://www.youtube.com/channel/${signals.yt_id}`;
        if (tipoSeñalCargada === 'twitch_id')
            website = `https://www.twitch.tv/${signals.twitch_id}`;
        OFFICIAL_CHANNEL_LINK.href =
            safeHttpUrl(website) ||
            `https://www.qwant.com/?q=${encodeURIComponent(`${name} en vivo`)}`;
        // El nombre del canal es el texto visible del enlace, pero se oculta cuando
        // los botones no caben (hideTextoBotonesOverlay): sin aria-label el enlace se
        // queda sin nombre accesible justo en las rejillas más apretadas.
        OFFICIAL_CHANNEL_LINK.setAttribute('aria-label', `${name}: ${t('officialPage')}`);
        OFFICIAL_CHANNEL_LINK.setAttribute('role', 'button');
        OFFICIAL_CHANNEL_LINK.setAttribute('data-bs-toggle', 'tooltip');
        OFFICIAL_CHANNEL_LINK.setAttribute('data-bs-title', t('officialPage'));
        OFFICIAL_CHANNEL_LINK.rel = 'noopener nofollow noreferrer';
        OFFICIAL_CHANNEL_LINK.innerHTML = `<span>
                ${escapeHtml(name)}
                ${
                    country && typeof country === 'string' && COUNTRY_CODES[country]
                        ? ` <img src="https://flagcdn.com/${country.toLowerCase()}.svg" alt="bandera ${COUNTRY_CODES[country]}" title="${COUNTRY_CODES[country]}" class="svg-bandera">`
                        : ''
                }
                ${iconoCategoria ? ` ${iconoCategoria}` : ''}
                </span> <i class="bi bi-box-arrow-up-right"></i>`;
        OFFICIAL_CHANNEL_LINK.classList.add(
            'btn',
            'btn-sm',
            'btn-dark-subtle',
            'p-0',
            'px-1',
            'd-flex',
            'gap-1',
            'pe-auto',
            'mt-1',
            'rounded-3',
            'text-nowrap',
        );

        const REMOVE_CHANNEL_BUTTON = document.createElement('button');
        REMOVE_CHANNEL_BUTTON.id = 'overlay-boton-quitar';
        REMOVE_CHANNEL_BUTTON.setAttribute('aria-label', t('removeChannel'));
        REMOVE_CHANNEL_BUTTON.setAttribute('type', 'button');
        REMOVE_CHANNEL_BUTTON.setAttribute('title', t('removeChannel'));
        REMOVE_CHANNEL_BUTTON.setAttribute('data-bs-toggle', 'tooltip');
        REMOVE_CHANNEL_BUTTON.setAttribute('data-bs-title', t('removeChannel'));
        REMOVE_CHANNEL_BUTTON.innerHTML = `<span>${t('remove')}</span><i class="bi bi-x-circle"></i>`;
        REMOVE_CHANNEL_BUTTON.classList.add(
            'btn',
            'btn-sm',
            'btn-danger',
            'p-0',
            'px-1',
            'd-flex',
            'gap-1',
            'pe-auto',
            'mt-1',
            'rounded-3',
        );
        REMOVE_CHANNEL_BUTTON.addEventListener('click', () => {
            tele.remove(canalId);
            playAudioSinDelay(AUDIO_POP);
        });

        DIV_ELEMENT.append(BOTON_SELECCIONAR_SEÑAL_CANAL);
        DIV_ELEMENT.append(DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL);
        DIV_ELEMENT.append(MOVE_CHANNEL_BUTTON);
        DIV_ELEMENT.append(CHANGE_CHANNEL_BUTTON);
        DIV_ELEMENT.append(OFFICIAL_CHANNEL_LINK);
        DIV_ELEMENT.append(REMOVE_CHANNEL_BUTTON);
        FRAGMENT_OVERLAY.append(DIV_ELEMENT);
        return FRAGMENT_OVERLAY;
    } catch (error) {
        console.error(
            `Error durante creación overlay para canal con id: ${canalId}. Error: ${error}`,
        );
        mostrarToast(
            buildErrorToastMessage(t('errorCreateOverlay', { channel: canalId }), error),
            'danger',
        );
        return;
    }
}

/**
 * @param {string} canalId
 * @returns {DocumentFragment}
 */
export function createChannelFragment(canalId) {
    if (listChannels[canalId]?.signals) {
        let {
            iframe_url = [],
            m3u8_url = [],
            yt_id = '',
            yt_embed = '',
            yt_playlist = '',
            twitch_id = '',
        } = listChannels[canalId].signals;
        let lsPreferenciasSeñalCanales = readStoredObject('preferencia-señal-canales');

        let señalUtilizar;
        let valorIndexArraySeñal = 0;

        const valoresSeñales = [
            { key: 'iframe_url', values: Array.isArray(iframe_url) ? iframe_url : [] },
            { key: 'm3u8_url', values: Array.isArray(m3u8_url) ? m3u8_url : [] },
        ];

        const señalPreferida = lsPreferenciasSeñalCanales[canalId];
        if (señalPreferida) {
            const keyPreferido = Object.keys(señalPreferida)[0]?.toString();
            const indexPreferido = Number(Object.values(señalPreferida)[0]);
            if (
                keyPreferido &&
                [
                    'iframe_url',
                    'm3u8_url',
                    'yt_id',
                    'yt_embed',
                    'yt_playlist',
                    'twitch_id',
                ].includes(keyPreferido)
            ) {
                señalUtilizar = keyPreferido;
                valorIndexArraySeñal = Number.isFinite(indexPreferido) ? indexPreferido : 0;
            }
        }

        if (!señalUtilizar) {
            const señalElegible = valoresSeñales.find(({ values }) =>
                values.some(
                    (value) => typeof value === 'string' && value.trim().startsWith('http'),
                ),
            );
            if (señalElegible) {
                señalUtilizar = señalElegible.key;
            } else if (yt_id !== '') {
                señalUtilizar = 'yt_id';
            } else if (yt_embed !== '') {
                señalUtilizar = 'yt_embed';
            } else if (yt_playlist !== '') {
                señalUtilizar = 'yt_playlist';
            } else if (twitch_id !== '') {
                señalUtilizar = 'twitch_id';
            }
        }

        const FRAGMENT_CANAL = document.createDocumentFragment();
        if (señalUtilizar === 'm3u8_url') {
            const urlM3u8 = Array.isArray(m3u8_url) ? m3u8_url[valorIndexArraySeñal] : '';
            FRAGMENT_CANAL.append(
                createVideoPlayer(canalId, urlM3u8),
                createChannelOverlay(canalId, 'm3u8_url', valorIndexArraySeñal),
            );
            return FRAGMENT_CANAL;
        } else if (señalUtilizar) {
            FRAGMENT_CANAL.append(
                generateStreamIframe(canalId, señalUtilizar, valorIndexArraySeñal),
                createChannelOverlay(canalId, señalUtilizar, valorIndexArraySeñal),
            );
            return FRAGMENT_CANAL;
        }

        return FRAGMENT_CANAL;
    } else {
        console.error(`${canalId} no tiene signals definidas.`);
        mostrarToast(
            `
        <span class="fw-bold">${t('channelWithoutSignals', { channel: canalId })}</span>
        <br>${t('errorCacheHint')}
        <button type="button" class="btn btn-danger rounded-pill btn-sm w-100 border-light mt-2" data-bs-toggle="modal"
            data-bs-target="#modal-reset">${t('resetLocalStorage')}</button>`,
            'danger',
            false,
        );
    }
}

/**
 * @param {string} canalId
 * @returns {void}
 */
export function updateActiveSignal(canalId) {
    try {
        if (!canalId)
            return console.error(
                `El canal "${canalId}" proporcionado no es válido para cambio señal.`,
            );

        let divPadreACambiar = document.querySelector(`div[data-canal="${canalId}"]`);
        let divExistenteACambiar = divPadreACambiar.querySelector(
            `div[data-canal-cambio="${canalId}"]`,
        );
        let barraOverlayDeCanalACambiar = divPadreACambiar.querySelector(
            `#overlay-de-canal-${canalId}`,
        );

        disposeVideoPlayer(divExistenteACambiar);
        divExistenteACambiar.remove();
        barraOverlayDeCanalACambiar.remove();

        divPadreACambiar.append(createChannelFragment(canalId));

        if (typeof activarTooltipsBootstrap === 'function') activarTooltipsBootstrap();
        if (typeof hideTextoBotonesOverlay === 'function') hideTextoBotonesOverlay();
    } catch (error) {
        console.error(
            `Error al intentar cambiar señal para canal con id: ${canalId}. Error: ${error}`,
        );
        mostrarToast(
            buildErrorToastMessage(t('errorChangeSignal', { channel: canalId }), error),
            'danger',
        );
        return;
    }
}
