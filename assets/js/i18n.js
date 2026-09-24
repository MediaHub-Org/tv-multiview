const LANGUAGE_STORAGE_KEY = 'ui-language';

const translations = {
    es: {
        title: 'TV Multiview | Monitor de canales en vivo',
        metaDescription:
            'PWA de codigo abierto para monitorear canales de TV en vivo, comparar multiples senales en una cuadricula y alternar a un modo de vision unica.',
        socialDescription:
            'Monitor de TV en vivo para comparar senales, cambiar entre cuadricula y foco unico, y guardar tu configuracion localmente.',
        skipContent: 'Saltar al contenido principal',
        singleView: 'Visión única',
        activeSignals: 'señales activas',
        channels: 'Canales',
        settings: 'Ajustes',
        noInternet: 'Sin conexión a internet',
        searchByCountryOrChannel: 'Buscar por país o canal',
        openChannelsSidebar: 'Abrir panel lateral de canales',
        openChannelsCatalog: 'Canales: abrir selector completo',
        openSettingsPanel: 'Abrir panel de ajustes',
        filterByCountry: 'Filtrar por país',
        sort: 'Orden',
        ascending: 'Ascendente',
        descending: 'Descendente',
        defaultOrder: 'Predeterminado',
        selectChannels: 'Selecciona tus canales',
        catalogDescription: 'Explora el catalogo completo, filtra por país y ordena rapidamente.',
        sidepanelDescription: 'Abre, combina y limpia tu seleccion sin salir de la vista actual.',
        loadChannelsFileError:
            'Ha ocurrido un error al intentar cargar el archivo que contiene los canales',
        resetLocalStorage: 'Reiniciar almacenamiento local',
        localStorageDeleted:
            'Tu almacenamiento local ha sido eliminado, prueba recargando el sitio/PWA',
        removeAll: 'Quitar todos',
        loadDefaults: 'Cargar predeterminados',
        loadDefaultsTitle: '¿Cargar los canales predeterminados?',
        loadDefaultsBody:
            'Tienes {count} canal(es) en pantalla. Puedes reemplazar tu selección por la lista predeterminada o añadir solo los que falten.',
        loadDefaultsReplace: 'Reemplazar mi selección',
        loadDefaultsAdd: 'Añadir a lo que ya tengo',
        cancel: 'Cancelar',
        reload: 'Recargar',
        close: 'Cerrar',
        disclaimerTitle: 'Descargo de responsabilidad',
        disclaimerItem1:
            '"tv-multiview" es un proyecto de código abierto gratuito que permite gestionar canales de television de libre acceso por Internet.',
        disclaimerItem2:
            '"tv-multiview" no decodifica transmisiones. Los enlaces de este proyecto se procesan desde diferentes sitios públicos con libre distribución o acceso.',
        disclaimerItem3:
            '"tv-multiview" no posee ningún tipo de monetización, en consecuencia no se lucra de ninguna forma o medio.',
        disclaimerItem4:
            'El proyecto cuenta con reproductores multimedia que no corresponden a una retransmisión de los canales ni implican su decodificación.',
        disclaimerItem5:
            'No se es propietario ni responsable de ninguno de los contenidos emitidos por cada canal.',
        disclaimerItem6: '"tv-multiview" no ofrece canales de pago bajo ninguna modalidad.',
        disclaimerItem7: 'En este proyecto no se almacena ninguna transmisión.',
        disclaimerItem8:
            'El proyecto y sus mantenedores no asumen responsabilidad alguna respecto a derechos de propiedad intelectual que puedan ser infringidos por terceros o por cualquier usuario.',
        disclaimerItem9: 'El usuario siempre puede dirigirse al sitio oficial de cada transmisión.',
        disclaimerContactIntro: 'Si posees los derechos de algún canal y deseas que sea retirado,',
        contactMe: 'contáctame',
        disclaimerSourceIntro: 'Si quieres conocer el origen de cada livestream visita el',
        understood: 'Entendido',
        doNotShowAgain: '(No volver a mostrar)',
        quickSummary: 'Resumen rápido',
        layout: 'Modo',
        localSave: 'Guardado local',
        recommendedShortcut: 'Atajo recomendado',
        active: 'Activo',
        navbar: 'Barra superior',
        gridView: 'Visión cuadrícula',
        overlayChannels: 'Overlay canales',
        overlayButtons: 'Botones en overlay',
        theme: 'Tema',
        light: 'Claro',
        dark: 'Oscuro',
        size: 'Tamaño',
        fullHeight: '100% altura',
        channelsPerRow: 'Número de canales por fila',
        floatingButtons: 'Botones flotantes',
        buttonText: 'Texto botones',
        information: 'Información',
        repository: 'Repositorio',
        infoDescription:
            'Personaliza la interfaz, instala la PWA y guarda tu seleccion de canales localmente.',
        backgroundLogo: 'Logo en fondo',
        install: 'Instalar',
        savingChannels: 'Guardando canales',
        languageSelector: 'Selector de idioma',
        visible: 'Visible',
        hidden: 'Oculto',
        expanded: 'Expandido',
        reduced: 'Reducido',
        disabled: 'Deshabilitado',
        all: 'Todos',
        unknown: 'Desconocido',
        move: 'Mover',
        movePanel: 'Arrastrar y mover este panel [izquierda-derecha]',
        moveChannel: 'Arrastrar y mover este canal (o usa las flechas del teclado)',
        change: 'Cambiar',
        changeChannel: 'Cambiar este canal',
        remove: 'Quitar',
        removeChannel: 'Quitar canal',
        selectSignal: 'Seleccionar señal',
        selectDifferentSignal: 'Seleccionar diferente señal',
        officialPage: 'Ir a la página oficial de esta transmisión',
        resetModalTitle: '¿Estás seguro de que deseas reiniciar todas tus personalizaciones?',
        resetModalBody:
            'Al hacerlo, todas las entradas creadas por este sitio en tu navegador serán eliminadas del almacenamiento local.',
        resetModalNote:
            'Si la página presenta problemas, también conviene borrar la caché del navegador.',
        reset: 'Reiniciar',
        alreadySingleView: 'Ya estas en modo visión única',
        alreadyGridView: 'Ya estas en modo visión cuadrícula',
        iptvBadge: 'Canal IPTV añadido por el modo experimental',
        shareText:
            'PWA de codigo abierto para ver y comparar transmisiones de noticias y TV en vivo.',
        copyLink: 'Copiar enlace',
        copySuccess: 'Copiado exitoso',
        copyFailed: 'Copiado fallido',
        enterFullscreen: 'Entrar pantalla completa',
        exitFullscreen: 'Salir pantalla completa',
        errorDetailsLabel: 'Error',
        errorStorageHint:
            'Si el error persiste tras recargar, prueba borrar tu almacenamiento local desde el panel "Settings" o borrando la caché del navegador.',
        errorCacheHint: 'Si el error persiste tras recargar, prueba borrar la caché del navegador.',
        errorLoadDefaultChannels:
            'Ha ocurrido un error al intentar cargar canales predeterminados.',
        errorClearLocalStorage:
            'Ha ocurrido un error al intentar eliminar el almacenamiento local del sitio.',
        errorEnterFullscreen: 'Ha ocurrido un error al solicitar entrar a pantalla completa.',
        errorExitFullscreen: 'Ha ocurrido un error al solicitar salir de pantalla completa.',
        errorCreateChannel: 'Ha ocurrido un error durante la creación del canal con id: {channel}.',
        errorRemoveChannel:
            'Ha ocurrido un error durante la eliminación del canal con id: {channel}.',
        errorLoadChannels: 'Ha ocurrido un error durante la carga de canales predeterminados.',
        errorInitialLoad: 'Ha ocurrido un error durante la carga inicial.',
        errorCreateOverlay:
            'Ha ocurrido un error durante la creación del overlay para el canal con id: {channel}.',
        errorChangeSignal:
            'Ha ocurrido un error al intentar cambiar señal para el canal con id: {channel}.',
        errorCreateChannelButtons:
            'Ha ocurrido un error durante la creación de botones para los canales.',
        errorCreateCountryButtons:
            'Ha ocurrido un error durante la creación de botones para filtro de países.',
        errorActivateCountryFilter: 'Ha ocurrido un error al intentar activar el filtro por país.',
        errorAdjustChannelsPerRow:
            'Ha ocurrido un error al intentar ajustar el número de canales por fila.',
        errorFilterChannels: 'Ha ocurrido un error al intentar filtrar canales.',
        errorRemoveAllChannels: 'Ha ocurrido un error al intentar quitar todos los canales.',
        errorReplaceChannel:
            'Ha ocurrido un error al intentar cambiar el canal con id: {oldChannel} por el canal: {newChannel}.',
        errorSaveChannels:
            'Ha ocurrido un error al intentar guardar canales en el almacenamiento local.',
        errorLoadSingleViewOrder:
            'Ha ocurrido un error durante la carga del orden de paneles para modo "Visión Única".',
        errorUpdateOverlayButtons:
            'Ha ocurrido un error durante la actualización del estado de los botones del overlay.',
        errorActivateSingleView:
            'Ha ocurrido un error durante la activación del modo "Visión Única".',
        errorDeactivateSingleView:
            'Ha ocurrido un error durante la desactivación del modo "Visión Única".',
        channelWithoutSignals: '{channel} no tiene señales definidas.',
        preferredSignalUnavailable:
            'Tu señal preferida para {channel} ({signal}) dejó de estar disponible.',
        nextSignalFallback: 'Se utilizará la siguiente señal disponible.',
        streamUnavailable: 'Stream no disponible',
        streamErrorMixedContent: 'Bloqueado: la fuente usa http:// en una página https',
        streamErrorCorsBlocked: 'Bloqueado por la política CORS del servidor de origen',
        streamErrorSegment: 'Falló un fragmento del stream (caída puntual o token vencido)',
        streamErrorTokenExpired: 'Posible token de acceso expirado',
        streamErrorNetwork: 'Servidor no disponible (caído, tiempo agotado o dirección incorrecta)',
    },
    en: {
        title: 'TV Multiview | Live channel monitor',
        metaDescription:
            'Open-source PWA to monitor live TV channels, compare multiple streams in a grid, and switch into a single-view mode.',
        socialDescription:
            'Live TV monitor for comparing streams, switching between grid and focus view, and saving your local setup.',
        skipContent: 'Skip to main content',
        singleView: 'Single view',
        activeSignals: 'active signals',
        channels: 'Channels',
        settings: 'Settings',
        noInternet: 'No internet connection',
        searchByCountryOrChannel: 'Search by country or channel',
        openChannelsSidebar: 'Open channel sidebar',
        openChannelsCatalog: 'Channels: open the full selector',
        openSettingsPanel: 'Open settings panel',
        filterByCountry: 'Filter by country',
        sort: 'Sort',
        ascending: 'Ascending',
        descending: 'Descending',
        defaultOrder: 'Default',
        selectChannels: 'Select your channels',
        catalogDescription: 'Browse the full catalog, filter by country, and sort it quickly.',
        sidepanelDescription:
            'Open, combine, and clear your selection without leaving the current view.',
        loadChannelsFileError:
            'An error occurred while loading the file that contains the channels',
        resetLocalStorage: 'Reset local storage',
        localStorageDeleted: 'Your local storage has been removed. Try reloading the site or PWA.',
        removeAll: 'Remove all',
        loadDefaults: 'Load defaults',
        loadDefaultsTitle: 'Load the default channels?',
        loadDefaultsBody:
            'You have {count} channel(s) on screen. You can replace your selection with the default list, or just add the ones you are missing.',
        loadDefaultsReplace: 'Replace my selection',
        loadDefaultsAdd: 'Add to what I have',
        cancel: 'Cancel',
        reload: 'Reload',
        close: 'Close',
        disclaimerTitle: 'Disclaimer',
        disclaimerItem1:
            '"tv-multiview" is a free open-source project for managing freely accessible TV channels over the Internet.',
        disclaimerItem2:
            '"tv-multiview" does not decode broadcasts. The links shown in this project are processed from public sources with open distribution or access.',
        disclaimerItem3:
            '"tv-multiview" has no monetization of any kind and therefore does not profit in any way.',
        disclaimerItem4:
            'The project includes media players, but they are not retransmissions of the channels and do not imply any decoding of them.',
        disclaimerItem5:
            'The project is neither the owner nor responsible for any content broadcast by each channel.',
        disclaimerItem6: '"tv-multiview" does not offer paid channels in any form.',
        disclaimerItem7: 'No broadcast is stored in this project.',
        disclaimerItem8:
            'The project and its maintainers assume no responsibility regarding intellectual property rights that may be infringed by third parties or any user.',
        disclaimerItem9: 'Users can always go to the official site of each broadcast.',
        disclaimerContactIntro: 'If you own the rights to any channel and want it removed,',
        contactMe: 'contact me',
        disclaimerSourceIntro: 'If you want to know the source of each livestream, visit the',
        understood: 'Understood',
        doNotShowAgain: '(Do not show again)',
        quickSummary: 'Quick summary',
        layout: 'Layout',
        localSave: 'Local save',
        recommendedShortcut: 'Recommended shortcut',
        active: 'Active',
        navbar: 'Top bar',
        gridView: 'Grid view',
        overlayChannels: 'Channel overlay',
        overlayButtons: 'Overlay buttons',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        size: 'Size',
        fullHeight: 'Full height',
        channelsPerRow: 'Channels per row',
        floatingButtons: 'Floating buttons',
        buttonText: 'Button text',
        information: 'Information',
        repository: 'Repository',
        infoDescription:
            'Customize the interface, install the PWA, and keep your channel selection locally.',
        backgroundLogo: 'Background logo',
        install: 'Install',
        savingChannels: 'Saving channels',
        languageSelector: 'Language selector',
        visible: 'Visible',
        hidden: 'Hidden',
        expanded: 'Expanded',
        reduced: 'Reduced',
        disabled: 'Disabled',
        all: 'All',
        unknown: 'Unknown',
        move: 'Move',
        movePanel: 'Drag and move this panel [left-right]',
        moveChannel: 'Drag and move this channel (or use the arrow keys)',
        change: 'Change',
        changeChannel: 'Change this channel',
        remove: 'Remove',
        removeChannel: 'Remove channel',
        selectSignal: 'Select stream',
        selectDifferentSignal: 'Select a different stream',
        officialPage: 'Go to the official page for this stream',
        resetModalTitle: 'Are you sure you want to reset all your customizations?',
        resetModalBody:
            'If you continue, every entry created by this site in your browser local storage will be removed.',
        resetModalNote:
            'If the page is not working properly, clearing the browser cache is also recommended.',
        reset: 'Reset',
        alreadySingleView: 'You are already in single-view mode',
        alreadyGridView: 'You are already in grid mode',
        iptvBadge: 'IPTV channel added by experimental mode',
        shareText: 'Open-source PWA to watch and compare live news and TV streams.',
        copyLink: 'Copy link',
        copySuccess: 'Copied successfully',
        copyFailed: 'Copy failed',
        enterFullscreen: 'Enter fullscreen',
        exitFullscreen: 'Exit fullscreen',
        errorDetailsLabel: 'Error',
        errorStorageHint:
            'If the error persists after reloading, try clearing your local storage from the "Settings" panel or clearing the browser cache.',
        errorCacheHint: 'If the error persists after reloading, try clearing the browser cache.',
        errorLoadDefaultChannels: 'An error occurred while loading default channels.',
        errorClearLocalStorage: 'An error occurred while clearing the site local storage.',
        errorEnterFullscreen: 'An error occurred while requesting fullscreen mode.',
        errorExitFullscreen: 'An error occurred while exiting fullscreen mode.',
        errorCreateChannel: 'An error occurred while creating the channel with id: {channel}.',
        errorRemoveChannel: 'An error occurred while removing the channel with id: {channel}.',
        errorLoadChannels: 'An error occurred while loading default channels.',
        errorInitialLoad: 'An error occurred during the initial load.',
        errorCreateOverlay:
            'An error occurred while creating the overlay for the channel with id: {channel}.',
        errorChangeSignal:
            'An error occurred while changing the signal for the channel with id: {channel}.',
        errorCreateChannelButtons: 'An error occurred while creating the channel buttons.',
        errorCreateCountryButtons: 'An error occurred while creating the country filter buttons.',
        errorActivateCountryFilter: 'An error occurred while activating the country filter.',
        errorAdjustChannelsPerRow:
            'An error occurred while adjusting the number of channels per row.',
        errorFilterChannels: 'An error occurred while filtering channels.',
        errorRemoveAllChannels: 'An error occurred while removing all channels.',
        errorReplaceChannel:
            'An error occurred while replacing channel id: {oldChannel} with channel: {newChannel}.',
        errorSaveChannels: 'An error occurred while saving channels to local storage.',
        errorLoadSingleViewOrder:
            'An error occurred while loading the panel order for "Single View" mode.',
        errorUpdateOverlayButtons: 'An error occurred while updating the overlay button state.',
        errorActivateSingleView: 'An error occurred while enabling "Single View" mode.',
        errorDeactivateSingleView: 'An error occurred while disabling "Single View" mode.',
        channelWithoutSignals: '{channel} has no signals defined.',
        preferredSignalUnavailable:
            'Your preferred signal for {channel} ({signal}) is no longer available.',
        nextSignalFallback: 'The next available signal will be used.',
        streamUnavailable: 'Stream unavailable',
        streamErrorMixedContent: 'Blocked: source uses http:// on an https page',
        streamErrorCorsBlocked: "Blocked by the source server's CORS policy",
        streamErrorSegment: 'A stream segment failed (brief outage or expired token)',
        streamErrorTokenExpired: 'Access token likely expired',
        streamErrorNetwork: 'Server unreachable (down, timed out, or wrong address)',
    },
};

/**
 * @param {string} template
 * @param {Record<string, unknown>} [params]
 * @returns {string}
 */
function interpolate(template, params = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => `${params[key] ?? ''}`);
}

/**
 * @param {string} selector
 * @param {string} value
 * @returns {void}
 */
function setText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
        element.textContent = value;
    });
}

/**
 * @param {string} selector
 * @param {string} value
 * @returns {void}
 */
function setHtml(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
        element.innerHTML = value;
    });
}

/**
 * @param {string} selector
 * @param {string} attribute
 * @param {string} value
 * @returns {void}
 */
function setAttr(selector, attribute, value) {
    document.querySelectorAll(selector).forEach((element) => {
        element.setAttribute(attribute, value);
    });
}

/**
 * @param {string} selector
 * @param {string} value
 * @returns {void}
 */
function setLeadingText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
        const textNode = [...element.childNodes].find(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
        );
        if (textNode) {
            textNode.textContent = `${value} `;
        }
    });
}

export function getCurrentLanguage() {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage === 'es' || storedLanguage === 'en') {
        return storedLanguage;
    }

    return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

/**
 * @param {string} key
 * @param {Record<string, unknown>} [params]
 * @returns {string}
 */
export function t(key, params = {}) {
    const language = getCurrentLanguage();
    const translationsMap = /** @type {Record<string, string>} */ (
        translations[language] ?? translations.es
    );
    const template = translationsMap[key] ?? key;
    return typeof template === 'string' ? interpolate(template, params) : template;
}

export function buildReloadButtonHtml() {
    return `<button type="button" class="btn btn-light rounded-pill btn-sm w-100 border-light mt-2" onclick="location.reload()">${t('reload')} <i class="bi bi-arrow-clockwise"></i></button>`;
}

/**
 * @param {string} summary
 * @param {unknown} error
 * @param {string} [hint]
 * @returns {string}
 */
export function buildErrorToastMessage(summary, error, hint = 'storage') {
    const helpText = hint === 'cache' ? t('errorCacheHint') : t('errorStorageHint');
    return `
        <span class="fw-bold">${summary}</span>
        <hr>
        <span class="bg-dark bg-opacity-25 px-2 rounded-3">${t('errorDetailsLabel')}: ${error}</span>
        <hr>
        ${helpText}
        ${buildReloadButtonHtml()}`;
}

/**
 * @param {string} channel
 * @param {string} signal
 * @returns {string}
 */
export function buildPreferredSignalUnavailableMessage(channel, signal) {
    return `${t('preferredSignalUnavailable', { channel, signal })}<br><span class="fw-bold">${t('nextSignalFallback')}</span>.`;
}

/**
 * @param {boolean} visible
 * @returns {string}
 */
export function getVisibilityLabel(visible) {
    return `[${t(visible ? 'visible' : 'hidden')}]`;
}

/**
 * @param {boolean} isDarkTheme
 * @returns {string}
 */
export function getThemeLabel(isDarkTheme) {
    return t(isDarkTheme ? 'dark' : 'light');
}

/**
 * @param {boolean} isExpanded
 * @returns {string}
 */
export function getHeightLabel(isExpanded) {
    return t(isExpanded ? 'expanded' : 'reduced');
}

/**
 * @returns {string}
 */
export function getDisabledLabel() {
    return t('disabled');
}

/**
 * @param {string} layout
 * @returns {string}
 */
export function getLayoutLabel(layout) {
    return layout === 'vision-unica' ? t('singleView') : t('gridView');
}

function refreshLanguageButtons() {
    document.querySelectorAll('[data-language-option]').forEach((button) => {
        const element = /** @type {HTMLElement} */ (button);
        const isActive = element.dataset.languageOption === getCurrentLanguage();
        element.classList.toggle('active', isActive);
        element.setAttribute('aria-pressed', `${isActive}`);
    });
}

function refreshTooltips() {
    if (!window.bootstrap?.Tooltip) return;

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
        const target = /** @type {HTMLElement} */ (element);
        const instance = window.bootstrap.Tooltip.getInstance(target);
        if (instance) {
            instance.dispose();
            new window.bootstrap.Tooltip(target);
        }
    });
}

export function translatePage() {
    document.documentElement.lang = getCurrentLanguage();
    document.title = t('title');

    setAttr('meta[name="description"]', 'content', t('metaDescription'));
    setAttr('meta[property="og:description"]', 'content', t('socialDescription'));
    setAttr('meta[name="twitter:description"]', 'content', t('socialDescription'));

    setText('.skip-link', t('skipContent'));
    setText('#alerta-error-carga-canales h1:nth-of-type(2)', t('loadChannelsFileError'));
    setHtml(
        '#alerta-error-carga-canales .btn.btn-light',
        `<i class="bi bi-arrow-clockwise"></i> ${t('reload')}`,
    );
    setHtml(
        '#boton-borrar-localstorage-no-carga-canales strong',
        `<i class="bi bi-trash3"></i> ${t('resetLocalStorage')}`,
    );
    setText('#alerta-borrado-localstorage .text-flicker', t('localStorageDeleted'));
    setHtml(
        '#alerta-borrado-localstorage .btn.btn-lg.btn-light.mt-5',
        `<i class="bi bi-arrow-clockwise"></i> ${t('reload')}`,
    );

    setHtml(
        '#navbar .btn-outline-indigo.rounded-end-pill',
        `<i class="bi bi-collection-play"></i> ${t('channels')}`,
    );
    setAttr('#navbar .btn-indigo.rounded-start-pill', 'aria-label', t('openChannelsSidebar'));
    setAttr('#navbar .btn-outline-indigo.rounded-end-pill', 'aria-label', t('openChannelsCatalog'));
    setHtml('#navbar-toggler .dropdown-item', `<i class="bi bi-gear"></i> ${t('settings')}`);
    // Botones de filtro y orden de los selectores de canales (modal, panel lateral,
    // cambiar canal y visión única): las claves existían pero nunca se aplicaban.
    setHtml(
        'button[data-bs-target$="collapse-btn-group"]',
        `<i class="bi bi-funnel"></i> ${t('filterByCountry')}`,
    );
    setHtml('button[data-i18n-sort]', `<i class="bi bi-sort-down"></i> ${t('sort')}`);
    setAttr('#navbar .btn.btn-sm.btn-outline-secondary.d-lg-none', 'title', t('settings'));
    setAttr(
        '#navbar .btn.btn-sm.btn-outline-secondary.d-lg-none',
        'aria-label',
        t('openSettingsPanel'),
    );
    setAttr('.language-switcher', 'aria-label', t('languageSelector'));
    setHtml(
        '#alerta-internet-status',
        `<i class="bi bi-cloud-slash bg-danger-subtle rounded-3 p-1"></i> ${t('noInternet')} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="${t('close')}"></button>`,
    );
    setAttr('#alerta-internet-status .btn-close', 'aria-label', t('close'));

    setHtml(
        '#boton-mover-panel-canales-vision-unica',
        `${t('move')} <i class="bi bi-arrows-move ms-auto"></i>`,
    );
    setAttr('#boton-mover-panel-canales-vision-unica', 'data-bs-title', t('movePanel'));
    setAttr('#vision-unica-input-filtro', 'placeholder', t('searchByCountryOrChannel'));
    setAttr('#vision-unica-input-filtro', 'aria-label', t('searchByCountryOrChannel'));
    setText('label[for="vision-unica-input-filtro"]', t('searchByCountryOrChannel'));
    setAttr('#modal-canales-input-filtro', 'placeholder', t('searchByCountryOrChannel'));
    setAttr('#modal-canales-input-filtro', 'aria-label', t('searchByCountryOrChannel'));
    setAttr('#offcanvas-canales-input-filtro', 'placeholder', t('searchByCountryOrChannel'));
    setAttr('#offcanvas-canales-input-filtro', 'aria-label', t('searchByCountryOrChannel'));

    setText('#modal-canales-titulo', t('selectChannels'));
    setText('#modal-canales .panel-description', t('catalogDescription'));
    setText('#offcanvas-canales-titulo', t('selectChannels'));
    setText('#offcanvas-canales .panel-description', t('sidepanelDescription'));
    setText('label[for="modal-canales-input-filtro"]', t('searchByCountryOrChannel'));
    setText('label[for="offcanvas-canales-input-filtro"]', t('searchByCountryOrChannel'));

    setHtml(
        '#boton-modal-quitar-todo-canal-activo',
        `<i class="bi bi-power"></i> ${t('removeAll')}`,
    );
    setHtml(
        '#boton-offcanvas-quitar-todo-canal-activo',
        `<i class="bi bi-power"></i> ${t('removeAll')}`,
    );
    setHtml(
        '#boton-modal-cargar-canales-por-defecto',
        `<i class="bi bi-arrow-clockwise"></i> ${t('loadDefaults')}`,
    );
    setHtml(
        '#boton-offcanvas-cargar-canales-por-defecto',
        `<i class="bi bi-arrow-clockwise"></i> ${t('loadDefaults')}`,
    );
    setText('#modal-canales .modal-footer .btn.btn-secondary.ms-auto.rounded-pill', t('close'));
    setText('#offcanvas-canales footer .btn.btn-secondary.ms-auto.rounded-pill', t('close'));
    setAttr('#modal-canales .btn-close', 'aria-label', t('close'));
    setAttr('#offcanvas-canales .btn-close', 'aria-label', t('close'));

    setText('#modal-bienvenida .modal-title', t('disclaimerTitle'));
    for (let index = 1; index <= 9; index += 1) {
        setText(`#modal-bienvenida li:nth-child(${index})`, t(`disclaimerItem${index}`));
    }
    setHtml(
        '#modal-bienvenida li:nth-child(10)',
        `${t('disclaimerContactIntro')} <a href="https://github.com/MediaHub-Org/tv-multiview/issues" rel="nofollow noreferrer">${t('contactMe')} <i class="bi bi-box-arrow-up-right"></i></a>.`,
    );
    setHtml(
        '#modal-bienvenida .modal-body > p',
        `- ${t('disclaimerSourceIntro')} <a href="https://github.com/MediaHub-Org/tv-multiview" rel="nofollow noreferrer"><i class="bi bi-github"></i> ${t('repository')} <i class="bi bi-box-arrow-up-right"></i></a>.`,
    );
    setHtml(
        '#boton-entendido',
        `${t('understood')} <p class="fs-x-small m-0 p-0">${t('doNotShowAgain')}</p>`,
    );

    setText('#grupo-botones-flotantes .btn-indigo span', t('channels'));
    setText('#grupo-botones-flotantes .btn-dark span', t('settings'));
    setAttr('#grupo-botones-flotantes .btn-dark', 'aria-label', t('openSettingsPanel'));

    setText('#sidepanel-titulo', t('settings'));
    setText('.panel-summary-eyebrow', t('quickSummary'));
    // :nth-of-type counts siblings within each element's own parent, and each label
    // is the only <span> in its <div> — ":nth-of-type(1)" alone matched all four,
    // overwriting every label with the same text. Scope through the parent instead.
    setText('.panel-summary-grid > div:nth-child(1) .panel-summary-label', t('layout'));
    setText('.panel-summary-grid > div:nth-child(2) .panel-summary-label', t('activeSignals'));
    setText('.panel-summary-grid > div:nth-child(3) .panel-summary-label', t('localSave'));
    setText(
        '.panel-summary-grid > div:nth-child(4) .panel-summary-label',
        t('recommendedShortcut'),
    );
    setText('.panel-summary-grid > div:nth-child(3) strong', t('active'));
    setText('.panel-summary-grid > div:nth-child(4) strong', t('singleView'));
    setText('[data-ui-active-label]', t('activeSignals'));
    setLeadingText('label[for="checkbox-personalizar-visualizacion-navbar"]', t('navbar'));
    setHtml(
        '#boton-activar-diseño-vision-grid span',
        `<i class="bi bi-grid-3x2"></i> ${t('gridView')}`,
    );
    setHtml(
        '#boton-activar-diseño-vision-unica span',
        `<i class="bi bi-layout-sidebar"></i> ${t('singleView')}`,
    );
    setLeadingText(
        'label[for="checkbox-personalizar-visualizacion-overlay"]',
        t('overlayChannels'),
    );
    setText('#grupo-botones-personalizar-botones-dentro-overlay > p', t('overlayButtons'));
    setLeadingText('label[for="checkbox-personalizar-tema"]', t('theme'));
    setLeadingText('label[for="input-range-tamaño-container-vision-cuadricula"]', t('size'));
    setLeadingText('label[for="checkbox-personalizar-altura-canales"]', t('fullHeight'));
    setLeadingText('#sidepanel li:nth-child(7) > div', t('channelsPerRow'));
    setText('#grupo-botones-posicion-botones-flotantes > p', t('floatingButtons'));
    setLeadingText('label[for="checkbox-personalizar-texto-botones-flotantes"]', t('buttonText'));
    setText(
        '#sidepanel li .bg-dark-subtle.rounded-4.w-100.py-2.px-3.border.border-light-subtle.shadow.d-flex.flex-column > p:first-child',
        t('information'),
    );
    setHtml(
        '#sidepanel li .bg-dark-subtle.rounded-4.w-100.py-2.px-3.border.border-light-subtle.shadow.d-flex.flex-column a',
        `${t('repository')} <i class="bi bi-box-arrow-up-right"></i>`,
    );
    setText(
        '#sidepanel li .bg-dark-subtle.rounded-4.w-100.py-2.px-3.border.border-light-subtle.shadow.d-flex.flex-column .text-secondary.mb-0',
        t('infoDescription'),
    );
    setLeadingText('label[for="checkbox-tarjeta-logo-background"]', t('backgroundLogo'));
    setHtml('#boton-instalar-pwa', `<i class="bi bi-plus-circle-dotted"></i> ${t('install')}`);
    setText('#sidepanel > .d-flex.p-3 .btn.btn-secondary.ms-auto.rounded-pill', t('close'));
    setAttr('#sidepanel .btn-close.close-sidepanel', 'aria-label', t('close'));

    setText('#modal-reset .modal-title', t('resetModalTitle'));
    setText('#modal-reset .modal-body p:first-child', t('resetModalBody'));
    setText('#modal-reset .modal-body p.text-secondary', t('resetModalNote'));
    setHtml('#boton-borrar-localstorage strong', `<i class="bi bi-trash3"></i> ${t('reset')}`);
    setText('#modal-reset .btn.btn-secondary.w-100.m-0.rounded-0', t('close'));

    setText('[data-country="all"] .flex-grow-1', t('all'));
    setText('[data-country="Desconocido"] .flex-grow-1', t('unknown'));
    setHtml(
        '#alerta-guardado-canales .badge.bg-success-subtle.text-success',
        `<i class="bi bi-floppy"></i> ${t('savingChannels')}`,
    );

    document.querySelectorAll('.overlay-boton-selecionar-señal').forEach((element) => {
        element.setAttribute('title', t('selectDifferentSignal'));
        element.innerHTML = `<span>${t('selectSignal')}</span><i class="bi bi-collection" data-bs-toggle="tooltip" data-bs-title="${t('selectDifferentSignal')}"></i>`;
    });
    document.querySelectorAll('.overlay-boton-mover').forEach((element) => {
        element.setAttribute('aria-label', t('moveChannel'));
        element.setAttribute('title', t('moveChannel'));
        element.setAttribute('data-bs-title', t('moveChannel'));
        element.innerHTML = `<span>${t('move')}</span><i class="bi bi-arrows-move"></i>`;
    });
    document.querySelectorAll('.overlay-boton-cambiar').forEach((element) => {
        element.setAttribute('title', t('changeChannel'));
        element.setAttribute('data-bs-title', t('changeChannel'));
        element.innerHTML = `<span>${t('change')}</span><i class="bi bi-arrow-repeat"></i>`;
    });
    document.querySelectorAll('.overlay-boton-pagina-oficial').forEach((element) => {
        element.setAttribute('title', t('officialPage'));
        element.setAttribute('data-bs-title', t('officialPage'));
        // El nombre del canal lo pone channelUI y no se traduce; solo se recompone
        // el aria-label para que la parte traducible siga el idioma elegido.
        const nombreCanal = element.querySelector('span')?.textContent.trim();
        if (nombreCanal) element.setAttribute('aria-label', `${nombreCanal}: ${t('officialPage')}`);
    });
    document.querySelectorAll('.overlay-boton-quitar').forEach((element) => {
        element.setAttribute('aria-label', t('removeChannel'));
        element.setAttribute('title', t('removeChannel'));
        element.setAttribute('data-bs-title', t('removeChannel'));
        element.innerHTML = `<span>${t('remove')}</span><i class="bi bi-x-circle"></i>`;
    });

    refreshLanguageButtons();
    refreshTooltips();
}

/**
 * @param {string} language
 * @returns {void}
 */
export function setCurrentLanguage(language) {
    if (language !== 'es' && language !== 'en') return;

    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    translatePage();
    window.dispatchEvent(new CustomEvent('ui-language-change', { detail: { language } }));
}

export function initI18n() {
    document.querySelectorAll('[data-language-option]').forEach((button) => {
        const element = /** @type {HTMLElement} */ (button);
        if (element.dataset.i18nBound === 'true') return;
        element.dataset.i18nBound = 'true';
        element.addEventListener('click', () => {
            setCurrentLanguage(element.dataset.languageOption);
        });
    });

    translatePage();
}
