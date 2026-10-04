# Memory Game

A memory (pairs matching) game built with plain HTML, CSS and JavaScript for the
[RS School](https://rs.school/) "Memory Game" task. The player turns over cards,
remembers where each picture is and tries to find all 8 pairs in as few moves as
possible. The best results are kept in `localStorage` and shown in a leaderboard.

## Live demo

<https://krychvas.github.io/memory-game/>

The application is a set of static files, so it is published with GitHub Pages
directly from the `memory-game` branch.

## Features

- 16 cards / 8 pairs, freshly shuffled with the Fisher–Yates algorithm on every
  page load and on every new game.
- The game starts automatically, with 0 moves and 0 of 8 pairs found.
- Two cards per turn; a matching pair stays open, a mismatching pair stays
  visible for 900 ms and then closes. While it is open, no other card can be
  picked, and repeated clicks on open or matched cards are ignored.
- Moves counter and found-pairs counter.
- Victory dialog with the final number of moves, a "New Game" button and a
  "Close" button.
- Leaderboard dialog with the top 10 results: place, moves and date in
  `DD.MM.YYYY` format. Results with fewer moves go first, ties are broken by the
  earlier game.
- "New Game" restarts the game without reloading the page, cancels the pending
  mismatch timer and closes the dialogs.
- Results are stored in `localStorage`, so they survive a page reload and a
  browser restart. An unfinished game is never saved.
- Both dialogs share one modal component: darkened backdrop, closing with the
  button, a click on the backdrop or the `Escape` key, locked page scrolling and
  keyboard focus kept inside the dialog.
- Responsive layout and visible keyboard focus.

## Project structure

```
memory-game/
├── index.html                    # empty <body>, only the module script
├── README.md
└── src/
    ├── index.js                  # builds the UI and wires everything together
    ├── components/
    │   ├── board.js              # playing field and cards
    │   ├── header.js             # header with the two buttons
    │   ├── leaderboardModal.js   # leaderboard dialog content
    │   ├── modal.js              # shared modal shell (open / close / backdrop)
    │   ├── scoreBoard.js         # moves and pairs counters
    │   └── winModal.js           # victory dialog content
    ├── constants/
    │   ├── cardsData.js          # the 8 pictures
    │   └── config.js             # pairs count, mismatch delay, storage key
    ├── game/
    │   └── createGame.js         # game state and rules
    ├── styles/
    │   └── style.css
    ├── utils/
    │   ├── createElement.js      # wrapper around document.createElement
    │   ├── shuffle.js            # Fisher–Yates shuffle
    │   └── storage.js            # localStorage leaderboard
    └── assets/img/               # card images
```

## Local setup

The application uses native ES modules, so it must be served over HTTP —
opening `index.html` directly from the file system (`file://`) will not work.

Clone the repository and switch to the working branch:

```bash
git clone https://github.com/KrychVas/memory-game.git
cd memory-game
git checkout memory-game
```

Start any static server from the repository root, for example:

```bash
npx serve .
```

or, if Python is installed:

```bash
python -m http.server 8080
```

Then open the printed address (`http://localhost:3000` for `serve`,
`http://localhost:8080` for Python). In VS Code the "Live Server" extension
works as well: right-click `index.html` and choose "Open with Live Server".

No dependencies need to be installed — the project has no build step and no
third-party libraries.

## How to play

1. The board starts face down.
2. Click a card to turn it over, then click a second one.
3. If the pictures match, both cards stay open and the pairs counter grows.
4. If they do not match, both cards are shown for a moment and then turn back.
5. Find all 8 pairs — the victory dialog shows how many moves it took.
6. Use "New Game" in the header to reshuffle at any time, and "Leaderboard" to
   see the best results.

## Implementation notes

The task has strict constraints, and the code follows them:

- `<body>` in `index.html` contains nothing but the `<script>` tag; every
  element is created in JavaScript, through `document.createElement` or the
  `createElement` helper in `src/utils/createElement.js`.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`,
  `DOMParser` and `Range.createContextualFragment` are not used anywhere —
  text is set with `textContent` and nodes are added with `append`.
- `alert`, `confirm` and `prompt` are not used; dialogs are built on the native
  `<dialog>` element.
- No UI or game-logic libraries or frameworks: only vanilla JavaScript and CSS.

## Author

Vasyl Krychfalushii — [@KrychVas](https://github.com/KrychVas)
