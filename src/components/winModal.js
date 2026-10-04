import { createElement } from '../utils/createElement.js';
import { createModal } from './modal.js';

/**
 * Victory dialog. It shows the result of the finished game and offers to
 * restart or to just close the dialog and keep the final board on screen.
 */
export function createWinModal({ onNewGame }) {
    const modal = createModal({ title: 'You won!', className: 'modal--win' });

    const message = createElement(
        'p',
        'modal__text',
        {},
        'Congratulations, you have found all the pairs!',
    );

    const resultLine = createElement('p', 'modal__result');
    const resultLabel = createElement('span', 'modal__result-label', {}, 'Moves spent: ');
    const resultValue = createElement('span', 'modal__result-value', {}, '0');
    resultLine.append(resultLabel, resultValue);

    modal.body.append(message, resultLine);

    const newGameButton = createElement('button', 'btn', { type: 'button' }, 'New Game');
    const closeButton = createElement('button', 'btn btn--secondary', { type: 'button' }, 'Close');

    newGameButton.addEventListener('click', onNewGame);
    closeButton.addEventListener('click', modal.close);

    modal.footer.append(newGameButton, closeButton);

    return {
        element: modal.dialog,
        open(moves) {
            resultValue.textContent = String(moves);
            modal.open();
        },
        close: modal.close,
    };
}
