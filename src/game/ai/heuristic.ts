import type { Card, GameState, GemColor, Move, Player } from '../types';
import { GEM_COLORS, MAX_TOKENS } from '../data/constants';
import { bonuses, totalTokens } from '../util';
import { costAfterBonus } from '../rules/cost';
import { qualifiesFor } from '../rules/nobles';
import { activePlayer, enumerateMoves, findVisible } from '../rules/legalMoves';

// Heuristic weights (tunable). The AI scores every legal move and plays the
// highest-scoring one, with a small random tie-break.
const W = {
  purchaseBase: 40,
  pointPerPrestige: 100,
  nobleComplete: 260,
  nobleProgress: 18,
  takeBase: 8,
  neededGem: 6,
  spareGem: 0.5,
  overflowPenalty: 9,
  reserveBase: 12,
  reservePoint: 6,
  reserveGold: 6,
};

/** How much each gem color is "wanted" given a target card the AI is chasing. */
function deficitFor(player: Player, card: Card): Record<GemColor, number> {
  const remaining = costAfterBonus(player, card);
  const out = {} as Record<GemColor, number>;
  for (const c of GEM_COLORS) out[c] = Math.max(0, remaining[c] - player.tokens[c]);
  return out;
}

/** Rough desirability of a card as a purchase goal. */
function cardValue(player: Player, card: Card): number {
  const remaining = costAfterBonus(player, card);
  let totalRemaining = 0;
  for (const c of GEM_COLORS) totalRemaining += remaining[c];
  return card.points * 3 - totalRemaining * 0.3;
}

/** Pick the best card the AI should work toward (board + reserved). */
function chooseTarget(state: GameState, player: Player): Card | null {
  const candidates: Card[] = [];
  for (const tier of [1, 2, 3] as const) {
    for (const c of state.visible[tier]) if (c) candidates.push(c);
  }
  candidates.push(...player.reserved);
  if (candidates.length === 0) return null;
  let best = candidates[0];
  let bestVal = cardValue(player, best);
  for (const c of candidates) {
    const v = cardValue(player, c);
    if (v > bestVal) {
      best = c;
      bestVal = v;
    }
  }
  return best;
}

function nobleScoreAfter(state: GameState, player: Player, card: Card): number {
  // Simulate owning the card's bonus and reward noble progress / completion.
  const fakePlayer: Player = { ...player, cards: [...player.cards, card] };
  const bonusNow = bonuses(player);
  let score = 0;
  for (const noble of state.nobles) {
    if (qualifiesFor(fakePlayer, noble) && !qualifiesFor(player, noble)) {
      score += W.nobleComplete;
    } else if (noble.requirement[card.color] > bonusNow[card.color]) {
      score += W.nobleProgress;
    }
  }
  return score;
}

function scoreMove(state: GameState, player: Player, move: Move, target: Card | null): number {
  switch (move.type) {
    case 'purchase': {
      const card =
        move.from === 'board'
          ? findVisible(state, move.cardId)!.card
          : player.reserved.find((c) => c.id === move.cardId)!;
      return (
        W.purchaseBase + card.points * W.pointPerPrestige + nobleScoreAfter(state, player, card)
      );
    }
    case 'takeThree':
    case 'takeTwo': {
      const taken = {} as Record<GemColor, number>;
      for (const c of GEM_COLORS) taken[c] = 0;
      if (move.type === 'takeThree') for (const c of move.colors) taken[c] += 1;
      else taken[move.color] = 2;

      const deficit = target ? deficitFor(player, target) : ({} as Record<GemColor, number>);
      let score = W.takeBase;
      let gained = 0;
      for (const c of GEM_COLORS) {
        gained += taken[c];
        const useful = Math.min(taken[c], deficit[c] ?? 0);
        score += useful * W.neededGem + (taken[c] - useful) * W.spareGem;
      }
      // Penalize taking tokens we would have to discard at end of turn.
      const overflow = Math.max(0, totalTokens(player.tokens) + gained - MAX_TOKENS);
      score -= overflow * W.overflowPenalty;
      return score;
    }
    case 'reserveVisible':
    case 'reserveDeck': {
      let card: Card | null = null;
      if (move.type === 'reserveVisible') card = findVisible(state, move.cardId)?.card ?? null;
      const gold = state.bank.gold > 0 ? W.reserveGold : 0;
      const overflow = Math.max(0, totalTokens(player.tokens) + (gold ? 1 : 0) - MAX_TOKENS);
      return (
        W.reserveBase + (card?.points ?? 2) * W.reservePoint + gold - overflow * W.overflowPenalty
      );
    }
  }
}

/**
 * Choose a move for the active (AI) player. Returns null only if no legal move
 * exists (an extremely rare deadlock). `rng` allows deterministic tie-breaking.
 */
export function chooseMove(state: GameState, rng: () => number = Math.random): Move | null {
  const player = activePlayer(state);
  const moves = enumerateMoves(state);
  if (moves.length === 0) return null;

  const target = chooseTarget(state, player);
  let best = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    const s = scoreMove(state, player, move, target) + rng() * 0.5;
    if (s > bestScore) {
      bestScore = s;
      best = move;
    }
  }
  return best;
}

/** Resolve a token-return decision for the AI (discard least-useful tokens). */
export function chooseTokensToReturn(state: GameState, count: number): Partial<Record<GemColor | 'gold', number>> {
  const player = activePlayer(state);
  const target = chooseTarget(state, player);
  const deficit = target ? deficitFor(player, target) : null;

  // Rank colors by least useful first; never discard gold unless forced.
  const order: (GemColor | 'gold')[] = [...GEM_COLORS]
    .sort((a, b) => (deficit ? deficit[a] - deficit[b] : 0))
    .concat('gold');

  const returned: Partial<Record<GemColor | 'gold', number>> = {};
  let remaining = count;
  for (const color of order) {
    if (remaining <= 0) break;
    const avail = player.tokens[color];
    const take = Math.min(avail, remaining);
    if (take > 0) {
      returned[color] = take;
      remaining -= take;
    }
  }
  return returned;
}
