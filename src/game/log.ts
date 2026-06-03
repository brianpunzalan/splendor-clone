import type { GameState } from './types';

/** Append a log entry attributed to a specific player (mutates `state`). */
export function pushLog(state: GameState, playerId: string, text: string): void {
  state.logSeq += 1;
  state.log.push({ id: state.logSeq, turn: state.turn, playerId, text });
}
