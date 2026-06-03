// Structured attribution for openly-licensed assets, rendered in the in-app
// Credits panel. game-icons.net icons are CC BY 3.0 and require attribution.

export interface Credit {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  usedFor: string;
}

export const CC_BY_3 = {
  name: 'CC BY 3.0',
  url: 'https://creativecommons.org/licenses/by/3.0/',
};

export const ASSET_CREDITS: Credit[] = [
  {
    title: 'Cut diamond',
    author: 'Lorc',
    license: CC_BY_3.name,
    licenseUrl: CC_BY_3.url,
    sourceUrl: 'https://game-icons.net/1x1/lorc/cut-diamond.html',
    usedFor: 'Gem tokens and card bonuses',
  },
  {
    title: 'Two coins',
    author: 'Delapouite',
    license: CC_BY_3.name,
    licenseUrl: CC_BY_3.url,
    sourceUrl: 'https://game-icons.net/1x1/delapouite/two-coins.html',
    usedFor: 'Gold (joker) tokens',
  },
  {
    title: 'Crown',
    author: 'Lorc',
    license: CC_BY_3.name,
    licenseUrl: CC_BY_3.url,
    sourceUrl: 'https://game-icons.net/1x1/lorc/crown.html',
    usedFor: 'Noble tiles',
  },
  {
    title: 'Round star',
    author: 'Delapouite',
    license: CC_BY_3.name,
    licenseUrl: CC_BY_3.url,
    sourceUrl: 'https://game-icons.net/1x1/delapouite/round-star.html',
    usedFor: 'Prestige points',
  },
];

export const ICONS_SOURCE = 'https://game-icons.net';
