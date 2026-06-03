import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../src/components/App';
import { useGameStore } from '../src/store/gameStore';

beforeEach(() => {
  localStorage.clear();
  useGameStore.setState({ screen: 'menu', state: null, error: null });
});

describe('App UI', () => {
  it('shows the setup screen', () => {
    render(<App />);
    expect(screen.getByText('Start game')).toBeTruthy();
    expect(screen.getByText('2 players')).toBeTruthy();
  });

  it('starts a game and renders the board', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Start game'));
    expect(screen.getByText(/Turn 1/)).toBeTruthy();
    expect(screen.getByText('Take gems')).toBeTruthy();
    // Default seats: Player 1 (human) + Bot 2 (ai) both present.
    expect(screen.getAllByText('Player 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bot 2').length).toBeGreaterThan(0);
  });

  it('lets a human take three gems and passes the turn to the AI', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Start game'));

    fireEvent.click(screen.getByTitle(/Diamond/));
    fireEvent.click(screen.getByTitle(/Sapphire/));
    fireEvent.click(screen.getByTitle(/Emerald/));
    fireEvent.click(screen.getByText('Take gems'));

    // It should now be the AI's turn.
    expect(screen.getByText(/is thinking/)).toBeTruthy();
  });
});
