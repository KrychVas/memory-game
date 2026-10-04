import { createElement } from '../utils/createElement.js';
import { TOTAL_PAIRS } from '../constants/config.js';

function createScoreItem(label, initialValue) {
    const item = createElement('p', 'score-board__item');
    const labelEl = createElement('span', 'score-board__label', {}, label);
    const valueEl = createElement('span', 'score-board__value', {}, initialValue);

    item.append(labelEl, valueEl);

    return { item, valueEl };
}

/** Moves counter and found-pairs counter shown above the board. */
export function createScoreBoard() {
    const element = createElement('div', 'score-board', { 'aria-live': 'polite' });

    const moves = createScoreItem('Moves', '0');
    const pairs = createScoreItem('Pairs found', `0 / ${TOTAL_PAIRS}`);

    element.append(moves.item, pairs.item);

    return {
        element,
        update(movesCount, pairsCount) {
            moves.valueEl.textContent = String(movesCount);
            pairs.valueEl.textContent = `${pairsCount} / ${TOTAL_PAIRS}`;
        },
    };
}
