import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

import { getDominantColor } from './colors.ts';

console.log('Updating equities...');

const equities: Equity[] = [];

const url = 'https://companiesmarketcap.com';

const promisesColors: Promise<void>[] = [];

const promisesEquities = Array(10).fill(null).map(async (_, index) => {
  const result = await fetch(`${url}/page/${index + 1}/`);

  const html = await result.text();

  const document = new DOMParser().parseFromString(html, 'text/html');

  if (document) {
    const tbody = document.querySelector('tbody');

    if (tbody) {
      for (const tr of Array.from(tbody.children)) {
        const rank = Number(tr.querySelector('[data-sort]')?.textContent);

        const symbol = tr.querySelector('.company-code')?.textContent;

        const name = tr.querySelector('.company-name')?.textContent?.replaceAll(
          '\n',
          '',
        );

        const src = `${url}${
          tr.querySelector('.company-logo')?.getAttribute('src')
        }`;

        if (!rank || !symbol || !name || !src) {
          throw Error('Failed to fetch data');
        }

        const equity: Equity = {
          rank,
          symbol,
          name,
          src,
        };

        promisesColors.push((async () => {
          equity.color = await getDominantColor(src);
        })());

        equities.push(equity);
      }
    }
  }
});

await Promise.all(promisesEquities);
await Promise.all(promisesColors);

equities.sort((equity1, equity2) => equity1.rank - equity2.rank);

if (equities.length < 1000) {
  throw Error;
}

const encoder = new TextEncoder();

Deno.writeFileSync(
  './equities.json',
  encoder.encode(JSON.stringify(equities, null, 2)),
);
