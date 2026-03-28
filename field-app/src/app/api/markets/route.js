// src/app/api/markets/route.js
// Fetches live market data using Yahoo Finance (no API key needed).

const SYMBOLS = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "^DJI", label: "DOW" },
  { symbol: "BTC-USD", label: "BTC" },
  { symbol: "CL=F", label: "OIL (WTI)" },
  { symbol: "GC=F", label: "GOLD" },
  { symbol: "^TNX", label: "10Y YIELD" },
  { symbol: "EURUSD=X", label: "EUR/USD" },
];

export async function GET() {
  try {
    const symbolStr = SYMBOLS.map(s => s.symbol).join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 }, // cache 1 min
    });

    const data = await res.json();
    const quotes = data?.quoteResponse?.result || [];

    const tickers = SYMBOLS.map(s => {
      const q = quotes.find(r => r.symbol === s.symbol);
      if (!q) return { symbol: s.label, value: "--", change: "--", up: true };

      const price = q.regularMarketPrice;
      const changePct = q.regularMarketChangePercent;
      const up = changePct >= 0;

      let value;
      if (s.symbol === "^TNX") value = `${price.toFixed(2)}%`;
      else if (s.symbol === "EURUSD=X") value = price.toFixed(4);
      else if (s.symbol === "BTC-USD") value = `$${Math.round(price).toLocaleString()}`;
      else if (["CL=F", "GC=F"].includes(s.symbol)) value = `$${price.toFixed(2)}`;
      else value = price.toLocaleString(undefined, { maximumFractionDigits: 2 });

      const change = `${up ? "+" : ""}${changePct.toFixed(2)}%`;

      return { symbol: s.label, value, change, up };
    });

    return Response.json({ tickers });
  } catch (err) {
    console.error("Markets API error:", err);
    // Return sample data on failure
    return Response.json({
      tickers: [
        { symbol: "S&P 500", value: "5,842.31", change: "+1.2%", up: true },
        { symbol: "NASDAQ", value: "18,291.62", change: "+0.8%", up: true },
        { symbol: "DOW", value: "43,112.88", change: "-0.3%", up: false },
        { symbol: "BTC", value: "$94,210", change: "+3.4%", up: true },
        { symbol: "OIL (WTI)", value: "$94.80", change: "+7.8%", up: true },
        { symbol: "GOLD", value: "$2,841", change: "+1.1%", up: true },
        { symbol: "10Y YIELD", value: "4.31%", change: "+0.08", up: false },
        { symbol: "EUR/USD", value: "0.9241", change: "-0.2%", up: false },
      ]
    });
  }
}
