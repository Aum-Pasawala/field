// Fetches live scores and news from ESPN's public API (no key needed)

const ESPN = {
  nba:     { sport: "basketball", league: "nba" },
  nfl:     { sport: "football",   league: "nfl" },
  mlb:     { sport: "baseball",   league: "mlb" },
  nhl:     { sport: "hockey",     league: "nhl" },
  soccer:  { sport: "soccer",     league: "eng.1" },
  college: { sport: "basketball", league: "mens-college-basketball" },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league") || "nba";
  const type   = searchParams.get("type")   || "scores";
  const cfg    = ESPN[league];
  if (!cfg) return Response.json({ games: [], news: [] });

  try {
    if (type === "news") return await getNews(cfg, league);
    return await getScores(cfg);
  } catch (e) {
    console.error("ESPN error", e);
    return Response.json({ games: [], news: [] });
  }
}

async function getScores(cfg) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/scoreboard`;
  const res  = await fetch(url, { next: { revalidate: 30 } });
  const data = await res.json();

  const games = (data.events || []).map(ev => {
    const comp        = ev.competitions?.[0];
    const competitors = comp?.competitors || [];
    const away        = competitors.find(c => c.homeAway === "away");
    const home        = competitors.find(c => c.homeAway === "home");
    const st          = ev.status?.type;

    let status = "upcoming";
    if (st?.completed)        status = "final";
    else if (st?.state === "in") status = "live";

    const awayScore = parseInt(away?.score ?? "0");
    const homeScore = parseInt(home?.score ?? "0");
    let winner = null;
    if (status === "final") winner = awayScore > homeScore ? away?.team?.abbreviation : home?.team?.abbreviation;

    return {
      id:        ev.id,
      status,
      awayTeam:  away?.team?.abbreviation  || "TBD",
      homeTeam:  home?.team?.abbreviation  || "TBD",
      awayRecord: away?.records?.[0]?.summary || "",
      homeRecord: home?.records?.[0]?.summary || "",
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
  const url  = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/news`;
  const res  = await fetch(url, { next: { revalidate: 180 } });
  const data = await res.json();

  const SKIP = ["analysis", "opinion", "column", "editorial", "ranking", "power rank", "fantasy", "grade", "best", "worst", "should", "must", "why", "10 things", "what we learned"];

  const news = (data.articles || [])
    .filter(a => {
      const h = (a.headline || "").toLowerCase();
      return !SKIP.some(s => h.includes(s));
    })
    .slice(0, 10)
    .map((a, i) => ({
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

function guessType(h = "") {
  const l = h.toLowerCase();
  if (l.includes("trade") || l.includes("traded"))       return "trade";
  if (l.includes("injur") || l.includes("ruled out") || l.includes("out for") || l.includes("placed on")) return "injury";
  if (l.includes("sign") || l.includes("contract") || l.includes("extension") || l.includes("deal") || l.includes("agrees")) return "signing";
  if (l.includes("transfer") || l.includes("portal"))   return "roster";
  if (l.includes("suspend") || l.includes("fine") || l.includes("arrest")) return "news";
  return "storyline";
}

function timeAgo(d) {
  if (!d) return "Recently";
  const m = (Date.now() - new Date(d)) / 60000;
  if (m < 60)   return `${Math.floor(m)}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}
