import { describe, it, expect } from 'vitest';
import { createGame, type SeatConfig } from '../src/game/setup';
import { applyMove } from '../src/game/rules/actions';
import { isLegal } from '../src/game/rules/legalMoves';
import { resolveReturnTokens, resolveNoble } from '../src/game/rules/endTurn';
import { computePayment } from '../src/game/rules/cost';
import { totalTokens, emptyTokens, score } from '../src/game/util';
import { ALL_CARDS } from '../src/game/data/cards';
import { ALL_NOBLES } from '../src/game/data/nobles';
import type { Card, GameState } from '../src/game/types';

const seats = (n: number): SeatConfig[] =>
  Array.from({ length: n }, (_, i) => ({ name: `P${i + 1}`, type: 'human' as const }));

function card(id: string): Card {
  const c = ALL_CARDS.find((x) => x.id === id);
  if (!c) throw new Error('no card ' + id);
  return c;
}

describe('takeThree / takeTwo', () => {
  it('takes 3 different gems', () => {
    const g = createGame(seats(2));
    const next = applyMove(g, { type: 'takeThree', colors: ['white', 'blue', 'green'] });
    const p = next.players[0];
    expect(p.tokens.white).toBe(1);
    expect(p.tokens.blue).toBe(1);
    expect(p.tokens.green).toBe(1);
    expect(next.bank.white).toBe(3);
    expect(next.current).toBe(1); // turn advanced
  });

  it('rejects duplicate colors in takeThree', () => {
    const g = createGame(seats(2));
    expect(isLegal(g, { type: 'takeThree', colors: ['red', 'red', 'blue'] }).ok).toBe(false);
  });

  it('allows takeTwo only when >= 4 in bank', () => {
    const g = createGame(seats(2)); // 4 of each
    expect(isLegal(g, { type: 'takeTwo', color: 'red' }).ok).toBe(true);
    const after = applyMove(g, { type: 'takeTwo', color: 'red' });
    expect(after.players[0].tokens.red).toBe(2);
    expect(after.bank.red).toBe(2);
    // now only 2 left -> illegal next time
    after.current = 0;
    expect(isLegal(after, { type: 'takeTwo', color: 'red' }).ok).toBe(false);
  });
});

describe('reserve', () => {
  it('reserves a visible card, refills the slot, and grants gold', () => {
    const g = createGame(seats(2));
    const target = g.visible[1][0]!;
    const next = applyMove(g, { type: 'reserveVisible', cardId: target.id });
    const p = next.players[0];
    expect(p.reserved).toHaveLength(1);
    expect(p.reserved[0].id).toBe(target.id);
    expect(p.tokens.gold).toBe(1);
    expect(next.bank.gold).toBe(4);
    expect(next.visible[1][0]).not.toBeNull();
    expect(next.visible[1][0]!.id).not.toBe(target.id);
  });

  it('blind-reserves from a deck', () => {
    const g = createGame(seats(2));
    const topId = g.decks[3][0].id;
    const next = applyMove(g, { type: 'reserveDeck', tier: 3 });
    expect(next.players[0].reserved[0].id).toBe(topId);
    expect(next.decks[3]).toHaveLength(15);
  });

  it('rejects reserving a 4th card', () => {
    const g = createGame(seats(2));
    g.players[0].reserved = [card('c1-00'), card('c1-01'), card('c1-02')];
    expect(isLegal(g, { type: 'reserveVisible', cardId: g.visible[1][0]!.id }).ok).toBe(false);
  });
});

describe('purchase', () => {
  it('applies bonuses and returns spent tokens to the bank', () => {
    const g = createGame(seats(2));
    const p = g.players[0];
    // Card c1-00 (black) costs blue1 green1 red1 white1.
    const target = card('c1-00');
    g.visible[1][0] = target;
    // Give the player a green bonus card + the gems for the rest.
    p.cards = [card('c1-24')]; // a green-bonus card
    p.tokens = { ...emptyTokens(), blue: 1, red: 1, white: 1 };
    const bankBlueBefore = g.bank.blue;

    const payment = computePayment(p, target)!;
    expect(payment.spend.green).toBe(0); // covered by bonus
    expect(payment.goldUsed).toBe(0);

    const next = applyMove(g, { type: 'purchase', cardId: target.id, from: 'board' });
    const np = next.players[0];
    expect(np.cards.some((c) => c.id === target.id)).toBe(true);
    expect(np.tokens.blue).toBe(0);
    expect(next.bank.blue).toBe(bankBlueBefore + 1);
  });

  it('uses gold to cover a shortfall', () => {
    const g = createGame(seats(2));
    const p = g.players[0];
    const target = card('c1-00'); // needs blue1 green1 red1 white1
    g.visible[1][0] = target;
    p.tokens = { ...emptyTokens(), blue: 1, green: 1, red: 1, gold: 1 }; // missing white -> gold
    const payment = computePayment(p, target)!;
    expect(payment.goldUsed).toBe(1);
    const next = applyMove(g, { type: 'purchase', cardId: target.id, from: 'board' });
    expect(next.players[0].tokens.gold).toBe(0);
    expect(next.bank.gold).toBe(g.bank.gold + 1);
  });

  it('rejects purchases the player cannot afford', () => {
    const g = createGame(seats(2));
    const target = ALL_CARDS.find((c) => c.tier === 3)!; // expensive, player has no tokens
    g.visible[3][0] = target;
    expect(isLegal(g, { type: 'purchase', cardId: target.id, from: 'board' }).ok).toBe(false);
  });
});

describe('hand limit', () => {
  it('pauses to return tokens when over 10', () => {
    const g = createGame(seats(2));
    const p = g.players[0];
    p.tokens = { white: 3, blue: 3, green: 3, red: 0, black: 0, gold: 0 }; // 9
    g.bank.red = 4;
    const next = applyMove(g, { type: 'takeTwo', color: 'red' }); // -> 11
    expect(next.pending).toEqual({ type: 'returnTokens', count: 1 });
    expect(next.current).toBe(0); // not advanced yet

    const resolved = resolveReturnTokens(next, { white: 1 });
    expect(totalTokens(resolved.players[0].tokens)).toBe(10);
    expect(resolved.pending).toBeNull();
    expect(resolved.current).toBe(1);
  });
});

describe('nobles', () => {
  function nearNobleState(): { state: GameState; nobleId: string } {
    const g = createGame(seats(2));
    // Use a 2-color noble (4/4) for a controlled test.
    const noble = ALL_NOBLES.find(
      (n) => n.requirement.red === 4 && n.requirement.black === 4,
    )!;
    g.nobles = [noble];
    const p = g.players[0];
    // 4 red bonuses + 3 black bonuses already owned.
    const reds = ALL_CARDS.filter((c) => c.color === 'red').slice(0, 4);
    const blacks = ALL_CARDS.filter((c) => c.color === 'black').slice(0, 3);
    p.cards = [...reds, ...blacks];
    return { state: g, nobleId: noble.id };
  }

  it('auto-awards a noble when newly eligible', () => {
    const { state, nobleId } = nearNobleState();
    // Buy a 4th black (free): place an affordable black card and give tokens.
    const black4 = ALL_CARDS.filter((c) => c.color === 'black')[7]; // c1-07 costs blue4
    state.visible[1][0] = black4;
    state.players[0].tokens = { ...emptyTokens(), blue: 4 };
    const next = applyMove(state, { type: 'purchase', cardId: black4.id, from: 'board' });
    expect(next.players[0].nobles.map((n) => n.id)).toContain(nobleId);
    expect(score(next.players[0])).toBeGreaterThanOrEqual(3);
  });

  it('offers a choice when multiple nobles are eligible', () => {
    const g = createGame(seats(2));
    const p = g.players[0];
    const n1 = ALL_NOBLES.find((n) => n.requirement.red === 4 && n.requirement.black === 4)!;
    const n2 = ALL_NOBLES.find((n) => n.requirement.green === 4 && n.requirement.red === 4)!;
    g.nobles = [n1, n2];
    // Own enough to qualify for both after buying one more red.
    p.cards = [
      ...ALL_CARDS.filter((c) => c.color === 'red').slice(0, 3),
      ...ALL_CARDS.filter((c) => c.color === 'black').slice(0, 4),
      ...ALL_CARDS.filter((c) => c.color === 'green').slice(0, 4),
    ];
    const red4 = ALL_CARDS.filter((c) => c.color === 'red')[7]; // costs white4
    g.visible[1][0] = red4;
    p.tokens = { ...emptyTokens(), white: 4 };
    const next = applyMove(g, { type: 'purchase', cardId: red4.id, from: 'board' });
    expect(next.pending?.type).toBe('chooseNoble');
    const chosen = (next.pending as { nobleIds: string[] }).nobleIds[0];
    const done = resolveNoble(next, chosen);
    expect(done.players[0].nobles.map((n) => n.id)).toContain(chosen);
    expect(done.pending).toBeNull();
    expect(done.current).toBe(1);
  });
});

describe('victory', () => {
  it('finishes the round then declares the highest score the winner', () => {
    const g = createGame(seats(2));
    g.nobles = []; // isolate the victory logic from noble visits
    const p0 = g.players[0];
    // Give p0 exactly 14 points, then a 1-point card to buy for the win.
    p0.cards = [
      ...ALL_CARDS.filter((c) => c.points === 5).slice(0, 2), // 10
      ...ALL_CARDS.filter((c) => c.points === 4).slice(0, 1), // +4 = 14
    ];
    const winCard = ALL_CARDS.filter((c) => c.points === 1 && c.color === 'white')[0];
    g.visible[1][0] = winCard;
    // Give exactly enough to buy winCard so the turn ends without a discard.
    p0.tokens = { ...emptyTokens() };
    for (const c of ['white', 'blue', 'green', 'red', 'black'] as const) {
      p0.tokens[c] = winCard.cost[c];
    }

    const afterP0 = applyMove(g, { type: 'purchase', cardId: winCard.id, from: 'board' });
    expect(afterP0.finalRound).toBe(true);
    expect(afterP0.phase).toBe('playing'); // p1 still gets a turn
    expect(afterP0.current).toBe(1);

    const afterP1 = applyMove(afterP0, { type: 'takeThree', colors: ['white', 'blue', 'green'] });
    expect(afterP1.phase).toBe('gameOver');
    expect(afterP1.winnerId).toBe('p0');
  });
});
