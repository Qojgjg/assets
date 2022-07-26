import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

console.log('Updating ETFs...');

const etfs: ETF[] = [];

const result = await fetch(
  'https://thingproxy.freeboard.io/fetch/https://etfdb.com/compare/volume/',
);

const html = await result.text();

const document = new DOMParser().parseFromString(html, 'text/html');

if (document) {
  const tbody = document.querySelector('tbody');

  if (tbody) {
    for (const tr of Array.from(tbody.children)) {
      const symbol = tr.querySelector('[data-th="Symbol"]')?.textContent;

      const name = tr.querySelector('[data-th="Name"]')?.textContent;

      const aum = Number(
        tr.querySelector('[data-th="AUM"]')?.textContent.replaceAll(
          '$',
          '',
        ).replaceAll(',', ''),
      );

      if (!symbol || !name || !aum) {
        throw Error('Failed to fetch data');
      }

      etfs.push({
        symbol,
        name,
        aum,
      });
    }
  }
}

etfs.sort((etf1, etf2) => etf2.aum - etf1.aum);

if (etfs.length < 100) {
  throw Error;
}

const encoder = new TextEncoder();

Deno.writeFileSync(
  './etfs.json',
  encoder.encode(JSON.stringify(
    etfs.map((etf) => {
      // @ts-ignore next-line
      delete etf['aum'];

      return etf;
    }),
    null,
    2,
  )),
);
