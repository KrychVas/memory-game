import { MISMATCH_DELAY_MS, TOTAL_PAIRS } from '../constants/config.js';
import { saveResult } from '../utils/storage.js';

/**
 * The game rules and the state they depend on.
 *
 * A turn is two different available cards. The second card always counts as a
 * move. A matching pair stays open, a mismatching one is closed again after
 * MISMATCH_DELAY_MS, and until then the board is locked.
 */
export function createGame({ board, scoreBoard, onWin }) {
    let moves = 0;
    let pairsFound = 0;
    let firstCard = null;
    let secondCard = null;
    let isBoardLocked = false;
    let isGameOver = false;
    let mismatchTimerId = null;

    function updateScoreBoard() {
        scoreBoard.update(moves, pairsFound);
    }

    /** Ends the current turn and makes the board clickable again. */
    function resetTurn() {
        firstCard = null;
        secondCard = null;
        isBoardLocked = false;
    }

    function clearMismatchTimer() {
        if (mismatchTimerId !== null) {
            clearTimeout(mismatchTimerId);
            mismatchTimerId = null;
        }
    }

    function finishGame() {
        isGameOver = true;
        isBoardLocked = true;

        // Saved once per win: the dialog may be opened and closed many times.
        const results = saveResult(moves);

        onWin({ moves, results });
    }

    function handleMatch() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

        pairsFound += 1;
        resetTurn();
        updateScoreBoard();

        if (pairsFound === TOTAL_PAIRS) {
            finishGame();
        }
    }

    function handleMismatch() {
        isBoardLocked = true;

        mismatchTimerId = setTimeout(() => {
            mismatchTimerId = null;

            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');

            resetTurn();
        }, MISMATCH_DELAY_MS);
    }

    function handleCardSelect(card) {
        if (isBoardLocked || isGameOver) {
            return;
        }

        // Repeated clicks on an open, matched or already chosen card do nothing.
        if (card === firstCard || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');

        if (firstCard === null) {
            firstCard = card;
            return;
        }

        secondCard = card;
        moves += 1;
        updateScoreBoard();

        if (firstCard.dataset.id === secondCard.dataset.id) {
            handleMatch();
        } else {
            handleMismatch();
        }
    }

    /**
     * Starts a game, or restarts one without reloading the page: any pending
     * mismatch timer is cancelled first, so an open mismatched pair can never
     * interfere with the new board.
     */
    function start() {
        clearMismatchTimer();

        moves = 0;
        pairsFound = 0;
        isGameOver = false;
        resetTurn();

        board.render(handleCardSelect);
        updateScoreBoard();
    }

    return { start };
}
