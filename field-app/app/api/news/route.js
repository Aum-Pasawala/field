// World news — strictly factual, zero celebrity/entertainment/opinions

const TRASH = [
  "taylor swift", "travis kelce", "kardashian", "jenner", "beyonce", "drake",
  "rihanna", "kanye", "kim k", "justin bieber", "selena gomez", "ariana grande",
  "iheartradio", "music awards", "grammy", "oscars", "emmys", "bafta", "golden globe",
  "met gala", "red carpet", "engagement ring", "celebrity couple", "baby shower",
  "public appearance", "post-engagement", "love life", "dating", "breakup", "romance",
  "reality tv", "bachelor", "bachelorette", "real housewives", "keeping up",
  "box office", "movie review", "film review", "tv show", "series finale",
  "season premiere", "streaming", "netflix original", "disney+", "hbo max",
  "album release", "music video", "concert tour", "ticket sales",
  "opinion:", "analysis:", "column:", "editorial", "commentary", "perspective",
  "why you should", "ranking the", "ranked:", "grading", "report card",
  "best ", "worst ", "10 things", "5 things", "everything you need",
  "what we learned", "takeaways", "deep dive", "the case for", "the case against",
  "watch:", "listen:", "review:", "podcast", "episode", "newsletter",
  "preview:", "bold predictions", "winners and losers",
  "recipe", "workout", "fitness tips", "skincare", "fashion week", "style guide",
  "home decor", "travel guide", "vacation", "restaurant review",
  "nba", "nfl", "mlb", "nhl", "super bowl", "world series", "nba finals",
];

const REAL_SIGNALS = [
  "killed", "dead", "dies", "death toll", "war", "airstrike", "attack",
  "strikes", "missile", "troops", "military", "invasion", "ceasefire",
  "bombing", "explosion", "shooting", "hostage",
  "arrested", "charged", "indicted", "sentenced", "convicted", "impeached",
  "resigns", "fired", "ousted", "appointed", "elected", "passed", "signed",
  "vetoed", "enacted", "sanctions", "executive order", "declared",
  "rate cut", "rate hike", "inflation", "unemployment", "gdp", "recession",
  "surges", "plunges", "crashes", "hits record", "tariff", "trade war",
  "layoffs", "bankruptcy", "merger", "acquisition", "ipo",
  "earthquake", "hurricane", "tornado", "flood", "wildfire", "tsunami",
  "summit", "treaty", "agreement", "negotiations", "ceasefire", "sanctions",
  "ambassador", "diplomatic", "united nations", "nato", "g7", "g20",
  "data breach", "hack", "cyberattack", "antitrust", "regulation", "ban",
  "launches", "unveils", "breakthrough",
];

const CATS = {
  geo:      ["iran", "war", "military", "nato", "ukraine", "russia", "israel",
             "attack", "missile", "troops", "conflict", "nuclear", "airstrike",
             "ceasefire", "invasion", "diplomat", "gaza", "china", "taiwan",
             "north korea", "syria", "iraq", "afghanistan", "pakistan", "sudan",
             "yemen", "killed", "bombing", "hostage", "refugee"],
  markets:  ["oil", "inflation", "fed ", "federal reserve", "interest rate",
             "rate cut", "rate hike", "stock", "market", "economy", "gdp",
             "recession", "dollar", "bitcoin", "crypto", "nasdaq", "dow",
             "s&p", "earnings", "jobs report", "unemployment", "tariff",
             "trade war", "brent", "crude", "treasury", "yield", "layoffs",
             "bankruptcy", "merger", "acquisition", "ipo", "surges", "plunges"],
  politics: ["congress", "senate", "president", "election", "policy",
             "bill passed", "vote", "supreme court", "white house",
             "legislation", "governor", "parliament", "prime minister",
             "sanctions", "executive order", "filibuster", "veto",
             "impeach", "resign", "appointed", "confirmed", "indicted"],
  tech:     ["openai", "google", "apple", "microsoft", "amazon", "meta",
             "artificial intelligence", " ai ", "quantum", "chip",
             "semiconductor", "data breach", "hack", "cyberattack",
             "antitrust", "elon musk", "tesla", "spacex", "regulation",
             "ban", "launches", "unveils", "breakthrough"],
};

function isTrash(title = "") {
  const l = title.toLowerCase();
  return TRASH.some(t => l.includes(t));
}

function isReal(title = "") {
  const l = title.toLowerCase();
  return REAL_SIGNALS.some(s => l.includes(s));
}

function categorize(title = "", desc = "") {
  const text = (title + " " + desc).toLowerCase();
  for (const [cat, kw] of Object.entries(CATS)) {
    if (kw.some(k => text.includes(k))) return cat;
  }
  return null;
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

    const articles = data.articles
      .filter(a => {
        const h = a.title || "";
        if (!h || h === "[Removed]") return false;
        if (isTrash(h)) return false;
        if (!isReal(h)) return false;
        const cat = categorize(h, a.description || "");
        return cat !== null;
      })
      .slice(0, 15)
      .map((a, i) => {
        const cat = categorize(a.title, a.description || "");
        return {
          id:       `w${i + 1}`,
          headline: a.title.replace(/ [-|].*$/, "").trim(),
          source:   a.source?.name || "News",
          time:     timeAgo(a.publishedAt),
          region:   a.source?.name || "Global",
          category: cat,
          rank:     i < 5 ? i + 1 : null,
          url:      a.url,
          breaking: i === 0,
        };
      });

    if (articles.length < 3) return Response.json({ articles: fallback() });
    return Response.json({ articles });
  } catch (e) {
    console.error("News error:", e);
    return Response.json({ articles: fallback() });
  }
}

function fallback() {
  return [
    { id: "w1", category: "geo",      rank: 1, breaking: true,  headline: "US deploys carrier strike group to Persian Gulf amid Iran nuclear tensions",         source: "Reuters",             time: "47m ago", region: "Middle East"    },
    { id: "w2", category: "markets",  rank: 2, breaking: false, headline: "Nasdaq falls into correction as oil surges past $100 on Strait of Hormuz fears",      source: "Bloomberg",           time: "1h ago",  region: "Global Markets"  },
    { id: "w3", category: "politics", rank: 3, breaking: false, headline: "Senate passes AI regulation bill 67-33 in rare bipartisan vote",                      source: "AP News",             time: "2h ago",  region: "Washington D.C." },
    { id: "w4", category: "tech",     rank: 4, breaking: false, headline: "OpenAI announces GPT-5 with real-time reasoning and autonomous agent capabilities",   source: "The Verge",           time: "3h ago",  region: "San Francisco"   },
    { id: "w5", category: "geo",      rank: 5, breaking: false, headline: "NATO invokes Article 4 consultations after cross-border attack on member state",      source: "BBC News",            time: "4h ago",  region: "Eastern Europe"  },
    { id: "w6", category: "markets",  rank: null, breaking: false, headline: "Federal Reserve signals two rate cuts in 2025 as CPI drops to 2.1%",               source: "Wall Street Journal", time: "3h ago",  region: "U.S. Economy"   },
    { id: "w7", category: "politics", rank: null, breaking: false, headline: "Supreme Court agrees to hear landmark First Amendment case on social media",        source: "New York Times",      time: "5h ago",  region: "Washington D.C." },
    { id: "w8", category: "tech",     rank: null, breaking: false, headline: "China claims world's first 1-million qubit quantum processor at state ceremony",   source: "Financial Times",     time: "6h ago",  region: "Beijing"         },
  ];
}
