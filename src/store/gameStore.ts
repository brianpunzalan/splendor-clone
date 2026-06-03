import { create } from 'zustand';
import type { GameState, Move, TokenColor } from '../game/types';
import { createGame, type SeatConfig } from '../game/setup';
import { applyMove } from '../game/rules/actions';
import { resolveNoble, resolveReturnTokens } from '../game/rules/endTurn';
import { clearSave, loadGame, saveGame } from './persistence';

type Screen = 'menu' | 'game';

interface GameStore {
  screen: Screen;
  state: GameState | null;
  /** Last error surfaced from an illegal action (for transient UI feedback). */
  error: string | null;

  newGame: (seats: SeatConfig[]) => void;
  continueGame: () => void;
  quitToMenu: () => void;

  play: (move: Move) => void;
  returnTokens: (returned: Partial<Record<TokenColor, number>>) => void;
  chooseNoble: (nobleId: string) => void;
  clearError: () => void;
}

function commit(set: (partial: Partial<GameStore>) => void, next: GameState) {
  saveGame(next);
  set({ state: next, error: null });
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'menu',
  state: null,
  error: null,

  newGame: (seats) => {
    const state = createGame(seats);
    saveGame(state);
    set({ state, screen: 'game', error: null });
  },

  continueGame: () => {
    const state = loadGame();
    if (state) set({ state, screen: 'game', error: null });
  },

  quitToMenu: () => set({ screen: 'menu' }),

  play: (move) => {
    const { state } = get();
    if (!state) return;
    try {
      commit(set, applyMove(state, move));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Illegal move.' });
    }
  },

  returnTokens: (returned) => {
    const { state } = get();
    if (!state) return;
    try {
      commit(set, resolveReturnTokens(state, returned));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Invalid token return.' });
    }
  },

  chooseNoble: (nobleId) => {
    const { state } = get();
    if (!state) return;
    try {
      commit(set, resolveNoble(state, nobleId));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Invalid noble choice.' });
    }
  },

  clearError: () => set({ error: null }),
}));

/** Start fresh, also wiping any saved game. */
export function discardSaveAndReset() {
  clearSave();
  useGameStore.setState({ state: null, screen: 'menu' });
}
