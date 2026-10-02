import { createElement } from './utils/createElement.js';
import { shuffleArray } from './utils/shuffle.js';
import { CARD_ITEMS } from './constants/cardsData.js';

function initApp() {
    const root = document.body;

    const appContainer = createElement('div', 'app-container');

    const header = createElement('header', 'header');
    const newGameBtn = createElement('button', 'btn new-game-btn', { 'aria-label': 'New Game' }, 'New Game');
    const leaderboardBtn = createElement('button', 'btn leaderboard-btn', { 'aria-label': 'Leaderboard' }, 'Leaderboard');
    header.append(newGameBtn, leaderboardBtn);

    const scoreBoard = createElement('div', 'score-board', {}, 'Moves: 0 | Pairs: 0 / 8');
    const gameBoard = createElement('div', 'game-board');

    appContainer.append(header, scoreBoard, gameBoard);
    root.append(appContainer);

    function startGame() {
        gameBoard.textContent = '';

        const duplicatedCards = [...CARD_ITEMS, ...CARD_ITEMS];
        const randomizedCards = shuffleArray(duplicatedCards);

        randomizedCards.forEach((item, index) => {
            const card = createElement('div', 'card', { 'data-id': item.id, 'data-index': index });
            
            const cardInner = createElement('div', 'card-inner');
            const cardBack = createElement('div', 'card-back', {}, '❓');
            
            const img = createElement('img', 'card-img', { src: item.img, alt: item.name });
            const cardFront = createElement('div', 'card-front');
            cardFront.append(img);

            cardInner.append(cardBack, cardFront);
            card.append(cardInner);
            gameBoard.append(card);
        });

        console.log('Game started with pixel-art characters!');
    }

    startGame();
}

initApp();