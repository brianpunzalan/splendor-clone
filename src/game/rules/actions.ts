import type { Card, GameState, GemColor, Move, Tier } from '../types';
import { GEM_LABELS } from '../data/constants';
import { cloneState } from '../clone';
import { computePayment } from './cost';
import { activePlayer, findVisible, isLegal } from './legalMoves';
import { checkEndOfTurn } from './endTurn';
import { pushLog } from '../log';

/** Draw the next card from a tier deck into a market slot (or null if empty). */
function refillSlot(state: GameState, tier: Tier, index: number): void {
  state.visible[tier][index] = state.decks[tier].shift() ?? null;
}

function takeThree(state: GameState, colors: GemColor[]): void {
  const player = activePlayer(state);
  for (const c of colors) {
    state.bank[c] -= 1;
    player.tokens[c] += 1;
  }
  const names = colors.map((c) => GEM_LABELS[c]).join(', ');
  pushLog(state, player.id, `took ${names}.`);
}

function takeTwo(state: GameState, color: GemColor): void {
  const player = activePlayer(state);
  state.bank[color] -= 2;
  player.tokens[color] += 2;
  pushLog(state, player.id, `took 2 ${GEM_LABELS[color]}.`);
}

function grantGold(state: GameState): boolean {
  const player = activePlayer(state);
  if (state.bank.gold > 0) {
    state.bank.gold -= 1;
    player.tokens.gold += 1;
    return true;
  }
  return false;
}

function reserveVisible(state: GameState, cardId: string): void {
  const found = findVisible(state, cardId);
  if (!found) throw new Error('Card not on board.');
  const player = activePlayer(state);
  player.reserved.push(found.card);
  refillSlot(state, found.tier, found.index);
  const gold = grantGold(state);
  pushLog(
    state,
    player.id,
    `reserved a tier ${found.card.tier} card${gold ? ' and took a gold joker' : ''}.`,
  );
}

function reserveDeck(state: GameState, tier: Tier): void {
  const player = activePlayer(state);
  const card = state.decks[tier].shift();
  if (!card) throw new Error('Deck is empty.');
  player.reserved.push(card);
  const gold = grantGold(state);
  pushLog(
    state,
    player.id,
    `reserved a card from the tier ${tier} deck${gold ? ' and took a gold joker' : ''}.`,
  );
}

function purchase(state: GameState, cardId: string, from: 'board' | 'reserved'): void {
  const player = activePlayer(state);
  let card: Card;

  if (from === 'board') {
    const found = findVisible(state, cardId);
    if (!found) throw new Error('Card not on board.');
    card = found.card;
    refillSlot(state, found.tier, found.index);
  } else {
    const idx = player.reserved.findIndex((c) => c.id === cardId);
    if (idx < 0) throw new Error('Card not reserved.');
    card = player.reserved.splice(idx, 1)[0];
  }

  const payment = computePayment(player, card);
  if (!payment) throw new Error('Cannot afford card.');
  for (const color of Object.keys(payment.spend) as (keyof typeof payment.spend)[]) {
    const n = payment.spend[color];
    player.tokens[color] -= n;
    state.bank[color] += n;
  }
  player.cards.push(card);

  const goldNote = payment.goldUsed > 0 ? ` (using ${payment.goldUsed} gold)` : '';
  pushLog(
    state,
    player.id,
    `purchased a ${GEM_LABELS[card.color]} card${card.points ? ` worth ${card.points}` : ''}${goldNote}.`,
  );
}

/**
 * Apply a full move: validate, mutate a clone, log, then run end-of-turn
 * processing (which may leave a `pending` decision for the player to resolve).
 * Throws if the move is illegal.
 */
export function applyMove(state: GameState, move: Move): GameState {
  const legality = isLegal(state, move);
  if (!legality.ok) throw new Error(legality.reason ?? 'Illegal move.');

  const next = cloneState(state);
  switch (move.type) {
    case 'takeThree':
      takeThree(next, move.colors);
      break;
    case 'takeTwo':
      takeTwo(next, move.color);
      break;
    case 'reserveVisible':
      reserveVisible(next, move.cardId);
      break;
    case 'reserveDeck':
      reserveDeck(next, move.tier);
      break;
    case 'purchase':
      purchase(next, move.cardId, move.from);
      break;
  }
  return checkEndOfTurn(next);
}
