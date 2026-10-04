import { createElement } from '../utils/createElement.js';

/**
 * Application header with the two required buttons.
 * Both stay usable during the game and after a win.
 */
export function createHeader({ onNewGame, onShowLeaderboard }) {
    const element = createElement('header', 'header');

    const title = createElement('h1', 'header__title', {}, 'Memory Game');
    const actions = createElement('div', 'header__actions');

    const newGameButton = createElement(
        'button',
        'btn header__btn',
        { type: 'button' },
        'New Game',
    );
    const leaderboardButton = createElement(
        'button',
        'btn btn--secondary header__btn',
        { type: 'button' },
        'Leaderboard',
    );

    newGameButton.addEventListener('click', onNewGame);
    leaderboardButton.addEventListener('click', onShowLeaderboard);

    actions.append(newGameButton, leaderboardButton);
    element.append(title, actions);

    return { element, newGameButton, leaderboardButton };
}
