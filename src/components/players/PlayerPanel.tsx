import type { Card, Player } from '../../game/types';
import { GEM_COLORS } from '../../game/data/constants';
import { bonuses as calcBonuses, score as calcScore } from '../../game/util';
import { GemIcon, StarIcon, CrownIcon } from '../common/icons';
import { CardView } from '../board/CardView';

interface Props {
  player: Player;
  active: boolean;
  /** When set, reserved cards are clickable (the owner's own turn). */
  onReservedClick?: (card: Card) => void;
}

export function PlayerPanel({ player, active, onReservedClick }: Props) {
  const bonus = calcBonuses(player);
  const pts = calcScore(player);

  return (
    <div className={`player${active ? ' active' : ''}`}>
      <div className="player-head">
        <span className="player-name">{player.name}</span>
        <span className={`badge${player.type === 'ai' ? ' ai' : ''}`}>{player.type}</span>
        <span className="player-score">
          <StarIcon size={18} />
          {pts}
        </span>
      </div>

      <div className="resource-grid">
        {GEM_COLORS.map((c) => (
          <div className="res" key={c}>
            <GemIcon color={c} size={18} />
            <span className="nums">
              {player.tokens[c]}
              {bonus[c] > 0 && <span className="bonus"> +{bonus[c]}</span>}
            </span>
          </div>
        ))}
        <div className="res">
          <GemIcon color="gold" size={18} />
          <span className="nums">{player.tokens.gold}</span>
        </div>
      </div>

      <div className="reserved-row">
        {player.reserved.length === 0 && <span className="mini-empty">No reserved cards</span>}
        {player.reserved.map((card) => (
          <CardView
            key={card.id}
            card={card}
            size="mini"
            onClick={onReservedClick ? () => onReservedClick(card) : undefined}
          />
        ))}
        {player.nobles.map((n) => (
          <div key={n.id} className="noble" style={{ width: 66, height: 66 }} title="Noble visited">
            <CrownIcon size={22} />
          </div>
        ))}
      </div>
    </div>
  );
}
