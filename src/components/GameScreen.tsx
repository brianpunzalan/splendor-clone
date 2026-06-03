import { useEffect, useMemo, useState } from 'react';
import type { Card, GemColor, Tier } from '../game/types';
import { GEM_COLORS, TAKE_TWO_MIN } from '../game/data/constants';
import { useGameStore } from '../store/gameStore';
import { useAiDriver } from '../hooks/useAiDriver';
import { Board } from './board/Board';
import { PlayerPanel } from './players/PlayerPanel';
import { GameLog } from './common/GameLog';
import { CardActionModal } from './controls/CardActionModal';
import { ReturnTokensModal } from './controls/ReturnTokensModal';
import { NobleChoiceModal } from './controls/NobleChoiceModal';
import { CreditsModal } from './common/CreditsModal';
import { GameOverScreen } from './GameOverScreen';

const emptyGemSel = (): Record<GemColor, number> => ({
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
});

export function GameScreen() {
  useAiDriver();
  const state = useGameStore((s) => s.state);
  const error = useGameStore((s) => s.error);
  const play = useGameStore((s) => s.play);
  const returnTokens = useGameStore((s) => s.returnTokens);
  const chooseNoble = useGameStore((s) => s.chooseNoble);
  const quitToMenu = useGameStore((s) => s.quitToMenu);
  const clearError = useGameStore((s) => s.clearError);

  const [gemSel, setGemSel] = useState<Record<GemColor, number>>(emptyGemSel());
  const [activeCard, setActiveCard] = useState<{ card: Card; from: 'board' | 'reserved' } | null>(
    null,
  );
  const [showCredits, setShowCredits] = useState(false);

  const current = state?.players[state.current] ?? null;
  const isHumanTurn =
    !!state && state.phase === 'playing' && !state.pending && current?.type === 'human';

  // Reset transient UI when the turn/seat changes.
  const seat = state?.current;
  const pending = state?.pending;
  useEffect(() => {
    setGemSel(emptyGemSel());
    setActiveCard(null);
  }, [seat, pending]);

  // Auto-dismiss the error toast.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 2600);
    return () => clearTimeout(t);
  }, [error, clearError]);

  const totalSel = useMemo(() => GEM_COLORS.reduce((s, c) => s + gemSel[c], 0), [gemSel]);

  if (!state || !current) return null;

  const canSelect = (color: GemColor): boolean => {
    if (!isHumanTurn) return false;
    if (state.bank[color] - gemSel[color] <= 0) return false;
    if (GEM_COLORS.some((c) => gemSel[c] === 2)) return false; // a pair is locked
    if (gemSel[color] === 1) return totalSel === 1 && state.bank[color] >= TAKE_TWO_MIN;
    return totalSel < 3;
  };

  const toggleGem = (color: GemColor) => {
    if (canSelect(color)) setGemSel((s) => ({ ...s, [color]: s[color] + 1 }));
    else if (gemSel[color] > 0) setGemSel((s) => ({ ...s, [color]: 0 }));
  };

  const confirmTake = () => {
    const pair = GEM_COLORS.find((c) => gemSel[c] === 2);
    if (pair) play({ type: 'takeTwo', color: pair });
    else play({ type: 'takeThree', colors: GEM_COLORS.filter((c) => gemSel[c] > 0) });
    setGemSel(emptyGemSel());
  };

  const purchaseActive = () => {
    if (!activeCard) return;
    play({ type: 'purchase', cardId: activeCard.card.id, from: activeCard.from });
    setActiveCard(null);
  };

  const reserveActive = () => {
    if (!activeCard) return;
    play({ type: 'reserveVisible', cardId: activeCard.card.id });
    setActiveCard(null);
  };

  const pendingNobles =
    state.pending?.type === 'chooseNoble'
      ? state.nobles.filter((n) => state.pending!.type === 'chooseNoble' && state.pending!.nobleIds.includes(n.id))
      : [];

  const turnName = current.name;

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">
          Splendor<span className="spark"> ✦</span> Gem Merchants
        </span>
        <span className="turn-banner">
          {state.phase === 'gameOver' ? (
            'Game over'
          ) : (
            <>
              Turn {state.turn} — <b>{turnName}</b>
              {current.type === 'ai' ? ' is thinking…' : "'s move"}
              {state.finalRound && ' · final round!'}
            </>
          )}
        </span>
        <span className="spacer" />
        <button className="ghost" onClick={() => setShowCredits(true)}>
          Credits
        </button>
        <button className="ghost" onClick={quitToMenu}>
          Menu
        </button>
      </div>

      <div className="game-layout">
        <Board
          state={state}
          viewer={current}
          isHumanTurn={isHumanTurn}
          gemSel={gemSel}
          canSelect={canSelect}
          onToggleGem={toggleGem}
          onConfirmTake={confirmTake}
          onClearSelection={() => setGemSel(emptyGemSel())}
          onCardClick={(card, from) => setActiveCard({ card, from })}
          onReserveDeck={(tier: Tier) => play({ type: 'reserveDeck', tier })}
        />

        <div>
          <div className="players">
            {state.players.map((p, i) => (
              <PlayerPanel
                key={p.id}
                player={p}
                active={i === state.current}
                onReservedClick={
                  isHumanTurn && i === state.current
                    ? (card) => setActiveCard({ card, from: 'reserved' })
                    : undefined
                }
              />
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <GameLog state={state} />
          </div>
        </div>
      </div>

      {activeCard && (
        <CardActionModal
          card={activeCard.card}
          from={activeCard.from}
          player={current}
          onPurchase={purchaseActive}
          onReserve={activeCard.from === 'board' ? reserveActive : undefined}
          onClose={() => setActiveCard(null)}
        />
      )}

      {state.pending?.type === 'returnTokens' && current.type === 'human' && (
        <ReturnTokensModal
          player={current}
          count={state.pending.count}
          onConfirm={(returned) => returnTokens(returned)}
        />
      )}

      {state.pending?.type === 'chooseNoble' && current.type === 'human' && (
        <NobleChoiceModal nobles={pendingNobles} onChoose={(id) => chooseNoble(id)} />
      )}

      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
      {state.phase === 'gameOver' && <GameOverScreen state={state} />}
      {error && <div className="error-toast">{error}</div>}
    </div>
  );
}
