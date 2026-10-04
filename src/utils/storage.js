import { MAX_RESULTS, SOUND_STORAGE_KEY, STORAGE_KEY } from '../constants/config.js';

function isValidResult(result) {
    return (
        typeof result === 'object' &&
        result !== null &&
        Number.isFinite(result.moves) &&
        typeof result.date === 'string' &&
        !Number.isNaN(new Date(result.date).getTime())
    );
}

function compareResults(a, b) {
    if (a.moves !== b.moves) {
        return a.moves - b.moves;
    }
    return new Date(a.date) - new Date(b.date);
}

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
        console.warn('Leaderboard could not be read:', error);
        return [];
    }
}

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

export function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${day}.${month}.${date.getFullYear()}`;
}

export function loadSoundEnabled() {
    try {
        return localStorage.getItem(SOUND_STORAGE_KEY) !== 'off';
    } catch (error) {
        console.warn('Sound preference could not be read:', error);
        return true;
    }
}

export function saveSoundEnabled(enabled) {
    try {
        localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off');
    } catch (error) {
        console.warn('Sound preference could not be saved:', error);
    }
}
