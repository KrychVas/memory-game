import { createElement } from '../utils/createElement.js';
import { shuffleArray } from '../utils/shuffle.js';
import { CARD_ITEMS } from '../constants/cardsData.js';

function createCard(item, index, onSelect) {
    const card = createElement('div', 'card', {
        role: 'button',
        tabindex: '0',
        'data-id': String(item.id),
        'aria-label': `Card ${index + 1}`,
    });

    const inner = createElement('div', 'card-inner');
    const back = createElement('div', 'card-back', { 'aria-hidden': 'true' }, '?');
    const front = createElement('div', 'card-front');
    const image = createElement('img', 'card-img', {
        src: item.img,
        alt: item.name,
        draggable: 'false',
    });

    front.append(image);
    inner.append(back, front);
    card.append(inner);

    const select = () => onSelect(card);

    card.addEventListener('click', select);
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            select();
        }
    });

    return card;
}

export function createBoard() {
    const element = createElement('div', 'game-board');

    const render = (onSelect) => {
        element.textContent = '';

        const deck = shuffleArray([...CARD_ITEMS, ...CARD_ITEMS]);
        const cards = deck.map((item, index) => createCard(item, index, onSelect));

        element.append(...cards);

        return cards;
    };

    return { element, render };
}
