import { createElement } from '../utils/createElement.js';
import { createModal } from './modal.js';
import { formatDate, loadResults } from '../utils/storage.js';

const COLUMNS = ['Place', 'Moves', 'Date'];

function createLeaderboardTable(results) {
    const table = createElement('table', 'leaderboard');

    const head = createElement('thead');
    const headRow = createElement('tr');
    COLUMNS.forEach((column) => {
        headRow.append(createElement('th', 'leaderboard__heading', { scope: 'col' }, column));
    });
    head.append(headRow);

    const body = createElement('tbody');
    results.forEach((result, index) => {
        const row = createElement('tr', 'leaderboard__row');
        row.append(
            createElement('td', 'leaderboard__cell', {}, String(index + 1)),
            createElement('td', 'leaderboard__cell', {}, String(result.moves)),
            createElement('td', 'leaderboard__cell', {}, formatDate(result.date)),
        );
        body.append(row);
    });

    table.append(head, body);

    return table;
}

export function createLeaderboardModal() {
    const modal = createModal({ title: 'Leaderboard', className: 'modal--leaderboard' });

    const closeButton = createElement('button', 'btn btn--secondary', { type: 'button' }, 'Close');
    closeButton.addEventListener('click', modal.close);
    modal.footer.append(closeButton);

    return {
        element: modal.dialog,
        open() {
            modal.body.textContent = '';

            const results = loadResults();
            if (results.length === 0) {
                modal.body.append(
                    createElement(
                        'p',
                        'modal__text',
                        {},
                        'No results yet. Win a game to get on the board!',
                    ),
                );
            } else {
                modal.body.append(createLeaderboardTable(results));
            }

            modal.open();
        },
        close: modal.close,
    };
}
