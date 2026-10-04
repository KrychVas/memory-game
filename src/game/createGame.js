import {
    BOARD_COLUMNS,
    CARD_PREVIEW_ENABLED,
    CARD_PREVIEW_MS,
    CARD_PREVIEW_STAGGER_MS,
    MISMATCH_DELAY_MS,
    TOTAL_PAIRS,
} from '../constants/config.js';
import { saveResult } from '../utils/storage.js';

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

    function start() {
        clearPendingTimers();

        moves = 0;
        pairsFound = 0;
        isGameOver = false;
        resetTurn();

        const cards = board.render(handleCardSelect);
        updateScoreBoard();

        void board.element.offsetWidth;

        startPreview(cards);
    }

    return { start };
}
