import type { GemColor, TokenColor, Tier } from '../types';

/** The five gem colors, in canonical display order. */
export const GEM_COLORS: GemColor[] = ['white', 'blue', 'green', 'red', 'black'];

/** All token colors including gold. */
export const TOKEN_COLORS: TokenColor[] = [...GEM_COLORS, 'gold'];

export const TIERS: Tier[] = [1, 2, 3];

/** Number of face-up market slots per tier. */
export const MARKET_SIZE = 4;

/** Maximum tokens a player may hold at the end of their turn. */
export const MAX_TOKENS = 10;

/** Maximum cards a player may have reserved at once. */
export const MAX_RESERVED = 3;

/** Prestige points required to trigger the final round. */
export const WINNING_SCORE = 15;

/** Number of gold (joker) tokens, regardless of player count. */
export const GOLD_TOKENS = 5;

/** Minimum bank count of a color required to take two of it. */
export const TAKE_TWO_MIN = 4;

/** Bank count of each gem color by player count. */
export const GEM_TOKENS_BY_PLAYERS: Record<number, number> = {
  2: 4,
  3: 5,
  4: 7,
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

/** Human-friendly gem labels (the classic Splendor resource names). */
export const GEM_LABELS: Record<GemColor, string> = {
  white: 'Diamond',
  blue: 'Sapphire',
  green: 'Emerald',
  red: 'Ruby',
  black: 'Onyx',
};

/** Hex colors used for CSS/SVG fallback rendering of each gem. */
export const GEM_HEX: Record<TokenColor, string> = {
  white: '#e8eef5',
  blue: '#2d6cdf',
  green: '#1f9d55',
  red: '#d13b3b',
  black: '#33373d',
  gold: '#e7b520',
};
