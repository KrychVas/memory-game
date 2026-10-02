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

    const scoreBoard = createElement('div', 'score-board');
    const gameBoard = createElement('div', 'game-board');

    appContainer.append(header, scoreBoard, gameBoard);
    root.append(appContainer);

    // Ігровий стан
    let moves = 0;
    let pairsFound = 0;
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard = null;
    let secondCard = null;

    function updateScoreBoard() {
        scoreBoard.textContent = `Moves: ${moves} | Pairs: ${pairsFound} / 8`;
    }

    function startGame() {
        gameBoard.textContent = '';
        moves = 0;
        pairsFound = 0;
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        updateScoreBoard();

        const duplicatedCards = [...CARD_ITEMS, ...CARD_ITEMS];
        const randomizedCards = shuffleArray(duplicatedCards);

        randomizedCards.forEach((item, index) => {
            const card = createElement('div', 'card', { 
                'data-id': item.id, 
                'data-index': index 
            });
            
            const cardInner = createElement('div', 'card-inner');
            const cardBack = createElement('div', 'card-back', {}, '❓');
            
            const img = createElement('img', 'card-img', { src: item.img, alt: item.name });
            const cardFront = createElement('div', 'card-front');
            cardFront.append(img);

            cardInner.append(cardBack, cardFront);
            card.append(cardInner);

            card.addEventListener('click', () => flipCard(card));

            gameBoard.append(card);
        });

        console.log('Game started, logic active!');
    }

    function flipCard(card) {
        if (lockBoard) return;
        if (card === firstCard) return; 
        if (card.classList.contains('matched') || card.classList.contains('flipped')) return;

        card.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = card;
            return;
        }

        secondCard = card;
        moves++;
        updateScoreBoard();

        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.id === secondCard.dataset.id;

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

        pairsFound++;
        updateScoreBoard();

        resetBoard();

        if (pairsFound === 8) {
            setTimeout(() => {
                alert(`🎉 Congratulations! You won in ${moves} moves!`);
            }, 300);
        }
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 900);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Кнопка нової гри
    newGameBtn.addEventListener('click', startGame);

    startGame();
}

initApp();