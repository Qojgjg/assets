import { getDominantColor } from './colors.ts';

console.log('Updating crypto...');

const numberOfAssetsPerPage = 250; // Max 250
const numberOfPages = 4;

const pathCryptoColors = './crypto.json';

let cryptoColors: {
  [key: string]: Color;
} = {};

try {
  const file = Deno.readTextFileSync(pathCryptoColors);
  cryptoColors = JSON.parse(file);
} catch (_) {
  // skip
}

for (
  const page of new Array(numberOfPages).fill(null).map((_, index) => index + 1)
) {
  try {
    const result = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${numberOfAssetsPerPage}&page=${page}&sparkline=false`,
    );

    const assets = await result.json();

    console.log(`Updating ${assets.length} colors...`);

    await Promise.all(assets.map(async (asset: {
      id: string;
      image: string;
    }) => {
      cryptoColors[asset.id] = await getDominantColor(asset.image);
    }));
  } catch (error) {
    throw error;
  }
}

console.log(`There are ${Object.keys(cryptoColors).length} colors now.`);

Deno.writeTextFileSync(
  pathCryptoColors,
  JSON.stringify(cryptoColors, null, 2),
);
