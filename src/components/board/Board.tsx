import type { Card, GameState, GemColor, Player, Tier } from '../../game/types';
import { GEM_COLORS, TIERS } from '../../game/data/constants';
import { canAfford, costAfterBonus } from '../../game/rules/cost';
import { GemBank } from './GemBank';
import { CardView } from './CardView';
import { NobleView } from './NobleView';
import { GemIcon } from '../common/icons';

interface Props {
  state: GameState;
  viewer: Player;
  isHumanTurn: boolean;
  gemSel: Record<GemColor, number>;
  canSelect: (c: GemColor) => boolean;
  onToggleGem: (c: GemColor) => void;
  onConfirmTake: () => void;
  onClearSelection: () => void;
  onCardClick: (card: Card, from: 'board') => void;
  onReserveDeck: (tier: Tier) => void;
}

export function Board(props: Props) {
  const { state, viewer, isHumanTurn, gemSel } = props;
  const totalSel = GEM_COLORS.reduce((s, c) => s + gemSel[c], 0);

  return (
    <div className="board">
      <div className="nobles-strip">
        {state.nobles.map((n) => (
          <NobleView key={n.id} noble={n} />
        ))}
      </div>

      <div className="tier-rows">
        {[...TIERS].reverse().map((tier) => {
          const canReserveDeck =
            isHumanTurn && viewer.reserved.length < 3 && state.decks[tier].length > 0;
          return (
            <div className="card-row" key={tier}>
              <div
                className={`deck${canReserveDeck ? ' reservable' : ''}`}
                title={canReserveDeck ? 'Reserve a card blind from this deck' : undefined}
                onClick={() => canReserveDeck && props.onReserveDeck(tier)}
              >
                <span className="tier-num">{tier}</span>
                <span>{state.decks[tier].length} left</span>
                {canReserveDeck && <span>reserve ↧</span>}
              </div>
              <div className="card-slots">
                {state.visible[tier].map((card, i) => (
                  <CardView
                    key={card?.id ?? `empty-${tier}-${i}`}
                    card={card}
                    affordable={!!card && isHumanTurn && canAfford(viewer, card)}
                    remaining={card ? costAfterBonus(viewer, card) : undefined}
                    onClick={
                      card && isHumanTurn ? () => props.onCardClick(card, 'board') : undefined
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <GemBank
        bank={state.bank}
        selected={gemSel}
        interactive={isHumanTurn}
        canSelect={props.canSelect}
        onToggle={props.onToggleGem}
      />

      {isHumanTurn && (
        <div className="action-bar">
          <div className="selection-preview">
            {totalSel === 0 ? (
              'Click gems to take, or click a card to buy/reserve.'
            ) : (
              <>
                Taking:
                {GEM_COLORS.map((c) =>
                  Array.from({ length: gemSel[c] }).map((_, i) => (
                    <GemIcon key={`${c}-${i}`} color={c} size={20} />
                  )),
                )}
              </>
            )}
          </div>
          <button className="primary" disabled={totalSel === 0} onClick={props.onConfirmTake}>
            Take gems
          </button>
          <button className="ghost" disabled={totalSel === 0} onClick={props.onClearSelection}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
