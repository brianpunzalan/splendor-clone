import { useState } from 'react';
import type { Player, TokenColor } from '../../game/types';
import { TOKEN_COLORS } from '../../game/data/constants';
import { emptyTokens } from '../../game/util';
import { GemIcon } from '../common/icons';

interface Props {
  player: Player;
  count: number; // number of tokens that must be returned
  onConfirm: (returned: Partial<Record<TokenColor, number>>) => void;
}

export function ReturnTokensModal({ player, count, onConfirm }: Props) {
  const [sel, setSel] = useState<Record<TokenColor, number>>(emptyTokens());
  const total = TOKEN_COLORS.reduce((s, c) => s + sel[c], 0);

  const inc = (c: TokenColor) => {
    if (total >= count) return;
    if (sel[c] >= player.tokens[c]) return;
    setSel({ ...sel, [c]: sel[c] + 1 });
  };
  const dec = (c: TokenColor) => {
    if (sel[c] <= 0) return;
    setSel({ ...sel, [c]: sel[c] - 1 });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Return {count} token{count > 1 ? 's' : ''}</h2>
        <p style={{ color: 'var(--muted)' }}>
          You are over the 10-token limit. Choose {count} to return to the bank.
        </p>
        <div className="row">
          {TOKEN_COLORS.filter((c) => player.tokens[c] > 0).map((c) => (
            <div key={c} style={{ textAlign: 'center' }}>
              <div className={`token bank-bg-${c} ${c === 'white' ? 'tok-white' : ''}`}>
                <GemIcon color={c} size={24} />
                <span className="count">{player.tokens[c] - sel[c]}</span>
              </div>
              <div className="row" style={{ justifyContent: 'center', marginTop: 6, gap: 4 }}>
                <button onClick={() => dec(c)} disabled={sel[c] <= 0}>
                  –
                </button>
                <span style={{ minWidth: 16, textAlign: 'center' }}>{sel[c]}</span>
                <button onClick={() => inc(c)} disabled={total >= count || sel[c] >= player.tokens[c]}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="actions">
          <button className="primary" disabled={total !== count} onClick={() => onConfirm(sel)}>
            Return {total}/{count}
          </button>
        </div>
      </div>
    </div>
  );
}
