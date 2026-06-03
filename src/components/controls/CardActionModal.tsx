import type { Card, Player } from '../../game/types';
import { GEM_COLORS, GEM_LABELS, MAX_RESERVED } from '../../game/data/constants';
import { computePayment, costAfterBonus } from '../../game/rules/cost';
import { GemIcon } from '../common/icons';

interface Props {
  card: Card;
  from: 'board' | 'reserved';
  player: Player;
  onPurchase: () => void;
  onReserve?: () => void;
  onClose: () => void;
}

export function CardActionModal({ card, from, player, onPurchase, onReserve, onClose }: Props) {
  const payment = computePayment(player, card);
  const remaining = costAfterBonus(player, card);
  const canReserve = from === 'board' && player.reserved.length < MAX_RESERVED;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          Tier {card.tier} · {GEM_LABELS[card.color]} card
          {card.points > 0 ? ` · ${card.points} prestige` : ''}
        </h2>

        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Cost (after your bonuses):</p>
        <div className="row">
          {GEM_COLORS.filter((c) => card.cost[c] > 0).map((c) => (
            <span key={c} className={`cost-pip${remaining[c] === 0 ? ' met' : ''}`}>
              <GemIcon color={c} size={16} />
              {remaining[c]} / {card.cost[c]}
            </span>
          ))}
        </div>

        {payment ? (
          <p style={{ color: 'var(--ok)' }}>
            You can afford this{payment.goldUsed > 0 ? ` (using ${payment.goldUsed} gold joker)` : ''}.
          </p>
        ) : (
          <p style={{ color: 'var(--danger)' }}>You cannot afford this card yet.</p>
        )}

        <div className="actions">
          <button className="ghost" onClick={onClose}>
            Cancel
          </button>
          {canReserve && onReserve && (
            <button onClick={onReserve}>Reserve (+gold)</button>
          )}
          <button className="primary" disabled={!payment} onClick={onPurchase}>
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
