import { t } from '../i18n.js';

/**
 * Muestra un toast de Bootstrap.
 *
 * @param {string} [mensaje=''] HTML del cuerpo (lo compone el propio sitio).
 * @param {'primary'|'secondary'|'success'|'warning'|'danger'|'info'} [tipo='secondary']
 * @param {boolean} [autohideValue=true] false para errores que el usuario debe leer y cerrar.
 * @param {number} [delayValue=3500] Milisegundos en pantalla si se auto-oculta.
 * @returns {void}
 */
export function mostrarToast(
    mensaje = '',
    tipo = 'secondary',
    autohideValue = true,
    delayValue = 3500,
) {
    const TOAST_CONTAINER = document.querySelector('#toast-container');
    const TOAST_DIV = document.createElement('div');
    TOAST_DIV.setAttribute('role', 'alert');
    TOAST_DIV.setAttribute('aria-live', 'assertive');
    TOAST_DIV.setAttribute('aria-atomic', 'true');
    TOAST_DIV.classList.add('toast', 'd-flex', 'align-items-center', 'border-0');

    let toastIcono = '<i class="bi bi-info-circle-fill"></i>';
    if (tipo === 'success') {
        TOAST_DIV.classList.add('bg-success', 'text-white');
        toastIcono = '<i class="bi bi-check-circle"></i>';
    } else if (tipo === 'warning') {
        TOAST_DIV.classList.add('bg-warning', 'text-dark');
        toastIcono = '<i class="bi bi-exclamation-circle"></i>';
    } else if (tipo === 'danger') {
        TOAST_DIV.classList.add('bg-danger', 'text-white');
        toastIcono = '<i class="bi bi-x-circle"></i>';
    } else if (tipo === 'info') {
        TOAST_DIV.classList.add('bg-info', 'text-dark');
        toastIcono = '<i class="bi bi-info-circle"></i>';
    } else if (tipo === 'primary') {
        TOAST_DIV.classList.add('bg-primary', 'text-white');
    } else if (tipo === 'secondary') {
        TOAST_DIV.classList.add('bg-secondary', 'text-white');
    } else {
        TOAST_DIV.classList.add('bg-secondary', 'text-white');
    }

    const TOAST_BODY = document.createElement('div');
    TOAST_BODY.innerHTML = `${toastIcono} ${mensaje}`;
    TOAST_BODY.classList.add('toast-body');

    const TOAST_BOTON_CERRAR = document.createElement('button');
    TOAST_BOTON_CERRAR.setAttribute('type', 'button');
    TOAST_BOTON_CERRAR.setAttribute('data-bs-dismiss', 'toast');
    TOAST_BOTON_CERRAR.setAttribute('aria-label', t('close'));
    TOAST_BOTON_CERRAR.classList.add('btn-close', 'btn-close-white', 'me-2', 'm-auto');
    TOAST_BOTON_CERRAR.addEventListener('click', () => {
        TOAST_DIV.remove();
    });

    TOAST_DIV.append(TOAST_BODY);
    TOAST_DIV.append(TOAST_BOTON_CERRAR);
    TOAST_CONTAINER.append(TOAST_DIV);

    const BS = /** @type {any} */ (window).bootstrap;
    const BOOTSTRAP_TOAST = new BS.Toast(TOAST_DIV, {
        delay: Number(delayValue),
        autohide: autohideValue,
    });
    BOOTSTRAP_TOAST.show();
}
