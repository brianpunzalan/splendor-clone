# Splendor ✦ Gem Merchants

An original, **local-first** browser clone of the gem-trading board game
*Splendor* (designed by Marc André). Play solo against heuristic **AI bots**,
or **pass-and-play** with 2–4 people on one device. No server, no network — the
whole game runs in your browser and saves to `localStorage`.

> This is a non-commercial fan project built for learning. "Splendor" and its
> card/noble data belong to their respective owners. All code here is original
> and all artwork is openly licensed (see [Credits](#credits)).

## Features

- ✅ Faithful rules: 90 development cards (40/30/20 by tier), 10 noble tiles,
  gold jokers, reserving, bonuses/discounts, the 10-token hand limit, noble
  visits, and the "first to 15 prestige, finish the round" victory with a
  fewest-cards tiebreak.
- 🤖 Heuristic AI opponents (mix humans and bots freely, 2–4 seats).
- 👥 Local hotseat pass-and-play.
- 💾 Auto-save / continue via `localStorage`.
- 🎨 Openly-licensed [game-icons.net](https://game-icons.net) art, recolored via
  CSS masks.
- 🧪 Pure, framework-agnostic game engine with a full Vitest suite (engine +
  AI-vs-AI + UI smoke tests).

## Getting started

```bash
npm install
npm run dev        # start the local dev server (Vite)
```

Then open the printed URL. To produce a static, self-contained build:

```bash
npm run build      # type-check + bundle into dist/
npm run preview    # serve the production build locally
```

The build uses a relative base path, so the contents of `dist/` can be opened
from any location (including a file server) without configuration.

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the Vite dev server                    |
| `npm run build`    | Type-check and build to `dist/`              |
| `npm run preview`  | Preview the production build                  |
| `npm test`         | Run the Vitest suite                          |
| `npm run lint`     | Run ESLint                                    |

## How to play

On your turn, take **one** action:

1. **Take 3 gems** of different colors.
2. **Take 2 gems** of the same color (only if ≥4 of that color remain).
3. **Reserve a card** (from the board or blind from a deck) and take 1 gold
   joker — you may hold up to 3 reserved cards.
4. **Buy a card** from the board or your reserves. Owned cards give permanent
   color discounts; gold jokers act as any color.

Cards grant prestige and a permanent gem bonus. Match a noble's bonus
requirement to attract them (+3 prestige). First to **15 prestige** triggers a
final round; the highest score then wins (ties broken by fewest cards).

## Architecture

```
src/game/        Pure, framework-agnostic engine (no React)
  types.ts         Core data structures
  data/            90-card dataset, 10 nobles, constants
  setup.ts         Shuffle & deal
  rules/           cost, actions, nobles, end-of-turn, legal moves
  ai/heuristic.ts  Move scoring for AI players
src/store/       Zustand store wrapping the engine + persistence
src/components/  React UI (board, players, controls, setup, game-over)
src/hooks/       AI turn driver
tests/           Vitest unit + UI tests
public/assets/   Openly-licensed SVG icons
```

The engine is deliberately decoupled from React: every rule is a pure function
operating on an immutable `GameState`, shared by both the UI and the AI, and
fully unit-tested.

## Credits

Icons from [game-icons.net](https://game-icons.net), used under
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/):

- "Cut diamond" by **Lorc** — gem tokens & cards
- "Two coins" by **Delapouite** — gold jokers
- "Crown" by **Lorc** — noble tiles
- "Round star" by **Delapouite** — prestige points

Icons were recolored/recomposed via CSS for this project. See
[`public/CREDITS.txt`](public/CREDITS.txt) for full attribution. An in-app
**Credits** panel is available from the menu and during play.
