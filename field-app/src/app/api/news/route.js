// World news — facts only, zero opinions

const TRASH = [
  "opinion", "analysis", "column", "editorial", "commentary", "perspective",
  "why you should", "why you must", "ranking the", "ranked:", "grading",
  "best ", "worst ", "should ", "must ", "could be", "might be",
  "10 things", "5 things", "everything you need", "what we learned",
  "takeaways", "deep dive", "explained:", "the case for", "the case against",
  "watch:", "listen:", "review:", "podcast", "episode", "newsletter",
  "preview:", "bold predictions", "winners and losers",
];

const REAL_SIGNALS = [
  "killed", "dead", "dies", "death", "war", "attack", "strikes", "fired",
  "missile", "troops", "military", "invasion", "ceasefire", "sanctions",
  "arrest", "charged", "indicted", "sentenced", "convicted",
  "passes", "passed", "signs", "signed", "vetoes", "vetoed", "enacted",
  "elected", "wins election", "loses election", "resigns", "fired",
  "announces", "declared", "confirmed", "reports", "reveals",
  "earthquake", "hurricane", "flood", "explosion", "crash",
  "rises", "falls", "surges", "plunges", "hits record", "reaches",
  "rate cut", "rate hike", "inflation", "unemployment", "gdp",
  "launches", "unveils", "releases", "acquires", "merger", "ipo",
];

const CATS = {
  geo:      ["iran", "war", "military", "nato", "ukraine", "russia", "israel", "attack", "missile", "troops", "conflict", "nuclear", "strike", "killed", "forces", "ceasefire", "invasion", "diplomat", "gaza", "china", "taiwan", "north korea"],
  markets:  ["oil", "inflation", "fed", "interest rate", "rate cut", "rate hike", "stocks", "market", "economy", "gdp", "recession", "dollar", "bitcoin", "crypto", "nasdaq", "dow", "s&p", "earnings", "jobs", "unemployment", "tariff", "trade war", "brent", "crude"],
  politics: ["congress", "senate", "president", "election", "policy", "bill passed", "vote", "supreme court", "white house", "legislation", "governor", "parliament", "prime minister", "sanctions", "executive order", "filibuster", "veto"],
  tech:     ["openai", "google", "apple", "microsoft", "amazon", "meta", "artificial intelligence", " ai ", "quantum", "chip", "semiconductor", "startup", "data breach", "hack", "elon musk", "tesla", "spacex", "ipo"],
};

function isTrash(title = "") {
  return TRASH.some(t => title.toLowerCase().includes(t));
}

function isReal(title = "") {
  return REAL_SIGNALS.some(s => title.toLowerCase().includes(s));
}

function categorize(title = "", desc = "") {
  const text = (title + " " + desc).toLowerCase();
  for (const [cat, kw] of Object.entries(CATS)) {
    if (kw.some(k => text.includes(k))) return cat;
  }
  return "geo";
}

function timeAgo(d) {
  if (!d) return "Recently";
  const m = (Date.now() - new Date(d)) / 60000;
  if (m < 60)   return `${Math.floor(m)}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

export async function GET() {
  try {
    const key = process.env.NEWS_API_KEY;
    if (!key || key === "your_newsapi_key_here") return Response.json({ articles: fallback() });

    const url  = `https://newsapi.org/v2/top-headlines?language=en&pageSize=50&apiKey=${key}`;
    const res  = await fetch(url, { next: { revalidate: 180 } });
    const data = await res.json();

    if (!data.articles?.length) return Response.json({ articles: fallback() });

    // Filter trash
    const cleaned = data.articles.filter(a => {
      const h = a.title || "";
      return h && h !== "[Removed]" && !isTrash(h);
    });

    // Prioritize real factual news
    const real  = cleaned.filter(a => isReal(a.title || ""));
    const other = cleaned.filter(a => !isReal(a.title || ""));
    const combined = [...real, ...other].slice(0, 15);

    const articles = combined.map((a, i) => ({
      id:       `w${i + 1}`,
      headline: a.title.replace(/ [-|].*$/, "").trim(),
      source:   a.source?.name || "News",
      time:     timeAgo(a.publishedAt),
      region:   a.source?.name || "Global",
      category: categorize(a.title, a.description),
      rank:     i < 5 ? i + 1 : null,
      url:      a.url,
      breaking: i === 0,
    }));

    return Response.json({ articles });
  } catch (e) {
    console.error("News error:", e);
    return Response.json({ articles: fallback() });
  }
}

function fallback() {
  return [
    { id: "w1", category: "geo",      rank: 1, breaking: true,  headline: "US deploys carrier strike group to Persian Gulf amid Iran tensions",             source: "Reuters",          time: "47m ago", region: "Middle East"    },
    { id: "w2", category: "markets",  rank: 2, breaking: false, headline: "Oil surges 8.4% as Strait of Hormuz closure fears escalate, Brent hits $97",     source: "Bloomberg",        time: "1h ago",  region: "Global Markets"  },
    { id: "w3", category: "politics", rank: 3, breaking: false, headline: "Senate passes AI regulation bill 67-33 in rare bipartisan vote",                  source: "AP News",          time: "2h ago",  region: "Washington D.C." },
    { id: "w4", category: "tech",     rank: 4, breaking: false, headline: "OpenAI announces GPT-5 with real-time video understanding and autonomous agents", source: "The Verge",        time: "3h ago",  region: "San Francisco"   },
    { id: "w5", category: "geo",      rank: 5, breaking: false, headline: "NATO invokes Article 4 consultations after cross-border attack on member state",  source: "BBC News",         time: "4h ago",  region: "Eastern Europe"  },
    { id: "w6", category: "markets",  rank: null, breaking: false, headline: "Federal Reserve signals two rate cuts in 2025 as CPI drops to 2.1%",           source: "Wall Street Journal", time: "3h ago", region: "U.S. Economy" },
    { id: "w7", category: "politics", rank: null, breaking: false, headline: "Supreme Court takes up landmark First Amendment case involving social media",   source: "New York Times",   time: "5h ago",  region: "Washington D.C." },
    { id: "w8", category: "tech",     rank: null, breaking: false, headline: "China claims world's first 1-million qubit quantum processor",                  source: "Financial Times",  time: "6h ago",  region: "Beijing"         },
  ];
}
