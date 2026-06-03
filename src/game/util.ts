import type { Cost, GemColor, Player, Tokens } from './types';
import { GEM_COLORS } from './data/constants';

/** A fresh, zeroed token pool (gold included). */
export function emptyTokens(): Tokens {
  return { white: 0, blue: 0, green: 0, red: 0, black: 0, gold: 0 };
}

/** A fresh, zeroed gem cost (no gold). */
export function emptyCost(): Cost {
  return { white: 0, blue: 0, green: 0, red: 0, black: 0 };
}

/** Total number of tokens (gold included) held in a pool. */
export function totalTokens(t: Tokens): number {
  return t.white + t.blue + t.green + t.red + t.black + t.gold;
}

/**
 * Deterministic Fisher–Yates shuffle. Returns a new array. Accepts an optional
 * random source so games can be seeded/reproduced in tests.
 */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A small seedable PRNG (mulberry32) for reproducible shuffles/AI tie-breaks. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Count of permanent gem bonuses (purchased cards) per color for a player. */
export function bonuses(player: Player): Cost {
  const out = emptyCost();
  for (const card of player.cards) out[card.color] += 1;
  return out;
}

/** Total prestige points: card points + 3 per noble. */
export function score(player: Player): number {
  let pts = player.nobles.length * 3;
  for (const card of player.cards) pts += card.points;
  return pts;
}

/** Iterate the five gem colors. */
export function eachGem<T>(fn: (c: GemColor) => T): T[] {
  return GEM_COLORS.map(fn);
}
