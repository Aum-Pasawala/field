// ESPN sports data — strict factual news only

const ESPN = {
  nba:     { sport: "basketball", league: "nba" },
  nfl:     { sport: "football",   league: "nfl" },
  mlb:     { sport: "baseball",   league: "mlb" },
  nhl:     { sport: "hockey",     league: "nhl" },
  soccer:  { sport: "soccer",     league: "eng.1" },
  college: { sport: "basketball", league: "mens-college-basketball" },
};

// ANYTHING matching these = instant discard
const TRASH = [
  // Opinion / analysis shows
  "stephen a", "skip bayless", "shannon sharpe", "first take", "get up",
  "sportscenter", "pardon the interruption", "pti ", "around the horn",
  "hoop collective", "pat mcafee", "undisputed",
  // Opinion content
  "opinion", "column", "editorial", "commentary", "perspective", "debate",
  // Fantasy / betting
  "fantasy", "betting", "picks", "dfs", "best bets", "parlay", "prop bet",
  "waiver wire", "start or sit", "must-start", "sleeper", "streaming",
  // Podcast / media
  "podcast", "episode", "listen:", "watch:", "video:", "espn+", "subscribe",
  // Listicles / trackers
  "tracker:", "tracker —", "free agency tracker", "offseason tracker",
  "10 things", "5 things", "things to know", "things we learned",
  "everything you need", "what we learned", "takeaways", "mailbag",
  // Rankings / grades
  "power rankings", "ranking the", "ranked:", "ranking every",
  "grades:", "grading", "report card", "rating every",
  // Predictions / speculation
  "bold predictions", "predictions:", "winners and losers",
  "the case for", "the case against", "should the", "why the",
  "could the", "would the", "what if",
  // Recaps / previews (subjective)
  "recap:", "review:", "preview:", "game preview", "series preview",
  "deep dive", "breaking down", "inside look", "behind the scenes",
  // Celebrity fluff
  "taylor swift", "travis kelce girlfriend", "celebrity", "iheartradio",
  "music awards", "oscars", "grammy", "reality tv", "kardashian",
  // Highlight / recap content
  "highlights", "highlight:", "watch:", "best plays", "top plays",
  "game highlights", "best moments", "video:", "key plays",
  // Other garbage
  "need to know", "must-watch", "read:", "buy or sell",
  "over/under", "future stars", "mock draft",
  // Tracker / aggregator articles (not real news)
  "tracker", "offseason moves", "latest news and updates",
  "everything to know", "what you need", "full list",
];

// ONLY these patterns indicate real factual sports news
const REAL = [
  // Roster moves
  "traded", " trade ", "signs ", "signed ", "re-signs", "re-signed",
  "contract", "extension", "deal worth", "year deal", "million deal",
  "released", "waived", "cut by", "claimed off",
  // Injuries
  "injured", "injury", "out for", "ruled out", "placed on il",
  "placed on ir", "day-to-day", "doubtful", "questionable",
  "surgery", "torn ", "fracture", "concussion protocol",
  // Discipline
  "suspended", "suspension", "fined", "arrested", "charged",
  "banned", "ejected", "disqualified",
  // Awards & records
  "named mvp", "wins mvp", "all-star", "hall of fame", "record",
  "first player ever", "all-time", "franchise record",
  // Coaching / front office
  "hired as", "fired", "named head coach", "named gm",
  "steps down", "resigns as coach",
  // Game results (factual)
  "defeats", "beats ", "wins series", "advances to", "eliminated",
  "clinches", "sweeps",
];

function isTrash(h = "") {
  const l = h.toLowerCase();
  return TRASH.some(t => l.includes(t));
}

function isReal(h = "") {
  const l = h.toLowerCase();
  return REAL.some(r => l.includes(r));
}

function guessType(h = "") {
  const l = h.toLowerCase();
  if (l.includes("trade") || l.includes("traded"))                                                      return "trade";
  if (l.includes("injur") || l.includes("ruled out") || l.includes("out for") || l.includes("surgery") || l.includes("torn")) return "injury";
  if (l.includes("sign") || l.includes("contract") || l.includes("extension") || l.includes("deal"))    return "signing";
  if (l.includes("waived") || l.includes("released") || l.includes("cut by") || l.includes("claimed"))  return "roster";
  if (l.includes("suspend") || l.includes("fine") || l.includes("arrest") || l.includes("banned"))      return "news";
  if (l.includes("mvp") || l.includes("award") || l.includes("hall of fame") || l.includes("record"))   return "award";
  if (l.includes("fired") || l.includes("hired") || l.includes("coach"))                                return "news";
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
    const comp = ev.competitions?.[0];
    const comps = comp?.competitors || [];
    const away = comps.find(c => c.homeAway === "away");
    const home = comps.find(c => c.homeAway === "home");
    const st = ev.status?.type;
    let status = "upcoming";
    if (st?.completed) status = "final";
    else if (st?.state === "in") status = "live";
    const aS = parseInt(away?.score ?? "0");
    const hS = parseInt(home?.score ?? "0");
    return {
      id: ev.id, status,
      awayTeam: away?.team?.abbreviation || "TBD",
      homeTeam: home?.team?.abbreviation || "TBD",
      awayScore: status !== "upcoming" ? aS : null,
      homeScore: status !== "upcoming" ? hS : null,
      winner: status === "final" ? (aS > hS ? away?.team?.abbreviation : home?.team?.abbreviation) : null,
      period: st?.shortDetail || null,
      time: ev.date ? new Date(ev.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null,
      spread: comp?.odds?.[0]?.details || null,
      tv: comp?.broadcasts?.[0]?.names?.[0] || null,
    };
  });
  return Response.json({ games });
}

async function getNews(cfg, leagueId) {
  const url  = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/news?limit=80`;
  const res  = await fetch(url, { next: { revalidate: 120 } });
  const data = await res.json();

  // Step 1: hard trash filter
  const notTrash = (data.articles || []).filter(a => {
    const h = a.headline || a.title || "";
    return h.length > 10 && !isTrash(h);
  });

  // Step 2: prefer real factual news, ONLY show other if not enough real
  const real  = notTrash.filter(a => isReal(a.headline || a.title || ""));
  const other = notTrash.filter(a => !isReal(a.headline || a.title || ""));

  // Always fill with real news first — if fewer than 5, pad with least-bad other
  const combined = real.length >= 5
    ? real.slice(0, 10)
    : [...real, ...other].slice(0, Math.max(real.length, 5));

  return Response.json({
    news: combined.map((a, i) => ({
      id:       `${leagueId}-${i}`,
      league:   leagueId,
      type:     guessType(a.headline || ""),
      headline: a.headline || a.title || "",
      source:   a.byline || "ESPN",
      time:     timeAgo(a.published),
      team:     a.categories?.find(c => c.type === "team")?.description || "",
      rank:     i < 5 ? i + 1 : null,
    })),
  });
}
