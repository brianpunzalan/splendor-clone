import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { chooseMove, chooseTokensToReturn } from '../game/ai/heuristic';

/** Delay (ms) between AI sub-actions so turns are watchable. */
const AI_DELAY = 750;

/**
 * Drives AI players: whenever it becomes an AI's turn (or an AI must resolve a
 * pending decision), schedules the appropriate engine action after a short
 * delay. Human turns are left untouched.
 */
export function useAiDriver() {
  const state = useGameStore((s) => s.state);
  const play = useGameStore((s) => s.play);
  const returnTokens = useGameStore((s) => s.returnTokens);
  const chooseNoble = useGameStore((s) => s.chooseNoble);

  useEffect(() => {
    if (!state || state.phase !== 'playing') return;
    const player = state.players[state.current];
    if (player.type !== 'ai') return;

    const timer = setTimeout(() => {
      if (state.pending?.type === 'returnTokens') {
        returnTokens(chooseTokensToReturn(state, state.pending.count));
        return;
      }
      if (state.pending?.type === 'chooseNoble') {
        chooseNoble(state.pending.nobleIds[0]);
        return;
      }
      const move = chooseMove(state);
      if (move) play(move);
    }, AI_DELAY);

    return () => clearTimeout(timer);
  }, [state, play, returnTokens, chooseNoble]);
}
