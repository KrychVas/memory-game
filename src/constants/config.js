import { CARD_ITEMS } from './cardsData.js';

/** Number of pairs on the board (8 by default, derived from the card dataset). */
export const TOTAL_PAIRS = CARD_ITEMS.length;

/** Number of card columns in the grid; used to stagger the preview wave. */
export const BOARD_COLUMNS = 4;

/** How long a mismatched pair stays visible, in milliseconds (700-1500 required). */
export const MISMATCH_DELAY_MS = 900;

/** How many results the leaderboard keeps. */
export const MAX_RESULTS = 10;

/** localStorage key that stores the leaderboard. */
export const STORAGE_KEY = 'memory-game:results';

/** localStorage key that remembers whether sound is on. */
export const SOUND_STORAGE_KEY = 'memory-game:sound';

/**
 * Optional extra: every card is shown face up for a moment when a game starts,
 * so the player can memorise the layout. Set to false to start with all cards
 * face down immediately, which is the strict reading of the task rules.
 */
export const CARD_PREVIEW_ENABLED = true;

/** How long the preview faces stay visible, in milliseconds. */
export const CARD_PREVIEW_MS = 2500;

/** Delay between neighbouring cards while the preview wave opens, in milliseconds. */
export const CARD_PREVIEW_STAGGER_MS = 45;

/** Background music note length in seconds. */
export const MUSIC_NOTE_SECONDS = 0.26;
