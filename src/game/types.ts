// Pure, framework-agnostic type definitions for the Splendor game engine.
// No React or browser APIs may be imported here.

/** The five gem colors used for card bonuses and costs. */
export type GemColor = 'white' | 'blue' | 'green' | 'red' | 'black';

/** All token colors, including the gold (joker) wildcard. */
export type TokenColor = GemColor | 'gold';

/** The card tiers / development levels. */
export type Tier = 1 | 2 | 3;

/** A pool of tokens keyed by every token color (gold included). */
export type Tokens = Record<TokenColor, number>;

/** A cost expressed in the five gem colors (gold is never part of a cost). */
export type Cost = Record<GemColor, number>;

/** A development card. */
export interface Card {
  id: string;
  tier: Tier;
  /** The gem bonus this card permanently provides once purchased. */
  color: GemColor;
  /** Prestige points awarded by the card. */
  points: number;
  /** Token cost to purchase, before bonus discounts. */
  cost: Cost;
}

/** A noble tile. Worth a fixed 3 prestige points. */
export interface Noble {
  id: string;
  points: 3;
  /** Bonus counts (per color) required to attract this noble. */
  requirement: Cost;
}

export type PlayerType = 'human' | 'ai';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  /** Tokens currently held (gold included). */
  tokens: Tokens;
  /** Purchased development cards (provide bonuses + points). */
  cards: Card[];
  /** Reserved cards (max 3). */
  reserved: Card[];
  /** Noble tiles acquired. */
  nobles: Noble[];
}

export type LogEntry = {
  id: number;
  turn: number;
  playerId: string;
  text: string;
};

export type Phase = 'playing' | 'gameOver';

/**
 * A pending decision the engine needs the active player to resolve before the
 * turn can end. Surfaced to the UI (or resolved automatically for the AI).
 */
export type PendingDecision =
  | { type: 'returnTokens'; count: number } // holding > MAX_TOKENS, must return `count`
  | { type: 'chooseNoble'; nobleIds: string[] }; // multiple nobles eligible

export interface GameState {
  players: Player[];
  /** Index into `players` of the active player. */
  current: number;
  /** The shared token bank. */
  bank: Tokens;
  /** Remaining face-down draw piles per tier. */
  decks: Record<Tier, Card[]>;
  /** The face-up market: 4 slots per tier (null = slot permanently empty). */
  visible: Record<Tier, (Card | null)[]>;
  /** Noble tiles available on the board. */
  nobles: Noble[];
  log: LogEntry[];
  phase: Phase;
  /** Turn counter (increments each time play advances to a new seat). */
  turn: number;
  /** Set once a player reaches the winning score; the round then finishes. */
  finalRound: boolean;
  /** Seat index that triggered the final round (last player before wrap). */
  triggerIndex: number | null;
  /** Winner once the game is over. */
  winnerId?: string;
  /** A decision blocking turn completion, if any. */
  pending: PendingDecision | null;
  /** Monotonic counter used to mint log ids. */
  logSeq: number;
}

/** A move chosen by a player (human or AI). */
export type Move =
  | { type: 'takeThree'; colors: GemColor[] } // up to 3 distinct colors
  | { type: 'takeTwo'; color: GemColor } // 2 of one color (bank must have >= 4)
  | { type: 'reserveVisible'; cardId: string }
  | { type: 'reserveDeck'; tier: Tier }
  | { type: 'purchase'; cardId: string; from: 'board' | 'reserved' };
