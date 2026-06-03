import { describe, it, expect } from 'vitest';
import { createGame, type SeatConfig } from '../src/game/setup';
import { ALL_CARDS } from '../src/game/data/cards';
import { mulberry32 } from '../src/game/util';

const seats = (n: number): SeatConfig[] =>
  Array.from({ length: n }, (_, i) => ({ name: `P${i + 1}`, type: 'human' as const }));

describe('card data integrity', () => {
  it('has 90 cards split 40/30/20 by tier', () => {
    expect(ALL_CARDS).toHaveLength(90);
    expect(ALL_CARDS.filter((c) => c.tier === 1)).toHaveLength(40);
    expect(ALL_CARDS.filter((c) => c.tier === 2)).toHaveLength(30);
    expect(ALL_CARDS.filter((c) => c.tier === 3)).toHaveLength(20);
  });

  it('has unique card ids', () => {
    expect(new Set(ALL_CARDS.map((c) => c.id)).size).toBe(90);
  });
});

describe('createGame', () => {
  it('sets gem bank counts per player count', () => {
    expect(createGame(seats(2)).bank.white).toBe(4);
    expect(createGame(seats(3)).bank.white).toBe(5);
    expect(createGame(seats(4)).bank.white).toBe(7);
  });

  it('always sets 5 gold tokens', () => {
    for (const n of [2, 3, 4]) expect(createGame(seats(n)).bank.gold).toBe(5);
  });

  it('reveals 4 cards per tier and players+1 nobles', () => {
    const g = createGame(seats(3), mulberry32(1));
    expect(g.visible[1].filter(Boolean)).toHaveLength(4);
    expect(g.visible[2].filter(Boolean)).toHaveLength(4);
    expect(g.visible[3].filter(Boolean)).toHaveLength(4);
    expect(g.nobles).toHaveLength(4);
  });

  it('leaves the correct number of cards in each deck', () => {
    const g = createGame(seats(2));
    expect(g.decks[1]).toHaveLength(36); // 40 - 4
    expect(g.decks[2]).toHaveLength(26); // 30 - 4
    expect(g.decks[3]).toHaveLength(16); // 20 - 4
  });

  it('is reproducible with a seeded rng', () => {
    const a = createGame(seats(4), mulberry32(42));
    const b = createGame(seats(4), mulberry32(42));
    expect(a.visible[1].map((c) => c?.id)).toEqual(b.visible[1].map((c) => c?.id));
    expect(a.nobles.map((n) => n.id)).toEqual(b.nobles.map((n) => n.id));
  });
});
