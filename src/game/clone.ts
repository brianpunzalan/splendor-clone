import type { GameState, Player, Tier } from './types';

// Card and Noble objects are treated as immutable, so they are shared by
// reference. Only the mutable containers (player pools, decks, market, bank,
// log) are copied, keeping clones cheap while preserving purity.

function clonePlayer(p: Player): Player {
  return {
    ...p,
    tokens: { ...p.tokens },
    cards: p.cards.slice(),
    reserved: p.reserved.slice(),
    nobles: p.nobles.slice(),
  };
}

export function cloneState(s: GameState): GameState {
  const decks = {} as GameState['decks'];
  const visible = {} as GameState['visible'];
  for (const tier of [1, 2, 3] as Tier[]) {
    decks[tier] = s.decks[tier].slice();
    visible[tier] = s.visible[tier].slice();
  }
  return {
    ...s,
    players: s.players.map(clonePlayer),
    bank: { ...s.bank },
    decks,
    visible,
    nobles: s.nobles.slice(),
    log: s.log.slice(),
    pending: s.pending ? { ...s.pending } : null,
  };
}
