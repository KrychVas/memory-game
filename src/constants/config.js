import { CARD_ITEMS } from './cardsData.js';

/** Number of pairs on the board (8 by default, derived from the card dataset). */
export const TOTAL_PAIRS = CARD_ITEMS.length;

/** How long a mismatched pair stays visible, in milliseconds (700-1500 required). */
export const MISMATCH_DELAY_MS = 900;

/** How many results the leaderboard keeps. */
export const MAX_RESULTS = 10;

/** localStorage key that stores the leaderboard. */
export const STORAGE_KEY = 'memory-game:results';
