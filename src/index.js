import { createElement } from './utils/createElement.js';
import { createHeader } from './components/header.js';
import { createScoreBoard } from './components/scoreBoard.js';
import { createBoard } from './components/board.js';
import { createWinModal } from './components/winModal.js';
import { createLeaderboardModal } from './components/leaderboardModal.js';
import { closeAllModals } from './components/modal.js';
import { createGame } from './game/createGame.js';

function initApp() {
    const appContainer = createElement('div', 'app-container');

    const header = createHeader({ onNewGame: startNewGame, onShowLeaderboard: showLeaderboard });
    const scoreBoard = createScoreBoard();
    const board = createBoard();

    const game = createGame({ board, scoreBoard, onWin: handleWin });

    const winModal = createWinModal({ onNewGame: startNewGame });
    const leaderboardModal = createLeaderboardModal();

    appContainer.append(
        header.element,
        scoreBoard.element,
        board.element,
        winModal.element,
        leaderboardModal.element,
    );

    document.body.append(appContainer);

    function startNewGame() {
        closeAllModals();
        game.start();
    }

    function showLeaderboard() {
        leaderboardModal.open();
    }

    function handleWin({ moves }) {
        winModal.open(moves);
    }

    game.start();
}

initApp();
