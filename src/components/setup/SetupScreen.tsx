import { useState } from 'react';
import type { PlayerType } from '../../game/types';
import { MAX_PLAYERS, MIN_PLAYERS } from '../../game/data/constants';
import { useGameStore } from '../../store/gameStore';
import { hasSave } from '../../store/persistence';
import { CreditsModal } from '../common/CreditsModal';

interface Seat {
  name: string;
  type: PlayerType;
}

const defaultName = (i: number, type: PlayerType) =>
  type === 'ai' ? `Bot ${i + 1}` : `Player ${i + 1}`;

export function SetupScreen() {
  const newGame = useGameStore((s) => s.newGame);
  const continueGame = useGameStore((s) => s.continueGame);
  const [count, setCount] = useState(2);
  const [showCredits, setShowCredits] = useState(false);
  const [seats, setSeats] = useState<Seat[]>([
    { name: 'Player 1', type: 'human' },
    { name: 'Bot 2', type: 'ai' },
    { name: 'Bot 3', type: 'ai' },
    { name: 'Bot 4', type: 'ai' },
  ]);

  const setCountAndSeats = (n: number) => setCount(n);

  const setSeatType = (i: number, type: PlayerType) => {
    setSeats((prev) =>
      prev.map((s, idx) => {
        if (idx !== i) return s;
        const wasDefault = s.name === defaultName(i, s.type);
        return { type, name: wasDefault ? defaultName(i, type) : s.name };
      }),
    );
  };

  const setSeatName = (i: number, name: string) =>
    setSeats((prev) => prev.map((s, idx) => (idx === i ? { ...s, name } : s)));

  const start = () => newGame(seats.slice(0, count));

  return (
    <div className="menu">
      <div className="title">
        Splendor<span className="spark"> ✦</span>
      </div>
      <div className="subtitle">Gem Merchants — a local-first board game clone</div>

      <div className="setup-card">
        <h3>Players</h3>
        <div className="count-pick">
          {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, k) => k + MIN_PLAYERS).map(
            (n) => (
              <button key={n} className={count === n ? 'on' : ''} onClick={() => setCountAndSeats(n)}>
                {n} players
              </button>
            ),
          )}
        </div>

        {seats.slice(0, count).map((seat, i) => (
          <div className="seat-row" key={i}>
            <span style={{ width: 22, color: 'var(--muted)' }}>{i + 1}</span>
            <input
              type="text"
              value={seat.name}
              maxLength={18}
              onChange={(e) => setSeatName(i, e.target.value)}
            />
            <div className="seg">
              <button
                className={seat.type === 'human' ? 'on' : ''}
                onClick={() => setSeatType(i, 'human')}
              >
                Human
              </button>
              <button className={seat.type === 'ai' ? 'on' : ''} onClick={() => setSeatType(i, 'ai')}>
                AI
              </button>
            </div>
          </div>
        ))}

        <div className="actions" style={{ justifyContent: 'space-between', marginTop: 18 }}>
          <button className="ghost" onClick={() => setShowCredits(true)}>
            Credits
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {hasSave() && <button onClick={continueGame}>Continue saved game</button>}
            <button className="primary" onClick={start}>
              Start game
            </button>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 18 }}>
        Collect gems, buy development cards for permanent discounts &amp; prestige, attract nobles,
        and be first to 15 points.
      </p>

      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
    </div>
  );
}
