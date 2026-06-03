import type { GameState, TokenColor } from '../types';
import { MAX_TOKENS, WINNING_SCORE } from '../data/constants';
import { score, totalTokens } from '../util';
import { eligibleNobles } from './nobles';
import { pushLog } from '../log';
import { NOBLE_NAMES } from '../data/nobles';

/**
 * Run end-of-turn processing after an action has been applied:
 *   1. If the active player holds too many tokens, pause for a return decision.
 *   2. Otherwise resolve noble visits, then advance the turn / check victory.
 */
export function checkEndOfTurn(state: GameState): GameState {
  const player = state.players[state.current];
  const over = totalTokens(player.tokens) - MAX_TOKENS;
  if (over > 0) {
    state.pending = { type: 'returnTokens', count: over };
    return state;
  }
  return processNobles(state);
}

/** Resolve a pending token-return decision, then continue end-of-turn flow. */
export function resolveReturnTokens(
  state: GameState,
  returned: Partial<Record<TokenColor, number>>,
): GameState {
  const player = state.players[state.current];
  let returnedTotal = 0;
  for (const color of Object.keys(returned) as TokenColor[]) {
    const n = returned[color] ?? 0;
    if (n < 0 || n > player.tokens[color]) throw new Error('Invalid token return.');
    player.tokens[color] -= n;
    state.bank[color] += n;
    returnedTotal += n;
  }
  if (totalTokens(player.tokens) > MAX_TOKENS) {
    throw new Error('Must return down to the token limit.');
  }
  if (returnedTotal > 0) {
    pushLog(state, player.id, `returned ${returnedTotal} token(s) over the limit.`);
  }
  state.pending = null;
  return processNobles(state);
}

/** Award an eligible noble automatically, or pause to let the player choose. */
function processNobles(state: GameState): GameState {
  const player = state.players[state.current];
  const eligible = eligibleNobles(player, state.nobles);
  if (eligible.length === 1) {
    awardNoble(state, eligible[0].id);
    return advanceTurn(state);
  }
  if (eligible.length > 1) {
    state.pending = { type: 'chooseNoble', nobleIds: eligible.map((n) => n.id) };
    return state;
  }
  return advanceTurn(state);
}

/** Resolve a pending noble choice, then advance the turn. */
export function resolveNoble(state: GameState, nobleId: string): GameState {
  if (state.pending?.type !== 'chooseNoble' || !state.pending.nobleIds.includes(nobleId)) {
    throw new Error('That noble cannot be chosen.');
  }
  awardNoble(state, nobleId);
  state.pending = null;
  return advanceTurn(state);
}

function awardNoble(state: GameState, nobleId: string): void {
  const idx = state.nobles.findIndex((n) => n.id === nobleId);
  if (idx < 0) return;
  const [noble] = state.nobles.splice(idx, 1);
  const player = state.players[state.current];
  player.nobles.push(noble);
  pushLog(state, player.id, `is visited by ${NOBLE_NAMES[noble.id] ?? 'a noble'} (+3).`);
}

/**
 * Advance to the next seat. If a player has reached the winning score, the
 * current round is finished (every player gets the same number of turns) and
 * then the winner is decided.
 */
function advanceTurn(state: GameState): GameState {
  const player = state.players[state.current];

  // Trigger the final round the first time anyone reaches the winning score.
  if (!state.finalRound && score(player) >= WINNING_SCORE) {
    state.finalRound = true;
    // Final round ends once play returns to the seat just before the current
    // one (i.e., everyone including earlier seats has had an equal # of turns).
    state.triggerIndex = (state.current - 1 + state.players.length) % state.players.length;
  }

  // End the game if the final round just completed.
  if (state.finalRound && state.current === state.triggerIndex) {
    return endGame(state);
  }

  state.current = (state.current + 1) % state.players.length;
  if (state.current === 0) state.turn += 1;
  return state;
}

function endGame(state: GameState): GameState {
  state.phase = 'gameOver';
  // Winner: highest score, tiebreak fewest development cards.
  let best = state.players[0];
  for (const p of state.players) {
    const ps = score(p);
    const bs = score(best);
    if (ps > bs || (ps === bs && p.cards.length < best.cards.length)) best = p;
  }
  state.winnerId = best.id;
  pushLog(state, best.id, `wins with ${score(best)} prestige!`);
  return state;
}
