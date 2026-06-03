import type { GemColor, Tokens } from '../../game/types';
import { GEM_COLORS, GEM_LABELS } from '../../game/data/constants';
import { GemIcon } from '../common/icons';

interface Props {
  bank: Tokens;
  selected: Record<GemColor, number>;
  interactive: boolean;
  canSelect: (color: GemColor) => boolean;
  onToggle: (color: GemColor) => void;
}

export function GemBank({ bank, selected, interactive, canSelect, onToggle }: Props) {
  return (
    <div className="bank">
      {GEM_COLORS.map((c) => {
        const sel = selected[c] > 0;
        const disabled = interactive && !sel && !canSelect(c);
        const allow = interactive && (sel || canSelect(c));
        return (
          <div
            key={c}
            className={[
              'token',
              `bank-bg-${c}`,
              c === 'white' ? 'tok-white' : '',
              allow ? 'selectable' : '',
              sel ? 'selected' : '',
              disabled ? 'disabled' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            title={`${GEM_LABELS[c]} — ${bank[c]} left`}
            onClick={() => allow && onToggle(c)}
          >
            <GemIcon color={c} size={26} />
            <span className="count">{selected[c] > 0 ? `+${selected[c]}` : bank[c]}</span>
          </div>
        );
      })}
      <div
        className="token bank-bg-gold"
        title={`Gold joker — ${bank.gold} left (take by reserving a card)`}
      >
        <GemIcon color="gold" size={26} />
        <span className="count">{bank.gold}</span>
      </div>
    </div>
  );
}
