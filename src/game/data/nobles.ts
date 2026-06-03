import type { Cost, GemColor, Noble } from '../types';

// The 10 standard Splendor noble tiles. Each is worth 3 prestige points.
// Five require 3 bonuses of each of three colors; five require 4 of each of two
// colors. `requirement` lists the bonus counts (purchased cards) per color.
type RawNoble = Partial<Record<GemColor, number>>;

const RAW: { name: string; req: RawNoble }[] = [
  { name: 'Mary Stuart', req: { green: 3, blue: 3, red: 3 } },
  { name: 'Charles V', req: { white: 3, blue: 3, black: 3 } },
  { name: 'Macchiavelli', req: { white: 3, blue: 3, red: 3 } },
  { name: 'Isabella of Castile', req: { white: 3, green: 3, black: 3 } },
  { name: 'Suleiman the Magnificent', req: { blue: 3, green: 3, red: 3 } },
  { name: 'Catherine of Medici', req: { green: 3, red: 3, black: 3 } },
  { name: 'Anne of Brittany', req: { white: 4, blue: 4 } },
  { name: 'Henry VIII', req: { red: 4, black: 4 } },
  { name: 'Elisabeth of Austria', req: { white: 4, black: 4 } },
  { name: 'Francis I of France', req: { green: 4, red: 4 } },
];

function toCost(req: RawNoble): Cost {
  return {
    white: req.white ?? 0,
    blue: req.blue ?? 0,
    green: req.green ?? 0,
    red: req.red ?? 0,
    black: req.black ?? 0,
  };
}

export const NOBLE_NAMES: Record<string, string> = {};

export const ALL_NOBLES: Noble[] = RAW.map(({ name, req }, i) => {
  const id = `n${String(i).padStart(2, '0')}`;
  NOBLE_NAMES[id] = name;
  return { id, points: 3, requirement: toCost(req) };
});
