import { createElement } from '../utils/createElement.js';

const openModals = new Set();

let modalCounter = 0;

function syncScrollLock() {
    document.body.classList.toggle('modal-open', openModals.size > 0);
}

export function closeAllModals() {
    [...openModals].forEach((modal) => modal.close());
}

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
