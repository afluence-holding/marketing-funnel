import { NextResponse } from 'next/server';

type TickerRow = {
  label: string;
  symbol: string;
  decimals: number;
};

type YahooQuote = {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
};

const TICKERS: TickerRow[] = [
  { label: 'S&P 500', symbol: '^GSPC', decimals: 2 },
  { label: 'NASDAQ', symbol: '^IXIC', decimals: 2 },
  { label: 'BTC/USD', symbol: 'BTC-USD', decimals: 0 },
  { label: 'MERVAL', symbol: '^MERV', decimals: 0 },
  { label: 'IPSA', symbol: '^IPSA', decimals: 2 },
  { label: 'USD/ARS', symbol: 'ARS=X', decimals: 2 },
  { label: 'USD/CLP', symbol: 'CLP=X', decimals: 2 },
  { label: 'ETH/USD', symbol: 'ETH-USD', decimals: 0 },
  { label: 'VOO', symbol: 'VOO', decimals: 2 },
  { label: 'VT', symbol: 'VT', decimals: 2 },
];

const FALLBACK_ITEMS = [
  { label: 'S&P 500', val: '5,847.22', chg: '+0.42%', dir: 'up' },
  { label: 'NASDAQ', val: '20,193.44', chg: '+0.68%', dir: 'up' },
  { label: 'BTC/USD', val: '98,421', chg: '+1.24%', dir: 'up' },
  { label: 'MERVAL', val: '2,847,102', chg: '-0.31%', dir: 'down' },
  { label: 'IPSA', val: '6,834.10', chg: '+0.18%', dir: 'up' },
  { label: 'USD/ARS', val: '1,047.50', chg: '+0.05%', dir: 'up' },
  { label: 'USD/CLP', val: '942.30', chg: '-0.12%', dir: 'down' },
  { label: 'ETH/USD', val: '3,742', chg: '+2.10%', dir: 'up' },
  { label: 'VOO', val: '538.12', chg: '+0.41%', dir: 'up' },
  { label: 'VT', val: '124.88', chg: '+0.33%', dir: 'up' },
];

const numberFormatterByDecimals = new Map<number, Intl.NumberFormat>();

function formatValue(value: number, decimals: number): string {
  if (!numberFormatterByDecimals.has(decimals)) {
    numberFormatterByDecimals.set(
      decimals,
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    );
  }

  const formatter = numberFormatterByDecimals.get(decimals);
  if (!formatter) return value.toString();
  return formatter.format(value);
}

function formatChange(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export async function GET() {
  try {
    const symbols = TICKERS.map((item) => item.symbol).join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo quote API responded with ${response.status}`);
    }

    const payload = (await response.json()) as {
      quoteResponse?: { result?: YahooQuote[] };
    };

    const quotes = payload.quoteResponse?.result ?? [];
    const quoteBySymbol = new Map<string, YahooQuote>();
    for (const quote of quotes) {
      if (quote.symbol) quoteBySymbol.set(quote.symbol, quote);
    }

    const items = TICKERS.map((ticker) => {
      const quote = quoteBySymbol.get(ticker.symbol);
      const marketPrice = quote?.regularMarketPrice;
      const previousClose = quote?.regularMarketPreviousClose;
      let changePercent = quote?.regularMarketChangePercent;

      if (changePercent == null && marketPrice != null && previousClose) {
        changePercent = ((marketPrice - previousClose) / previousClose) * 100;
      }

      if (marketPrice == null || changePercent == null || Number.isNaN(changePercent)) {
        const fallback = FALLBACK_ITEMS.find((item) => item.label === ticker.label);
        return fallback ?? { label: ticker.label, val: '-', chg: '0.00%', dir: 'up' };
      }

      return {
        label: ticker.label,
        val: formatValue(marketPrice, ticker.decimals),
        chg: formatChange(changePercent),
        dir: changePercent >= 0 ? 'up' : 'down',
      };
    });

    return NextResponse.json(
      { items, source: 'yahoo', updatedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  } catch {
    return NextResponse.json(
      { items: FALLBACK_ITEMS, source: 'fallback', updatedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  }
}
