import { loadChannelData, listChannels } from './channelsData.js';
import { createChannelFragment, disposeVideoPlayer } from './channelUI.js';
import {
    CHANNEL_CONTAINER_ID_PREFIXES,
    FIXED_COLUMN_VALUE_DESKTOP,
    FIXED_PHONE_COLUMN_VALUE,
    AUDIO_FAIL,
} from './constants/index.js';
import {
    hideTextoBotonesOverlay,
    activarTooltipsBootstrap,
    removerTooltipsBootstrap,
    detectarTemaSistema,
    setCheckboxState,
    iniciarRevisarConexion,
    mostrarToast,
    playAudioSinDelay,
    obtenerCanalesPredeterminados,
    saveActiveChannelsToStorage,
    ajustarClaseBotonCanal,
    activarVisionUnica,
    desactivarVisionUnica,
    obtenerNumeroCanalesFila,
    borraPreferenciaSeñalInvalida,
    revisarSeñalesVacias,
    actualizarValorSlider,
    actualizarBotonesPersonalizarOverlay,
    crearBotonesParaCanales,
    toggleVisibilityOfRemoveSignalButtons,
    adjustChannelColumnCount,
    filtrarCanalesPorInput,
    ajustarClaseColTransmisionesPorFila,
    ordenarBotonesCanalesAscendente,
    ordenarBotonesCanalesDescendente,
    restaurarOrdenOriginalBotonesCanales,
    crearBotonesPaises,
    addSortEventListener,
    actualizarBotonesFlotantes,
    clicBotonPosicionBotonesFlotantes,
    cargarOrdenVisionUnica,
    CONTAINER_INTERNO_VISION_UNICA,
    guardarOrdenPanelesVisionUnica,
    toggleClaseOrdenado,
    reemplazarCanalActivo,
    pushStateToUrl,
    parseStateFromUrl,
    readStoredObject,
    fixPwaInstallScreenshotAlt,
    fitGridToViewport,
} from './helpers/index.js';
import {
    buildErrorToastMessage,
    initI18n,
    t,
    getDisabledLabel,
    getHeightLabel,
    getLayoutLabel,
    getVisibilityLabel,
} from './i18n.js';

// MARK: querySelector Globales
const MAIN_NAVBAR = document.querySelector('#navbar');
/** @type {HTMLElement | null} */
export const CONTAINER_VISION_CUADRICULA = document.querySelector('#container-vision-cuadricula');
export const CONTAINER_VISION_UNICA = document.querySelector('#container-vision-unica');
export const CONTAINER_VIDEO_VISION_UNICA = document.querySelector('#container-video-vision-unica');
export const ICONO_SIN_SEÑAL_ACTIVA_VISION_UNICA = document.querySelector(
    '#icono-sin-señal-vision-unica',
);

// Tarjeta de logo/splash: solo se muestra al iniciar (antes de que carguen canales) y
// cuando no queda ningún canal activo en ningún layout, respetando el checkbox de
// "ocultar fondo" en ajustes como interruptor maestro.
function updateLogoBackgroundVisibility() {
    const activeChannels =
        (CONTAINER_VISION_CUADRICULA?.querySelectorAll('div[data-canal]')?.length ?? 0) +
        (CONTAINER_VIDEO_VISION_UNICA?.querySelectorAll('div[data-canal]')?.length ?? 0);
    const shouldShow =
        CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.checked && activeChannels === 0;
    CONTAINER_TARJETA_LOGO_BACKGROUND.classList.toggle('d-none', !shouldShow);
}

export function syncInterfaceStatus() {
    const activeChannels =
        (CONTAINER_VISION_CUADRICULA?.querySelectorAll('div[data-canal]')?.length ?? 0) +
        (CONTAINER_VIDEO_VISION_UNICA?.querySelectorAll('div[data-canal]')?.length ?? 0);
    const currentLayout = getLayoutLabel(localStorage.getItem('diseño-seleccionado'));

    document.querySelectorAll('[data-ui-active-count]').forEach((node) => {
        node.textContent = `${activeChannels}`;
    });

    document.querySelectorAll('[data-ui-layout]').forEach((node) => {
        node.textContent = currentLayout;
    });

    updateLogoBackgroundVisibility();
}

function refreshLocalizedUiState() {
    SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR.textContent = getVisibilityLabel(
        CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR.checked,
    );
    SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY.textContent = getVisibilityLabel(
        CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY.checked,
    );
    SPAN_VALOR_CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.textContent = getVisibilityLabel(
        CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.checked,
    );
    SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.textContent =
        getVisibilityLabel(CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.checked);

    if (INPUT_RANGE_PERSONALIZACION_TAMAÑO_VISION_CUADRICULA.disabled) {
        SPAN_VALOR_INPUT_RANGE.textContent = getDisabledLabel();
    }

    if (CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.disabled) {
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.textContent = getDisabledLabel();
    } else {
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.textContent = getHeightLabel(
            localStorage.getItem('uso-100vh') === 'activo',
        );
    }

    if (BOTONES_PERSONALIZAR_TRANSMISIONES_POR_FILA[0]?.disabled) {
        SPAN_VALOR_TRANSMISIONES_POR_FILA.textContent = getDisabledLabel();
    }
}

export const BOTON_ACTIVAR_VISION_UNICA = document.querySelector(
    '#boton-activar-diseño-vision-unica',
);
export const BOTON_ACTIVAR_VISION_GRID = document.querySelector(
    '#boton-activar-diseño-vision-grid',
);

export const MODAL_CAMBIAR_CANAL = document.querySelector('#modal-cambiar-canal');
export const LABEL_MODAL_CAMBIAR_CANAL = document.querySelector('#label-para-name-canal-cambiar');

// MARK: LocalStorage
let lsModal = localStorage.getItem('modal-status') ?? 'show';
// Clave nueva a propósito: la antigua ('navbar-display') se guardaba como 'show' en
// cada carga, así que no distingue una elección del usuario del valor por defecto.
// La barra superior pasa a estar oculta por defecto (todo vive en la barra inferior).
let lsNavbar = localStorage.getItem('top-bar-display');
let lsEstiloVision = localStorage.getItem('diseño-seleccionado');

let lsPosicionBotonesFlotantes = localStorage.getItem('posicion-botones-flotante');
let lsTextoBotonesFlotantes = localStorage.getItem('texto-botones-flotantes');
let lsAlturaCanales = localStorage.getItem('uso-100vh');
let lsFondo = localStorage.getItem('tarjeta-fondo-display');

// MARK: PERSONALIZACIONES
// Navbar
/** @type {HTMLInputElement | null} */
const CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR = document.querySelector(
    '#checkbox-personalizar-visualizacion-navbar',
);
/** @type {HTMLElement | null} */
const SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR = document.querySelector(
    '#span-valor-visualizacion-navbar',
);

CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR.addEventListener('click', () => {
    MAIN_NAVBAR.classList.toggle('d-none', !CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR.checked);
    setCheckboxState(
        CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR,
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR,
        'top-bar-display',
        CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR.checked,
    );
});

// Overlay
/** @type {HTMLInputElement | null} */
export const CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY = document.querySelector(
    '#checkbox-personalizar-visualizacion-overlay',
);
/** @type {HTMLElement | null} */
export const SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY = document.querySelector(
    '#span-valor-visualizacion-overlay',
);
CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY.addEventListener('click', () => {
    document.body.classList.toggle(
        'd-none__barras-overlay',
        !CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY.checked,
    );
    setCheckboxState(
        CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY,
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY,
        'overlay-display',
        CHECKBOX_PERSONALIZAR_VISUALIZACION_OVERLAY.checked,
    );
    actualizarBotonesPersonalizarOverlay();
});

export const BOTONES_PERSONALIZAR_OVERLAY = document.querySelectorAll(
    '.div-boton-personalizar-overlay',
);
BOTONES_PERSONALIZAR_OVERLAY.forEach((contenedorBoton) => {
    /** @type {HTMLInputElement} */
    const botonIndividual = contenedorBoton.querySelector('.btn-check');
    let datasetBoton = botonIndividual.dataset.botonoverlay;
    botonIndividual.addEventListener('click', () => {
        localStorage.setItem(`${datasetBoton}`, botonIndividual.checked ? 'show' : 'hide');
        actualizarBotonesPersonalizarOverlay();
    });
});

// Tamaño
/** @type {HTMLInputElement | null} */
export const INPUT_RANGE_PERSONALIZACION_TAMAÑO_VISION_CUADRICULA = document.querySelector(
    '#input-range-tamaño-container-vision-cuadricula',
);
/** @type {HTMLElement | null} */
export const SPAN_VALOR_INPUT_RANGE = document.querySelector('#span-valor-input-range');

INPUT_RANGE_PERSONALIZACION_TAMAÑO_VISION_CUADRICULA.addEventListener('input', (event) => {
    const valor = /** @type {HTMLInputElement} */ (event.target).value;
    SPAN_VALOR_INPUT_RANGE.innerHTML = `${valor}%`;
    CONTAINER_VISION_CUADRICULA.style.maxWidth = `${valor}%`;
    localStorage.setItem('valor-input-range', valor);
    hideTextoBotonesOverlay();
});

// alternar altura canales
/** @type {HTMLInputElement | null} */
export const CHECKBOX_PERSONALIZAR_USO_100VH_CANALES = document.querySelector(
    '#checkbox-personalizar-altura-canales',
);
export const SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES = document.querySelector(
    '#span-valor-altura-canales',
);
const ICONO_PERSONALIZAR_USO_100VH_CANALES = document.querySelector(
    '#icono-personalizar-altura-canales',
);

CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.addEventListener('click', () => {
    CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.checked
        ? (ICONO_PERSONALIZAR_USO_100VH_CANALES.classList.replace(
              'bi-arrows-collapse',
              'bi-arrows-vertical',
          ),
          localStorage.setItem('uso-100vh', 'activo'),
          (SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.textContent = getHeightLabel(true)))
        : (ICONO_PERSONALIZAR_USO_100VH_CANALES.classList.replace(
              'bi-arrows-vertical',
              'bi-arrows-collapse',
          ),
          localStorage.setItem('uso-100vh', 'inactivo'),
          (SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.textContent = getHeightLabel(false)));
    adjustChannelColumnCount();
});

// Canales por fila
/** @type {HTMLElement | null} */
export const SPAN_VALOR_TRANSMISIONES_POR_FILA = document.querySelector(
    '#span-valor-transmisiones-por-fila',
);
/** @type {NodeListOf<HTMLButtonElement>} */
export const BOTONES_PERSONALIZAR_TRANSMISIONES_POR_FILA = document.querySelectorAll(
    '#container-botones-personalizar-transmisiones-por-fila button',
);

BOTONES_PERSONALIZAR_TRANSMISIONES_POR_FILA.forEach((boton) => {
    boton.addEventListener('click', () => {
        ajustarClaseColTransmisionesPorFila(boton.value);
        SPAN_VALOR_TRANSMISIONES_POR_FILA.innerHTML = `${obtenerNumeroCanalesFila()}`;
        hideTextoBotonesOverlay();
    });
});

// Texto botones flotantes
/** @type {HTMLInputElement | null} */
const CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES = document.querySelector(
    '#checkbox-personalizar-texto-botones-flotantes',
);
/** @type {HTMLElement | null} */
const SPAN_VALOR_CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES = document.querySelector(
    '#span-valor-texto-en-botones-flotante',
);
const ICONO_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES = document.querySelector(
    '#icono-personalizar-texto-botones-flotantes',
);

const SPAN_BOTONES_FLOTANTES = document.querySelectorAll('#grupo-botones-flotantes button>span');

CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.addEventListener('click', () => {
    SPAN_BOTONES_FLOTANTES.forEach((button) => {
        button.classList.toggle('d-none', !CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.checked);
    });
    setCheckboxState(
        CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES,
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES,
        'texto-botones-flotantes',
        CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.checked,
    );
    CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.checked
        ? ICONO_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.classList.replace(
              'bi-square',
              'bi-info-square',
          )
        : ICONO_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.classList.replace(
              'bi-info-square',
              'bi-square',
          );
});

// ocultar fondo
/** @type {HTMLInputElement | null} */
const CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND = document.querySelector(
    '#checkbox-tarjeta-logo-background',
);
/** @type {HTMLElement | null} */
const SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND =
    document.querySelector('#span-valor-visualizacion-tarjeta-logo-background');
const ICONO_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND = document.querySelector(
    '#icono-personalizar-visualizacion-tarjeta-logo-background',
);
const CONTAINER_TARJETA_LOGO_BACKGROUND = document.querySelector(
    '#container-tarjeta-logo-background',
);

CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.addEventListener('click', () => {
    updateLogoBackgroundVisibility();
    setCheckboxState(
        CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND,
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND,
        'tarjeta-fondo-display',
        CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.checked,
    );
    CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.checked
        ? ICONO_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.classList.replace(
              'bi-eye-slash',
              'bi-eye',
          )
        : ICONO_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.classList.replace(
              'bi-eye',
              'bi-eye-slash',
          );
});

/** @type {NodeListOf<HTMLInputElement>} */
export const BOTONES_REPOSICIONAR_BOTONES_FLOTANTES = document.querySelectorAll(
    '#grupo-botones-posicion-botones-flotantes .btn-check',
);

// IDs de canal renombrados en tv-channels.json: un link/backup local viejo con el id
// anterior debe seguir resolviendo al canal actual en vez de fallar en silencio.
/** @type {Record<string, string>} */
const LEGACY_CHANNEL_ALIASES = { '3/24': '3-24' };

// MARK: Manejo canales
/** @type {{ add: (canal: string) => void; remove: (canal: string) => void; cargaCanalesPredeterminados: () => void }} */
export let tele = {
    add: (canal) => {
        try {
            canal = LEGACY_CHANNEL_ALIASES[canal] ?? canal;
            if (!canal || !listChannels?.[canal])
                return console.error(
                    `El canal "${canal}" proporcionado no es válido para ser añadido.`,
                );
            const DIV_CANAL = document.createElement('div');
            DIV_CANAL.setAttribute('data-canal', canal);
            if (localStorage.getItem('diseño-seleccionado') === 'vision-unica') {
                DIV_CANAL.classList.add('position-relative', 'shadow', 'h-100', 'w-100');
                DIV_CANAL.append(createChannelFragment(canal));
                CONTAINER_VIDEO_VISION_UNICA.append(DIV_CANAL);
                ICONO_SIN_SEÑAL_ACTIVA_VISION_UNICA.classList.add('d-none');
            } else {
                DIV_CANAL.classList.add('position-relative', 'shadow');
                DIV_CANAL.append(createChannelFragment(canal));
                CONTAINER_VISION_CUADRICULA.append(DIV_CANAL);
                saveActiveChannelsToStorage();
            }
            ajustarClaseBotonCanal(canal, true);
            activarTooltipsBootstrap();
            hideTextoBotonesOverlay();
            syncInterfaceStatus();
            pushStateToUrl('#container-vision-cuadricula');
        } catch (error) {
            console.error(`Error durante creación div de canal con id: ${canal}. Error: ${error}`);
            mostrarToast(
                buildErrorToastMessage(t('errorCreateChannel', { channel: canal }), error),
                'danger',
                false,
            );
            return;
        }
    },
    remove: (canal) => {
        try {
            if (!canal)
                return console.error(
                    `El canal "${canal}" proporcionado no es válido para su eliminación.`,
                );
            let transmisionPorRemover = document.querySelector(`div[data-canal="${canal}"]`);

            disposeVideoPlayer(transmisionPorRemover);

            removerTooltipsBootstrap();
            transmisionPorRemover.remove();

            if (localStorage.getItem('diseño-seleccionado') === 'vision-unica')
                ICONO_SIN_SEÑAL_ACTIVA_VISION_UNICA.classList.remove('d-none');

            ajustarClaseBotonCanal(canal, false);
            activarTooltipsBootstrap();
            syncInterfaceStatus();
            pushStateToUrl('#container-vision-cuadricula');
        } catch (error) {
            console.error(
                `Error durante eliminación div de canal con id: ${canal}. Error: ${error}`,
            );
            mostrarToast(
                buildErrorToastMessage(t('errorRemoveChannel', { channel: canal }), error),
                'danger',
                false,
            );
            return;
        }
    },
    cargaCanalesPredeterminados: () => {
        let lsCanales = readStoredObject('canales-vision-cuadricula');
        if (Object.keys(lsCanales).length === 0 && lsModal !== 'hide') {
            obtenerCanalesPredeterminados(isMobile.any).forEach((canal) => tele.add(canal));
        } else {
            try {
                Object.keys(lsCanales).forEach((canal) => {
                    if (revisarSeñalesVacias(canal)) {
                        document
                            .querySelectorAll(`button[data-canal="${canal}"]`)
                            .forEach((boton) => {
                                boton.classList.add('d-none');
                            });
                    } else {
                        tele.add(canal);
                    }
                });
            } catch (error) {
                console.error(`Error durante carga canales predeterminados. Error: ${error}`);
                mostrarToast(
                    buildErrorToastMessage(t('errorLoadChannels'), error),
                    'danger',
                    false,
                );
                return;
            }
        }
    },
};

BOTON_ACTIVAR_VISION_UNICA.addEventListener('click', () => {
    if (localStorage.getItem('diseño-seleccionado') !== 'vision-unica') {
        activarVisionUnica();
        syncInterfaceStatus();
    } else {
        playAudioSinDelay(AUDIO_FAIL);
        mostrarToast(t('alreadySingleView'), 'info');
    }
});

BOTON_ACTIVAR_VISION_GRID.addEventListener('click', () => {
    if (localStorage.getItem('diseño-seleccionado') === 'vision-unica') {
        desactivarVisionUnica();
        syncInterfaceStatus();
    } else {
        playAudioSinDelay(AUDIO_FAIL);
        mostrarToast(t('alreadyGridView'), 'info');
    }
});

// MARK: otros
// plugin para mover canales en grid
new Sortable(CONTAINER_VISION_CUADRICULA, {
    animation: 350,
    handle: '.clase-para-mover',
    easing: 'cubic-bezier(.17,.67,.83,.67)',
    ghostClass: 'marca-al-mover',
    onStart: () => {
        const DIVS_SOBRE_SEÑALES = CONTAINER_VISION_CUADRICULA.querySelectorAll('.bg-transparent');
        DIVS_SOBRE_SEÑALES.forEach((divSobrepuesto) => {
            divSobrepuesto.classList.toggle('pe-none'); // quita clase "pe-none" para poder abarcar todo el tamaño del div del canal para el threshold https://sortablejs.github.io/Sortable/#thresholds
        });
        removerTooltipsBootstrap(); // removemos ya que como el propio boton de mover tiene uno, de no quitarlo queda flotando tras mover div canal
    },
    onEnd: () => {
        activarTooltipsBootstrap();
        const DIVS_SOBRE_SEÑALES = CONTAINER_VISION_CUADRICULA.querySelectorAll('.bg-transparent');
        DIVS_SOBRE_SEÑALES.forEach((divSobrepuesto) => {
            divSobrepuesto.classList.toggle('pe-none'); // para poder hacer clic en iframes o videojs
        });
        saveActiveChannelsToStorage();
    },
});

new Sortable(CONTAINER_INTERNO_VISION_UNICA, {
    animation: 350,
    handle: '.clase-para-mover',
    easing: 'cubic-bezier(.17,.67,.83,.67)',
    ghostClass: 'marca-al-mover',
    swapThreshold: 0.3,
    onStart: () => {
        try {
            if (CONTAINER_VIDEO_VISION_UNICA) {
                const DIVS_SOBRE_SEÑALES =
                    CONTAINER_VIDEO_VISION_UNICA.querySelectorAll('.bg-transparent');
                for (const divSobrepuesto of DIVS_SOBRE_SEÑALES) {
                    divSobrepuesto.classList.remove('pe-none');
                }
            }
            removerTooltipsBootstrap();
        } catch (e) {
            console.error('Error en onStart Sortable:', e);
        }
    },
    onChange: () => {
        try {
            toggleClaseOrdenado();
        } catch (e) {
            console.error('Error en onChange Sortable:', e);
        }
    },
    onEnd: () => {
        try {
            guardarOrdenPanelesVisionUnica();
            activarTooltipsBootstrap();
            if (CONTAINER_VIDEO_VISION_UNICA) {
                const DIVS_SOBRE_SEÑALES =
                    CONTAINER_VIDEO_VISION_UNICA.querySelectorAll('.bg-transparent');
                for (const divSobrepuesto of DIVS_SOBRE_SEÑALES) {
                    divSobrepuesto.classList.add('pe-none');
                }
            }
            toggleClaseOrdenado();
        } catch (e) {
            console.error('Error en onEnd Sortable:', e);
        }
    },
});

// ocultar texto si el tamaño de los botones excede el tamaño del contenedor
window.addEventListener('resize', hideTextoBotonesOverlay);

// Reencaja la cuadrícula cuando cambia el alto disponible: resize de ventana, pero
// también mostrar/ocultar la barra superior o la alerta de conexión.
const APP_SHELL = document.querySelector('main.app-shell');
if (APP_SHELL && 'ResizeObserver' in window) {
    new ResizeObserver(() => fitGridToViewport()).observe(APP_SHELL);
}

// MARK: auto-ocultar barras de overlay tras inactividad
// Mientras el usuario no mueve el puntero ni usa el teclado, las barras de canal
// se atenúan (ver .barra-overlay-idle en style.css) para no tapar la señal;
// cualquier interacción las devuelve. Se reinicia el temporizador en cada evento.
/** @type {number | undefined} */
let timerIdleOverlay;
const revelarBarrasOverlay = () => {
    document.body.classList.remove('barra-overlay-idle');
    clearTimeout(timerIdleOverlay);
    timerIdleOverlay = setTimeout(() => document.body.classList.add('barra-overlay-idle'), 3000);
};
['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach((evento) =>
    document.addEventListener(evento, revelarBarrasOverlay, { passive: true }),
);
revelarBarrasOverlay();

// MARK: DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    initI18n();
    fixPwaInstallScreenshotAlt();
    syncInterfaceStatus();
    detectarTemaSistema();
    iniciarRevisarConexion();
    MODAL_CAMBIAR_CANAL.addEventListener('shown.bs.modal', () => {
        document
            .querySelectorAll('#modal-cambiar-canal-body-botones-canales button')
            .forEach((boton) => {
                boton.addEventListener('click', () =>
                    reemplazarCanalActivo(
                        /** @type {HTMLElement} */ (boton).dataset.canal,
                        LABEL_MODAL_CAMBIAR_CANAL.getAttribute('id-canal-cambio'),
                    ),
                );
            });
    });

    MODAL_CAMBIAR_CANAL.addEventListener('hidden.bs.modal', () => {
        LABEL_MODAL_CAMBIAR_CANAL.setAttribute('id-canal-cambio', '');
    });

    screen.orientation.addEventListener('change', () => {
        if (lsEstiloVision !== 'vision-unica') adjustChannelColumnCount();
    });

    // Efecto glow en hover a logo del fondo
    /** @type {HTMLElement | null} */
    const TARJETA_LOGO_BACKGROUND = document.querySelector('.tarjeta-logo-background');
    TARJETA_LOGO_BACKGROUND?.addEventListener('mousemove', (e) => {
        const rect = TARJETA_LOGO_BACKGROUND.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        TARJETA_LOGO_BACKGROUND.style.setProperty('--mouse-x', `${x}px`);
        TARJETA_LOGO_BACKGROUND.style.setProperty('--mouse-y', `${y}px`);
    });

    // Ensure modal is always considered as 'accepted'
    localStorage.setItem('modal-status', 'hide');
    // Modal welcome disabled - no longer showing

    // Navbar
    lsNavbar === 'show'
        ? (MAIN_NAVBAR.classList.remove('d-none'),
          setCheckboxState(
              CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR,
              SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR,
              'top-bar-display',
              true,
          ))
        : (MAIN_NAVBAR.classList.add('d-none'),
          setCheckboxState(
              CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR,
              SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_NAVBAR,
              'top-bar-display',
              false,
          ));

    // Posición botones flotante

    BOTONES_REPOSICIONAR_BOTONES_FLOTANTES.forEach((boton) => {
        boton.addEventListener('click', () => {
            const BOTON_DATASET_POSITION = /** @type {[string, string, string, string]} */ (
                boton.dataset.position.split(' ')
            );
            clicBotonPosicionBotonesFlotantes(...BOTON_DATASET_POSITION);
        });
    });

    if (lsPosicionBotonesFlotantes) {
        const { top, start, margin, translate } = JSON.parse(lsPosicionBotonesFlotantes);
        actualizarBotonesFlotantes(top, start, margin, translate);
    } else {
        actualizarBotonesFlotantes('bottom-0', 'start-50', 'mb-3', 'translate-middle-x');
    }

    // Texto botones flotantes
    if (lsTextoBotonesFlotantes !== 'hide') {
        setCheckboxState(
            CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES,
            SPAN_VALOR_CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES,
            'texto-botones-flotantes',
            true,
        );
        ICONO_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.classList.replace('bi-square', 'bi-info-square');
    } else {
        SPAN_BOTONES_FLOTANTES.forEach((button) => {
            button.classList.toggle(
                'd-none',
                !CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.checked,
            );
        });
        setCheckboxState(
            CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES,
            SPAN_VALOR_CHECKBOX_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES,
            'texto-botones-flotantes',
            false,
        );
        ICONO_PERSONALIZAR_TEXTO_BOTONES_FLOTANTES.classList.replace('bi-info-square', 'bi-square');
    }

    // Tamaño
    actualizarValorSlider();
    SPAN_VALOR_TRANSMISIONES_POR_FILA.innerHTML = `${obtenerNumeroCanalesFila()}`;

    // Altura
    if (lsAlturaCanales !== 'inactivo') {
        (localStorage.setItem('uso-100vh', 'activo'),
            (CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.checked = true));
        ICONO_PERSONALIZAR_USO_100VH_CANALES.classList.replace(
            'bi-arrows-collapse',
            'bi-arrows-vertical',
        );
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.textContent = getHeightLabel(true);
    } else {
        CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.checked = false;
        ICONO_PERSONALIZAR_USO_100VH_CANALES.classList.replace(
            'bi-arrows-vertical',
            'bi-arrows-collapse',
        );
        SPAN_VALOR_CHECKBOX_PERSONALIZAR_USO_100VH_CANALES.textContent = getHeightLabel(false);
    }

    // tarjeta fondo
    if (lsFondo !== 'hide') {
        setCheckboxState(
            CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND,
            SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND,
            'tarjeta-fondo-display',
            true,
        );
        updateLogoBackgroundVisibility();
        ICONO_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.classList.replace(
            'bi-eye-slash',
            'bi-eye',
        );
    } else {
        setCheckboxState(
            CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND,
            SPAN_VALOR_CHECKBOX_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND,
            'tarjeta-fondo-display',
            false,
        );
        updateLogoBackgroundVisibility();
        ICONO_PERSONALIZAR_VISUALIZACION_TARJETA_LOGO_BACKGROUND.classList.replace(
            'bi-eye',
            'bi-eye-slash',
        );
    }

    async function cargaInicial() {
        try {
            await loadChannelData();
            if (listChannels) {
                crearBotonesParaCanales();
                crearBotonesPaises();
                borraPreferenciaSeñalInvalida();

                // Intentar restaurar estado desde URL (compartir/enlace)
                const urlState = parseStateFromUrl();
                const hasUrlChannels = urlState.canales && urlState.canales.length > 0;

                if (hasUrlChannels && urlState.layout === 'vision-unica') {
                    lsEstiloVision = 'vision-unica';
                    activarVisionUnica();
                    urlState.canales.forEach((canal) => tele.add(canal));
                } else if (hasUrlChannels) {
                    urlState.canales.forEach((canal) => tele.add(canal));
                } else {
                    lsEstiloVision === 'vision-unica'
                        ? activarVisionUnica()
                        : tele.cargaCanalesPredeterminados();
                }

                actualizarBotonesPersonalizarOverlay();
                ajustarClaseColTransmisionesPorFila(
                    localStorage.getItem('numero-class-columnas-por-fila') ??
                        (isMobile.any ? FIXED_PHONE_COLUMN_VALUE : FIXED_COLUMN_VALUE_DESKTOP),
                );
                hideTextoBotonesOverlay();
                activarTooltipsBootstrap();
                toggleVisibilityOfRemoveSignalButtons();
                syncInterfaceStatus();

                // Sincronizar URL con el estado actual
                pushStateToUrl('#container-vision-cuadricula');
            }
        } catch (error) {
            console.error(`Error durante carga inicial. Error: ${error}`);
            mostrarToast(buildErrorToastMessage(t('errorInitialLoad'), error), 'danger', false);
            return;
        }
    }
    cargaInicial();
    cargarOrdenVisionUnica();
    syncInterfaceStatus();

    // Ordenar botones canales
    for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
        addSortEventListener(
            `${PREFIJO}-boton-orden-ascendente`,
            `${PREFIJO}-body-botones-canales`,
            ordenarBotonesCanalesAscendente,
        );
        addSortEventListener(
            `${PREFIJO}-boton-orden-descendente`,
            `${PREFIJO}-body-botones-canales`,
            ordenarBotonesCanalesDescendente,
        );
        addSortEventListener(
            `${PREFIJO}-boton-orden-original`,
            `${PREFIJO}-body-botones-canales`,
            restaurarOrdenOriginalBotonesCanales,
        );

        const bodyBotonesCanales = /** @type {HTMLElement | null} */ (
            document.querySelector(`#${PREFIJO}-body-botones-canales`)
        );
        /** @type {HTMLInputElement | null} */
        const inputFiltro = document.querySelector(`#${PREFIJO}-input-filtro`);
        inputFiltro?.addEventListener('input', (e) => {
            inputFiltro.focus();
            filtrarCanalesPorInput(
                /** @type {HTMLInputElement} */ (e.target).value,
                bodyBotonesCanales,
            );
        });
    }

    document.addEventListener('hidden.bs.toast', (event) => {
        /** @type {HTMLElement} */ (event.target).remove();
    });

    window.addEventListener('ui-language-change', () => {
        syncInterfaceStatus();
        refreshLocalizedUiState();
    });

    refreshLocalizedUiState();
});
