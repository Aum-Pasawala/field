// ESPN sports data - scores + strictly factual news only

const ESPN = {
  nba:     { sport: "basketball", league: "nba" },
  nfl:     { sport: "football",   league: "nfl" },
  mlb:     { sport: "baseball",   league: "mlb" },
  nhl:     { sport: "hockey",     league: "nhl" },
  soccer:  { sport: "soccer",     league: "eng.1" },
  college: { sport: "basketball", league: "mens-college-basketball" },
};

// These headline patterns = garbage. Filter them ALL out.
const TRASH_FILTERS = [
  "fantasy", "betting", "picks", "dfs", "best bets", "parlay", "prop bet",
  "podcast", "episode", "hoop collective", "get up", "first take", "sportscenter",
  "stephen a", "stephen a.", "skip bayless", "shannon sharpe", "opinion",
  "column", "editorial", "commentary", "analysis:", "mailbag", "power rankings",
  "ranking the", "ranked:", "grading", "grades:", "report card",
  "why ", "should ", "could ", "would ", "what if", "10 things", "5 things",
  "everything you need", "what we learned", "winners and losers", "winners &",
  "takeaways", "recap:", "review:", "preview:", "bold predictions",
  "must-watch", "need to know", "breaking down", "deep dive", "the case for",
  "watch:", "listen:", "read:", "video:", "highlight:", "espn+",
];

// These patterns = REAL news we want
const REAL_NEWS_SIGNALS = [
  "traded", "trade", "signs", "signed", "signing", "contract", "extension",
  "injured", "injury", "out for", "ruled out", "placed on", "il ", "ir ",
  "suspended", "suspension", "fined", "arrested", "released", "waived", "cut",
  "fired", "hired", "named", "appointed", "wins", "award", "mvp", "record",
  "retires", "retirement", "drafted", "selected", "transferred", "deal",
  "agreement", "announces", "returns from", "undergoes surgery",
];

function isTrash(headline = "") {
  const h = headline.toLowerCase();
  return TRASH_FILTERS.some(f => h.includes(f));
}

function isRealNews(headline = "") {
  const h = headline.toLowerCase();
  return REAL_NEWS_SIGNALS.some(s => h.includes(s));
}

function guessType(h = "") {
  const l = h.toLowerCase();
  if (l.includes("trade") || l.includes("traded"))                                          return "trade";
  if (l.includes("injur") || l.includes("ruled out") || l.includes("out for") || l.includes("placed on") || l.includes(" il ") || l.includes(" ir ")) return "injury";
  if (l.includes("sign") || l.includes("contract") || l.includes("extension") || l.includes("deal") || l.includes("agrees")) return "signing";
  if (l.includes("transfer") || l.includes("portal") || l.includes("waived") || l.includes("released") || l.includes("cut ")) return "roster";
  if (l.includes("suspend") || l.includes("fine") || l.includes("arrest"))                  return "news";
  if (l.includes("award") || l.includes("mvp") || l.includes("record") || l.includes("retir")) return "award";
  return "storyline";
}

function timeAgo(d) {
  if (!d) return "Recently";
  const m = (Date.now() - new Date(d)) / 60000;
  if (m < 60)   return `${Math.floor(m)}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league") || "nba";
  const type   = searchParams.get("type")   || "scores";
  const cfg    = ESPN[league];
  if (!cfg) return Response.json({ games: [], news: [] });

  try {
    return type === "news" ? getNews(cfg, league) : getScores(cfg);
  } catch (e) {
    console.error("ESPN error", e);
    return Response.json({ games: [], news: [] });
  }
}

async function getScores(cfg) {
  const url  = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/scoreboard`;
  const res  = await fetch(url, { next: { revalidate: 30 } });
  const data = await res.json();

  const games = (data.events || []).map(ev => {
    const comp        = ev.competitions?.[0];
    const competitors = comp?.competitors || [];
    const away        = competitors.find(c => c.homeAway === "away");
    const home        = competitors.find(c => c.homeAway === "home");
    const st          = ev.status?.type;

    let status = "upcoming";
    if (st?.completed)           status = "final";
    else if (st?.state === "in") status = "live";

    const awayScore = parseInt(away?.score ?? "0");
    const homeScore = parseInt(home?.score ?? "0");
    let winner = null;
    if (status === "final") winner = awayScore > homeScore ? away?.team?.abbreviation : home?.team?.abbreviation;

    return {
      id:        ev.id,
      status,
      awayTeam:  away?.team?.abbreviation || "TBD",
      homeTeam:  home?.team?.abbreviation || "TBD",
      awayScore: status !== "upcoming" ? awayScore : null,
      homeScore: status !== "upcoming" ? homeScore : null,
      winner,
      period:    st?.shortDetail || null,
      time:      ev.date ? new Date(ev.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null,
      spread:    comp?.odds?.[0]?.details || null,
      tv:        comp?.broadcasts?.[0]?.names?.[0] || null,
    };
  });

  return Response.json({ games });
}

async function getNews(cfg, leagueId) {
  const url  = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/news?limit=50`;
  const res  = await fetch(url, { next: { revalidate: 120 } });
  const data = await res.json();

  // Step 1: throw out all trash
  const cleaned = (data.articles || []).filter(a => {
    const h = a.headline || a.title || "";
    return h.length > 10 && !isTrash(h);
  });

  // Step 2: prioritize real factual news (trades, injuries, signings, awards)
  const realNews  = cleaned.filter(a => isRealNews(a.headline || a.title || ""));
  const otherNews = cleaned.filter(a => !isRealNews(a.headline || a.title || ""));

  // Step 3: combine — real news first, pad with other if needed
  const combined = [...realNews, ...otherNews].slice(0, 10);

  const news = combined.map((a, i) => ({
    id:       `${leagueId}-${i}`,
    league:   leagueId,
    type:     guessType(a.headline || ""),
    headline: a.headline || a.title || "",
    source:   a.byline || "ESPN",
    time:     timeAgo(a.published),
    team:     a.categories?.find(c => c.type === "team")?.description || "",
    rank:     i < 5 ? i + 1 : null,
  }));

  return Response.json({ news });
}
