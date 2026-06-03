import type { GameState } from '../game/types';

const KEY = 'splendor:v1:save';

interface SaveEnvelope {
  version: 1;
  state: GameState;
}

/** Persist the current game (plain data, JSON-serializable). */
export function saveGame(state: GameState): void {
  try {
    const env: SaveEnvelope = { version: 1, state };
    localStorage.setItem(KEY, JSON.stringify(env));
  } catch {
    // Storage may be unavailable (private mode / quota); ignore.
  }
}

/** Load a saved game, or null if none / incompatible. */
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const env = JSON.parse(raw) as SaveEnvelope;
    if (env.version !== 1 || !env.state) return null;
    return env.state;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function hasSave(): boolean {
  return loadGame() !== null;
}
