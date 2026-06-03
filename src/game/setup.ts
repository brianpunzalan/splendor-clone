import type { Card, GameState, Player, PlayerType, Tier, Tokens } from './types';
import { ALL_CARDS } from './data/cards';
import { ALL_NOBLES } from './data/nobles';
import {
  GEM_COLORS,
  GEM_TOKENS_BY_PLAYERS,
  GOLD_TOKENS,
  MARKET_SIZE,
  TIERS,
} from './data/constants';
import { emptyTokens, shuffle } from './util';

export interface SeatConfig {
  name: string;
  type: PlayerType;
}

/** Build the shared token bank for a given player count. */
export function makeBank(playerCount: number): Tokens {
  const gemCount = GEM_TOKENS_BY_PLAYERS[playerCount] ?? GEM_TOKENS_BY_PLAYERS[4];
  const bank = emptyTokens();
  for (const c of GEM_COLORS) bank[c] = gemCount;
  bank.gold = GOLD_TOKENS;
  return bank;
}

function makePlayer(seat: SeatConfig, index: number): Player {
  return {
    id: `p${index}`,
    name: seat.name.trim() || `Player ${index + 1}`,
    type: seat.type,
    tokens: emptyTokens(),
    cards: [],
    reserved: [],
    nobles: [],
  };
}

/**
 * Create a fresh, fully dealt game from a list of seats. An optional `rng`
 * makes setup reproducible for tests.
 */
export function createGame(seats: SeatConfig[], rng: () => number = Math.random): GameState {
  const playerCount = seats.length;

  const decks = {} as Record<Tier, Card[]>;
  const visible = {} as Record<Tier, (Card | null)[]>;
  for (const tier of TIERS) {
    const pile = shuffle(
      ALL_CARDS.filter((c) => c.tier === tier),
      rng,
    );
    const market: (Card | null)[] = [];
    for (let i = 0; i < MARKET_SIZE; i++) market.push(pile.shift() ?? null);
    visible[tier] = market;
    decks[tier] = pile;
  }

  const nobles = shuffle(ALL_NOBLES, rng).slice(0, playerCount + 1);

  return {
    players: seats.map(makePlayer),
    current: 0,
    bank: makeBank(playerCount),
    decks,
    visible,
    nobles,
    log: [],
    phase: 'playing',
    turn: 1,
    finalRound: false,
    triggerIndex: null,
    pending: null,
    logSeq: 0,
  };
}
