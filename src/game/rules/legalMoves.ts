import type { Card, GameState, GemColor, Move, Player } from '../types';
import { GEM_COLORS, MAX_RESERVED, TAKE_TWO_MIN, TIERS } from '../data/constants';
import { canAfford } from './cost';

export interface Legality {
  ok: boolean;
  reason?: string;
}

const OK: Legality = { ok: true };
const no = (reason: string): Legality => ({ ok: false, reason });

/** The active player. */
export function activePlayer(state: GameState): Player {
  return state.players[state.current];
}

/** Find a visible (board) card by id, with its tier and slot index. */
export function findVisible(
  state: GameState,
  cardId: string,
): { card: Card; tier: (typeof TIERS)[number]; index: number } | null {
  for (const tier of TIERS) {
    const index = state.visible[tier].findIndex((c) => c?.id === cardId);
    if (index >= 0) {
      return { card: state.visible[tier][index] as Card, tier, index };
    }
  }
  return null;
}

/** Validate a single move against the current state. */
export function isLegal(state: GameState, move: Move): Legality {
  if (state.phase !== 'playing') return no('Game is over.');
  if (state.pending) return no('Resolve the pending decision first.');
  const player = activePlayer(state);

  switch (move.type) {
    case 'takeThree': {
      const colors = move.colors;
      if (colors.length === 0) return no('Pick at least one gem.');
      if (colors.length > 3) return no('You may take at most 3 gems.');
      if (new Set(colors).size !== colors.length) return no('Gems must be different colors.');
      for (const c of colors) {
        if (state.bank[c] <= 0) return no(`No ${c} gems left in the bank.`);
      }
      // Taking fewer than 3 is only allowed when fewer than 3 colors are available.
      if (colors.length < 3) {
        const availableColors = GEM_COLORS.filter((c) => state.bank[c] > 0).length;
        if (availableColors > colors.length) {
          return no('Take 3 different gems when enough colors are available.');
        }
      }
      return OK;
    }
    case 'takeTwo': {
      if (state.bank[move.color] < TAKE_TWO_MIN) {
        return no(`Need at least ${TAKE_TWO_MIN} ${move.color} gems in the bank to take two.`);
      }
      return OK;
    }
    case 'reserveVisible': {
      if (player.reserved.length >= MAX_RESERVED) return no('You already have 3 reserved cards.');
      if (!findVisible(state, move.cardId)) return no('That card is not on the board.');
      return OK;
    }
    case 'reserveDeck': {
      if (player.reserved.length >= MAX_RESERVED) return no('You already have 3 reserved cards.');
      if (state.decks[move.tier].length === 0) return no('That deck is empty.');
      return OK;
    }
    case 'purchase': {
      const card =
        move.from === 'board'
          ? findVisible(state, move.cardId)?.card
          : player.reserved.find((c) => c.id === move.cardId);
      if (!card) return no('Card not available to purchase.');
      if (!canAfford(player, card)) return no('You cannot afford that card.');
      return OK;
    }
  }
}

/**
 * Enumerate every legal move for the active player. Used by the AI. Take-gem
 * moves are limited to a sensible, non-redundant set.
 */
export function enumerateMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  if (state.phase !== 'playing' || state.pending) return moves;
  const player = activePlayer(state);

  // takeThree: all combinations of up to 3 distinct available colors.
  const available = GEM_COLORS.filter((c) => state.bank[c] > 0);
  if (available.length >= 3) {
    for (let i = 0; i < available.length; i++)
      for (let j = i + 1; j < available.length; j++)
        for (let k = j + 1; k < available.length; k++)
          moves.push({ type: 'takeThree', colors: [available[i], available[j], available[k]] });
  } else if (available.length > 0) {
    // Fewer than 3 colors available: take all that remain.
    moves.push({ type: 'takeThree', colors: available as GemColor[] });
  }

  // takeTwo
  for (const c of GEM_COLORS) {
    if (state.bank[c] >= TAKE_TWO_MIN) moves.push({ type: 'takeTwo', color: c });
  }

  // reserve (visible + blind from decks), only if room remains
  if (player.reserved.length < MAX_RESERVED) {
    for (const tier of TIERS) {
      for (const card of state.visible[tier]) {
        if (card) moves.push({ type: 'reserveVisible', cardId: card.id });
      }
      if (state.decks[tier].length > 0) moves.push({ type: 'reserveDeck', tier });
    }
  }

  // purchase (board + reserved)
  for (const tier of TIERS) {
    for (const card of state.visible[tier]) {
      if (card && canAfford(player, card)) {
        moves.push({ type: 'purchase', cardId: card.id, from: 'board' });
      }
    }
  }
  for (const card of player.reserved) {
    if (canAfford(player, card)) {
      moves.push({ type: 'purchase', cardId: card.id, from: 'reserved' });
    }
  }

  return moves;
}
