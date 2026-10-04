import { createElement } from '../utils/createElement.js';

/** Every modal that is currently open; used for scroll lock and bulk closing. */
const openModals = new Set();

let modalCounter = 0;

function syncScrollLock() {
    document.body.classList.toggle('modal-open', openModals.size > 0);
}

/** Closes every open modal, e.g. before a new game starts. */
export function closeAllModals() {
    [...openModals].forEach((modal) => modal.close());
}

/**
 * Builds the shared modal shell: darkened backdrop, title, body and footer.
 * Only the content is modal-specific, so creation, opening and closing are
 * written once and reused by every dialog in the app.
 *
 * Closing works with the Close button (wired by the caller), a click on the
 * backdrop and the Escape key, which the native <dialog> handles for us.
 * The page behind the modal is inert while it is open, and scrolling is locked.
 */
export function createModal({ title = '', className = '' } = {}) {
    modalCounter += 1;
    const titleId = `modal-title-${modalCounter}`;

    const dialog = createElement('dialog', `modal ${className}`.trim(), {
        'aria-labelledby': titleId,
    });
    const windowEl = createElement('div', 'modal__window');
    const titleEl = createElement('h2', 'modal__title', { id: titleId }, title);
    const body = createElement('div', 'modal__body');
    const footer = createElement('div', 'modal__footer');

    windowEl.append(titleEl, body, footer);
    dialog.append(windowEl);

    const close = () => {
        if (dialog.open) {
            dialog.close();
        }
    };

    const open = () => {
        closeAllModals();
        openModals.add(api);
        syncScrollLock();

        if (!dialog.open) {
            dialog.showModal();
        }
    };

    // A click on the backdrop targets the dialog element itself; a click on the
    // window content targets one of its children and therefore keeps it open.
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            close();
        }
    });

    dialog.addEventListener('close', () => {
        openModals.delete(api);
        syncScrollLock();
    });

    const api = {
        dialog,
        body,
        footer,
        titleEl,
        open,
        close,
        setTitle(text) {
            titleEl.textContent = text;
        },
    };

    return api;
}
