import type { GameState } from '../game/types';
import { score } from '../game/util';
import { discardSaveAndReset } from '../store/gameStore';
import { StarIcon } from './common/icons';

export function GameOverScreen({ state }: { state: GameState }) {
  const ranked = [...state.players].sort((a, b) => {
    const d = score(b) - score(a);
    return d !== 0 ? d : a.cards.length - b.cards.length; // tiebreak: fewer cards
  });

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ textAlign: 'center' }}>
        <h2>Final Standings</h2>
        <ol className="standings">
          {ranked.map((p, i) => (
            <li key={p.id} className={p.id === state.winnerId ? 'winner' : ''}>
              <span className="rank">{i + 1}</span>
              <span>{p.name}</span>
              <span className="badge">{p.cards.length} cards</span>
              <span className="pts">
                <StarIcon size={16} style={{ color: 'var(--accent)', marginRight: 4 }} />
                {score(p)}
              </span>
            </li>
          ))}
        </ol>
        <div className="actions" style={{ justifyContent: 'center' }}>
          <button className="primary" onClick={discardSaveAndReset}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
