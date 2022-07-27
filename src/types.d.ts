interface RGB {
  r: number;
  g: number;
  b: number;
}

interface Asset {
  symbol: string;
  name: string;
}

interface Equity extends Asset {
  rank: number;
  src: string;
  rgb?: RGB;
}

interface ETF extends Asset {
  aum: number;
}
