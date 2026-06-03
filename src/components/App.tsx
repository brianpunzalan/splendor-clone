import { useGameStore } from '../store/gameStore';
import { SetupScreen } from './setup/SetupScreen';
import { GameScreen } from './GameScreen';

export function App() {
  const screen = useGameStore((s) => s.screen);
  return screen === 'game' ? <GameScreen /> : <SetupScreen />;
}
