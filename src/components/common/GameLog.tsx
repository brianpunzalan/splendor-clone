import { useEffect, useRef } from 'react';
import type { GameState } from '../../game/types';

export function GameLog({ state }: { state: GameState }) {
  const ref = useRef<HTMLDivElement>(null);
  const nameOf = (id: string) => state.players.find((p) => p.id === id)?.name ?? '';

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.log.length]);

  const recent = state.log.slice(-40);
  return (
    <div className="log" ref={ref}>
      <h3>Game Log</h3>
      {recent.length === 0 && <div className="mini-empty">The game has just begun.</div>}
      {recent.map((e) => (
        <div className="entry" key={e.id}>
          <span className="who">{nameOf(e.playerId)}</span> {e.text}
        </div>
      ))}
    </div>
  );
}
