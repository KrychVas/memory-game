import { createElement } from './utils/createElement.js';

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

    console.log('Memory Game skeleton successfully loaded!');
}

initApp();