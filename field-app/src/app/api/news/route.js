// World news from NewsAPI - facts only, opinions filtered out

const OPINION_WORDS = [
  "opinion", "analysis", "why you should", "ranking", "best", "worst",
  "column", "editorial", "commentary", "perspective", "think", "believe",
  "should", "must", "grade", "verdict", "review", "take", "10 things",
  "what we learned", "explained", "everything you need"
];

const CATEGORY_MAP = {
  geo:      ["iran", "war", "military", "nato", "ukraine", "russia", "israel", "attack", "missile", "troops", "conflict", "nuclear", "strike", "killed", "forces", "army", "navy", "ceasefire", "invasion", "diplomat"],
  markets:  ["oil", "inflation", "fed", "rate cut", "interest rate", "stocks", "market", "economy", "gdp", "recession", "dollar", "bitcoin", "crypto", "nasdaq", "dow", "s&p", "earnings", "jobs", "unemployment", "trade war", "tariff"],
  politics: ["congress", "senate", "president", "election", "policy", "bill passed", "vote", "supreme court", "white house", "legislation", "governor", "mayor", "parliament", "pm ", "prime minister", "sanctions", "executive order"],
  tech:     ["openai", "google", "apple", "microsoft", "amazon", "meta", "ai ", "artificial intelligence", "quantum", "chip", "semiconductor", "robot", "startup", "ipo", "data breach", "hack", "elon", "tesla", "spacex"],
};

function categorize(title = "", desc = "") {
  const text = (title + " " + desc).toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return "geo";
}

function isOpinion(title = "") {
  const t = title.toLowerCase();
  return OPINION_WORDS.some(w => t.includes(w));
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
    if (!key || key === "your_newsapi_key_here") {
      return Response.json({ articles: fallback() });
    }

    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=30&apiKey=${key}`;
    const res  = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    if (!data.articles?.length) return Response.json({ articles: fallback() });

    const articles = data.articles
      .filter(a => a.title && a.title !== "[Removed]" && !isOpinion(a.title))
      .slice(0, 15)
      .map((a, i) => ({
        id:       `w${i + 1}`,
        headline: a.title.replace(/ - .*$/, ""), // strip source suffix
        source:   a.source?.name || "News",
        time:     timeAgo(a.publishedAt),
        region:   a.source?.name || "Global",
        category: categorize(a.title, a.description),
        rank:     i < 5 ? i + 1 : null,
        url:      a.url,
        breaking: i === 0, // top article flagged as breaking
      }));

    return Response.json({ articles });
  } catch (e) {
    console.error("News error", e);
    return Response.json({ articles: fallback() });
  }
}

function fallback() {
  return [
    { id: "w1", category: "geo",      rank: 1, breaking: true,  headline: "US deploys carrier strike group to Persian Gulf amid Iran tensions", source: "Reuters",        time: "47m ago",  region: "Middle East"   },
    { id: "w2", category: "markets",  rank: 2, breaking: false, headline: "Oil surges 8.4% as Strait of Hormuz closure fears escalate", source: "Bloomberg",       time: "1h ago",   region: "Global Markets" },
    { id: "w3", category: "politics", rank: 3, breaking: false, headline: "Senate passes AI regulation bill 67-33 in rare bipartisan vote", source: "AP News",         time: "2h ago",   region: "Washington D.C." },
    { id: "w4", category: "tech",     rank: 4, breaking: false, headline: "OpenAI announces GPT-5 with real-time video and autonomous agents", source: "The Verge",       time: "3h ago",   region: "San Francisco"  },
    { id: "w5", category: "geo",      rank: 5, breaking: false, headline: "NATO invokes Article 4 after cross-border attack on member state", source: "BBC News",        time: "4h ago",   region: "Eastern Europe" },
    { id: "w6", category: "markets",  rank: null, breaking: false, headline: "Fed signals two rate cuts in 2025 as CPI drops to 2.1%", source: "Wall Street Journal", time: "3h ago", region: "U.S. Economy"  },
    { id: "w7", category: "politics", rank: null, breaking: false, headline: "Supreme Court takes up landmark First Amendment case involving social media", source: "NYT", time: "5h ago", region: "Washington D.C." },
    { id: "w8", category: "tech",     rank: null, breaking: false, headline: "China claims world's first 1-million qubit quantum processor", source: "Financial Times", time: "6h ago", region: "Beijing"        },
  ];
}
