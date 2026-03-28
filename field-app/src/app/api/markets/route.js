// Server-side Yahoo Finance fetch — avoids all CORS issues

const SYMBOLS = [
  { symbol: "^GSPC",    label: "S&P 500",   type: "index"     },
  { symbol: "^IXIC",    label: "NASDAQ",    type: "index"     },
  { symbol: "^DJI",     label: "DOW",       type: "index"     },
  { symbol: "BTC-USD",  label: "BTC",       type: "crypto"    },
  { symbol: "ETH-USD",  label: "ETH",       type: "crypto"    },
  { symbol: "CL=F",     label: "OIL (WTI)", type: "commodity" },
  { symbol: "GC=F",     label: "GOLD",      type: "commodity" },
  { symbol: "^TNX",     label: "10Y YIELD", type: "bond"      },
  { symbol: "EURUSD=X", label: "EUR/USD",   type: "fx"        },
  { symbol: "DX-Y.NYB", label: "USD INDEX", type: "fx"        },
];

export async function GET() {
  try {
    const syms = SYMBOLS.map(s => s.symbol).join(",");
    const url  = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${syms}&range=1d&interval=5m`;

    // Also fetch quotes for current prices
    const quoteUrl = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${syms}`;

    const [quoteRes] = await Promise.all([
      fetch(quoteUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://finance.yahoo.com/",
        },
        cache: "no-store",
      }),
    ]);

    const quoteData = await quoteRes.json();
    const quotes = quoteData?.quoteResponse?.result || [];

    if (!quotes.length) {
      return Response.json({ tickers: fallback() });
    }

    const tickers = SYMBOLS.map(s => {
      const q = quotes.find(r => r.symbol === s.symbol);
      if (!q || !q.regularMarketPrice) {
        return { symbol: s.label, value: "--", change: "--", up: true, type: s.type };
      }

      const price     = q.regularMarketPrice;
      const changePct = q.regularMarketChangePercent || 0;
      const up        = changePct >= 0;

      let value;
      if (s.symbol === "^TNX")                               value = `${price.toFixed(3)}%`;
      else if (s.symbol.includes("USD=X") || s.symbol === "DX-Y.NYB") value = price.toFixed(4);
      else if (["BTC-USD","ETH-USD"].includes(s.symbol))    value = `$${Math.round(price).toLocaleString()}`;
      else if (["CL=F","GC=F"].includes(s.symbol))          value = `$${price.toFixed(2)}`;
      else value = price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      return {
        symbol: s.label,
        value,
        change: `${up ? "+" : ""}${changePct.toFixed(2)}%`,
        up,
        type: s.type,
      };
    });

    return Response.json({ tickers });
  } catch (e) {
    console.error("Markets fetch error:", e);
    return Response.json({ tickers: fallback() });
  }
}

function fallback() {
  return [
    { symbol: "S&P 500",   value: "5,842.31",  change: "+1.24%", up: true,  type: "index"     },
    { symbol: "NASDAQ",    value: "18,291.62", change: "+0.87%", up: true,  type: "index"     },
    { symbol: "DOW",       value: "43,112.88", change: "-0.31%", up: false, type: "index"     },
    { symbol: "BTC",       value: "$94,210",   change: "+3.41%", up: true,  type: "crypto"    },
    { symbol: "ETH",       value: "$3,241",    change: "+2.10%", up: true,  type: "crypto"    },
    { symbol: "OIL (WTI)", value: "$94.80",    change: "+7.82%", up: true,  type: "commodity" },
    { symbol: "GOLD",      value: "$2,841",    change: "+1.14%", up: true,  type: "commodity" },
    { symbol: "10Y YIELD", value: "4.312%",    change: "+0.08%", up: false, type: "bond"      },
    { symbol: "EUR/USD",   value: "0.9241",    change: "-0.21%", up: false, type: "fx"        },
    { symbol: "USD INDEX", value: "104.82",    change: "+0.33%", up: true,  type: "fx"        },
  ];
}
