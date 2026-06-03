import type { Noble, Player } from '../types';
import { GEM_COLORS } from '../data/constants';
import { bonuses } from '../util';

/** Whether a player's bonuses satisfy a noble's requirement. */
export function qualifiesFor(player: Player, noble: Noble): boolean {
  const bonus = bonuses(player);
  return GEM_COLORS.every((c) => bonus[c] >= noble.requirement[c]);
}

/** All board nobles a player currently qualifies for. */
export function eligibleNobles(player: Player, available: Noble[]): Noble[] {
  return available.filter((n) => qualifiesFor(player, n));
}
