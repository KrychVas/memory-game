import {
    BOARD_COLUMNS,
    CARD_PREVIEW_ENABLED,
    CARD_PREVIEW_MS,
    CARD_PREVIEW_STAGGER_MS,
    MISMATCH_DELAY_MS,
    TOTAL_PAIRS,
} from '../constants/config.js';
import { saveResult } from '../utils/storage.js';

/**
 * The game rules and the state they depend on.
 *
 * A turn is two different available cards. The second card always counts as a
 * move. A matching pair stays open, a mismatching one is closed again after
 * MISMATCH_DELAY_MS, and until then the board is locked.
 *
 * When a game starts, the cards are briefly revealed in a diagonal wave so the
 * player can memorise the layout; that preview is skipped if CARD_PREVIEW_ENABLED
 * is false, and its timer is cancelled by a restart just like the mismatch one.
 */
export function createGame({ board, scoreBoard, onWin, sound = {} }) {
    let moves = 0;
    let pairsFound = 0;
    let firstCard = null;
    let secondCard = null;
    let isBoardLocked = false;
    let isGameOver = false;
    let mismatchTimerId = null;
    let previewTimerId = null;

    function updateScoreBoard() {
        scoreBoard.update(moves, pairsFound);
    }

    /** Ends the current turn and makes the board clickable again. */
    function resetTurn() {
        firstCard = null;
        secondCard = null;
        isBoardLocked = false;
    }

    function clearPendingTimers() {
        if (mismatchTimerId !== null) {
            clearTimeout(mismatchTimerId);
            mismatchTimerId = null;
        }
        if (previewTimerId !== null) {
            clearTimeout(previewTimerId);
            previewTimerId = null;
        }
    }

    /** Shows every card face up for a moment, then turns them all back down. */
    function startPreview(cards) {
        if (!CARD_PREVIEW_ENABLED || cards.length === 0) {
            return;
        }

        isBoardLocked = true;

        cards.forEach((card, index) => {
            const row = Math.floor(index / BOARD_COLUMNS);
            const column = index % BOARD_COLUMNS;
            card.style.setProperty('--preview-delay', `${(row + column) * CARD_PREVIEW_STAGGER_MS}ms`);
            card.classList.add('preview');
        });

        previewTimerId = setTimeout(() => {
            previewTimerId = null;
            cards.forEach((card) => card.classList.remove('preview'));
            resetTurn();
        }, CARD_PREVIEW_MS);
    }

    function finishGame() {
        isGameOver = true;
        isBoardLocked = true;

        // Saved once per win: the dialog may be opened and closed many times.
        const results = saveResult(moves);

        sound.playWin?.();
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
            return;
        }

        sound.playMatch?.();
    }

    function handleMismatch() {
        isBoardLocked = true;
        sound.playMismatch?.();

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
        sound.playFlip?.();

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
     * mismatch or preview timer is cancelled first, so an open mismatched pair
     * can never interfere with the new board.
     */
    function start() {
        clearPendingTimers();

        moves = 0;
        pairsFound = 0;
        isGameOver = false;
        resetTurn();

        const cards = board.render(handleCardSelect);
        updateScoreBoard();

        // Reading a layout property forces the browser to record the face-down
        // state of the freshly added cards. Without it the preview flip would be
        // applied instantly instead of being animated.
        void board.element.offsetWidth;

        startPreview(cards);
    }

    return { start };
}
