import type { Noble } from '../../game/types';
import { NobleView } from '../board/NobleView';

interface Props {
  nobles: Noble[];
  onChoose: (nobleId: string) => void;
}

export function NobleChoiceModal({ nobles, onChoose }: Props) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Choose a noble to visit</h2>
        <p style={{ color: 'var(--muted)' }}>
          You qualify for more than one noble — pick one (worth 3 prestige).
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          {nobles.map((n) => (
            <button
              key={n.id}
              className="ghost"
              style={{ padding: 6 }}
              onClick={() => onChoose(n.id)}
            >
              <NobleView noble={n} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
