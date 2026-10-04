import { createElement } from '../utils/createElement.js';

/**
 * Application header. It holds the two buttons the task requires — New Game and
 * Leaderboard — plus an optional sound switch. All of them stay usable during
 * the game and after a win.
 */
export function createHeader({
    onNewGame,
    onShowLeaderboard,
    onToggleSound,
    soundEnabled = true,
}) {
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
    const soundButton = createElement('button', 'btn btn--secondary header__btn header__btn--sound', {
        type: 'button',
    });

    let isSoundOn = Boolean(soundEnabled);

    function renderSoundButton() {
        soundButton.textContent = isSoundOn ? 'Sound: on' : 'Sound: off';
        soundButton.setAttribute('aria-pressed', String(isSoundOn));
    }

    renderSoundButton();

    newGameButton.addEventListener('click', onNewGame);
    leaderboardButton.addEventListener('click', onShowLeaderboard);
    soundButton.addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        renderSoundButton();
        onToggleSound(isSoundOn);
    });

    actions.append(newGameButton, leaderboardButton, soundButton);
    element.append(title, actions);

    return {
        element,
        newGameButton,
        leaderboardButton,
        soundButton,
        setSoundEnabled(value) {
            isSoundOn = Boolean(value);
            renderSoundButton();
        },
    };
}
