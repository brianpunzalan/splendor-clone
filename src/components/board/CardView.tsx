import type { Card, GemColor } from '../../game/types';
import { GEM_COLORS } from '../../game/data/constants';
import { GemIcon, StarIcon } from '../common/icons';

interface Props {
  card: Card | null;
  onClick?: () => void;
  affordable?: boolean;
  /** Remaining cost after the viewing player's bonuses (to dim met pips). */
  remaining?: Record<GemColor, number>;
  size?: 'normal' | 'mini';
}

export function CardView({ card, onClick, affordable, remaining, size = 'normal' }: Props) {
  if (!card) return <div className="card empty" aria-hidden />;

  const clickable = !!onClick;
  return (
    <div
      className={`card${clickable ? ' clickable' : ''}${affordable ? ' affordable' : ''}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      title={clickable ? 'Click for actions' : undefined}
    >
      <div className="card-head">
        <span className="card-points">{card.points > 0 ? card.points : ''}</span>
        <GemIcon color={card.color} size={size === 'mini' ? 18 : 24} />
      </div>
      <div className="card-art">
        <GemIcon color={card.color} />
      </div>
      <div className="card-cost">
        {GEM_COLORS.filter((c) => card.cost[c] > 0).map((c) => {
          const met = remaining ? remaining[c] === 0 : false;
          return (
            <span key={c} className={`cost-pip${met ? ' met' : ''}`}>
              <GemIcon color={c} size={13} />
              {card.cost[c]}
            </span>
          );
        })}
      </div>
      {card.points > 0 && size === 'normal' && (
        <StarIcon
          size={14}
          style={{ position: 'absolute', top: 8, left: 26, color: 'var(--accent)' }}
        />
      )}
    </div>
  );
}
