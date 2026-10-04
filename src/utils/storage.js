import { MAX_RESULTS, STORAGE_KEY } from '../constants/config.js';

/**
 * Keeps only entries that look like a finished game, so a corrupted or
 * hand-edited localStorage value can never break the leaderboard.
 */
function isValidResult(result) {
    return (
        typeof result === 'object' &&
        result !== null &&
        Number.isFinite(result.moves) &&
        typeof result.date === 'string' &&
        !Number.isNaN(new Date(result.date).getTime())
    );
}

/** Fewer moves first; on a tie the earlier game wins. */
function compareResults(a, b) {
    if (a.moves !== b.moves) {
        return a.moves - b.moves;
    }
    return new Date(a.date) - new Date(b.date);
}

/** Reads the saved results, best first, at most MAX_RESULTS entries. */
export function loadResults() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .filter(isValidResult)
            .sort(compareResults)
            .slice(0, MAX_RESULTS);
    } catch (error) {
        // Private mode or a broken value: play on with an empty leaderboard.
        console.warn('Leaderboard could not be read:', error);
        return [];
    }
}

/**
 * Adds one finished game to the leaderboard and returns the updated top list.
 * Called exactly once per win, so no duplicate entries are created.
 */
export function saveResult(moves) {
    const results = [...loadResults(), { moves, date: new Date().toISOString() }];
    const best = results.sort(compareResults).slice(0, MAX_RESULTS);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
    } catch (error) {
        console.warn('Result could not be saved:', error);
    }

    return best;
}

/** Formats a stored date as DD.MM.YYYY without the time part. */
export function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${day}.${month}.${date.getFullYear()}`;
}
