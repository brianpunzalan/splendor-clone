import { describe, it, expect } from 'vitest';
import { createGame, type SeatConfig } from '../src/game/setup';
import { applyMove } from '../src/game/rules/actions';
import { resolveReturnTokens, resolveNoble } from '../src/game/rules/endTurn';
import { isLegal, enumerateMoves } from '../src/game/rules/legalMoves';
import { chooseMove, chooseTokensToReturn } from '../src/game/ai/heuristic';
import { mulberry32, score } from '../src/game/util';
import type { GameState } from '../src/game/types';

const aiSeats = (n: number): SeatConfig[] =>
  Array.from({ length: n }, (_, i) => ({ name: `Bot${i + 1}`, type: 'ai' as const }));

describe('legalMoves', () => {
  it('every enumerated move is legal', () => {
    const g = createGame(aiSeats(3), mulberry32(7));
    for (const move of enumerateMoves(g)) {
      expect(isLegal(g, move).ok).toBe(true);
    }
  });
});

describe('AI', () => {
  it('always returns a legal move on a fresh game', () => {
    const g = createGame(aiSeats(2), mulberry32(3));
    const move = chooseMove(g, mulberry32(3))!;
    expect(move).toBeTruthy();
    expect(isLegal(g, move).ok).toBe(true);
  });

  it('plays a full AI-vs-AI game to completion without throwing', () => {
    let state: GameState = createGame(aiSeats(4), mulberry32(123));
    const rng = mulberry32(999);
    let guard = 0;
    while (state.phase === 'playing' && guard < 5000) {
      guard += 1;
      if (state.pending?.type === 'returnTokens') {
        state = resolveReturnTokens(state, chooseTokensToReturn(state, state.pending.count));
        continue;
      }
      if (state.pending?.type === 'chooseNoble') {
        state = resolveNoble(state, state.pending.nobleIds[0]);
        continue;
      }
      const move = chooseMove(state, rng);
      expect(move).not.toBeNull();
      state = applyMove(state, move!);
    }
    expect(state.phase).toBe('gameOver');
    expect(state.winnerId).toBeTruthy();
    const winner = state.players.find((p) => p.id === state.winnerId)!;
    expect(score(winner)).toBeGreaterThanOrEqual(15);
    expect(guard).toBeLessThan(5000); // sanity: it actually terminated
  });
});
