import { ASSET_CREDITS, ICONS_SOURCE } from '../../assets/credits';

export function CreditsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Credits & Licenses</h2>
        <p style={{ color: 'var(--muted)' }}>
          An original, non-commercial fan clone of <i>Splendor</i> (designed by Marc André).
          Built with React + TypeScript. Artwork from{' '}
          <a href={ICONS_SOURCE} target="_blank" rel="noreferrer">
            game-icons.net
          </a>
          , recolored via CSS.
        </p>
        <ul className="credits-list">
          {ASSET_CREDITS.map((c) => (
            <li key={c.title}>
              <b>“{c.title}”</b> by {c.author} —{' '}
              <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                {c.license}
              </a>{' '}
              (
              <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                source
              </a>
              ) · {c.usedFor}
            </li>
          ))}
        </ul>
        <div className="actions">
          <button className="primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
