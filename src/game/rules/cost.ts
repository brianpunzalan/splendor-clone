import type { Card, GemColor, Player, Tokens } from '../types';
import { GEM_COLORS } from '../data/constants';
import { bonuses, emptyTokens } from '../util';

/**
 * How a card purchase will actually be paid: the gem tokens spent per color and
 * the number of gold (joker) tokens used to cover any shortfall.
 */
export interface Payment {
  /** Tokens that leave the player's pool and return to the bank. */
  spend: Tokens;
  /** Total gold tokens used (already included in `spend.gold`). */
  goldUsed: number;
}

/**
 * Compute the payment for a player buying `card`, applying their bonuses first
 * and using gold to cover any remaining shortfall. Returns null if the player
 * cannot afford the card (even with all their gold).
 *
 * The default strategy spends real gems before gold for each color, which is the
 * canonical "cheapest" allocation a player would choose.
 */
export function computePayment(player: Player, card: Card): Payment | null {
  const bonus = bonuses(player);
  const spend = emptyTokens();
  let goldNeeded = 0;

  for (const color of GEM_COLORS) {
    const required = Math.max(0, card.cost[color] - bonus[color]);
    const haveGem = player.tokens[color];
    const fromGem = Math.min(required, haveGem);
    spend[color] = fromGem;
    goldNeeded += required - fromGem;
  }

  if (goldNeeded > player.tokens.gold) return null;
  spend.gold = goldNeeded;
  return { spend, goldUsed: goldNeeded };
}

/** Whether the player can afford the card (with bonuses + gold). */
export function canAfford(player: Player, card: Card): boolean {
  return computePayment(player, card) !== null;
}

/** Remaining cost per color after applying a player's bonuses (for display). */
export function costAfterBonus(player: Player, card: Card): Record<GemColor, number> {
  const bonus = bonuses(player);
  const out = {} as Record<GemColor, number>;
  for (const color of GEM_COLORS) {
    out[color] = Math.max(0, card.cost[color] - bonus[color]);
  }
  return out;
}
