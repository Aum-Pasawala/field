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
  "stephen a", "skip bayless", "shannon sharpe", "first take", "get up",
  "sportscenter", "pardon the interruption", "pti ", "around the horn",
  "hoop collective", "pat mcafee", "undisputed",
  "opinion", "column", "editorial", "commentary", "perspective", "debate",
  "fantasy", "betting", "picks", "dfs", "best bets", "parlay", "prop bet",
  "waiver wire", "start or sit", "must-start", "sleeper", "streaming",
  "podcast", "episode", "listen:", "watch:", "video:", "espn+", "subscribe",
  "tracker:", "tracker —", "free agency tracker", "offseason tracker",
  "10 things", "5 things", "things to know", "things we learned",
  "everything you need", "what we learned", "takeaways", "mailbag",
  "power rankings", "ranking the", "ranked:", "ranking every",
  "grades:", "grading", "report card", "rating every",
  "bold predictions", "predictions:", "winners and losers",
  "the case for", "the case against", "should the", "why the",
  "could the", "would the", "what if",
  "recap:", "review:", "preview:", "game preview", "series preview",
  "deep dive", "breaking down", "inside look", "behind the scenes",
  "taylor swift", "travis kelce girlfriend", "celebrity", "iheartradio",
  "music awards", "oscars", "grammy", "reality tv", "kardashian",
  "highlights", "highlight:", "watch:", "best plays", "top plays",
  "game highlights", "best moments", "video:", "key plays",
  "need to know", "must-watch", "read:", "buy or sell",
  "over/under", "future stars", "mock draft",
  "tracker", "offseason moves", "latest news and updates",
  "everything to know", "what you need", "full list",
];

const REAL = [
  "traded", " trade ", "signs ", "signed ", "re-signs", "re-signed",
  "contract", "extension", "deal worth", "year deal", "million deal",
  "released", "waived", "cut by", "claimed off",
  "injured", "injury", "out for", "ruled out", "placed on il",
  "placed on ir", "day-to-day", "doubtful", "questionable",
  "surgery", "torn ", "fracture", "concussion protocol",
  "suspended", "suspension", "fined", "arrested", "charged",
  "banned", "ejected", "disqualified",
  "named mvp", "wins mvp", "all-star", "hall of fame", "record",
  "first player ever", "all-time", "franchise record",
  "hired as", "fired", "named head coach", "named gm",
  "steps down", "resigns as coach",
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
  const gameId = searchParams.get("gameId") || null;
  const cfg    = ESPN[league];
  if (!cfg) return Response.json({ games: [], news: [] });
  try {
    if (type === "news") return getNews(cfg, league);
    if (type === "detail" && gameId) return getGameDetail(cfg, gameId);
    return getScores(cfg);
  } catch (e) {
    console.error("ESPN error", e);
    return Response.json({ games: [], news: [] });
  }
}

function extractPerformers(comp, leaders) {
  if (leaders?.length) {
    const perfs = leaders.flatMap(cat => {
      return (cat.leaders || []).slice(0, 2).map(l => ({
        name: l.athlete?.shortName || l.athlete?.displayName || "",
        stat: cat.shortDisplayName || cat.displayName || "",
        value: l.displayValue || "",
        team: l.athlete?.team?.abbreviation || "",
      }));
    }).filter(p => p.name && p.value);
    if (perfs.length >= 2) return perfs.slice(0, 5);
  }
  const allLeaders = [];
  (comp?.competitors || []).forEach(team => {
    (team.leaders || []).forEach(cat => {
      const l = cat.leaders?.[0];
      if (l?.athlete) {
        allLeaders.push({
          name: l.athlete.shortName || l.athlete.displayName || "",
          stat: cat.shortDisplayName || cat.displayName || "",
          value: l.displayValue || "",
          team: team.team?.abbreviation || "",
        });
      }
    });
  });
  return allLeaders.filter(p => p.name && p.value).slice(0, 5);
}

async function getScores(cfg) {
  const url  = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/scoreboard`;
  const res  = await fetch(url, { next: { revalidate: 30 } });
  const data = await res.json();
  const events = data.events || [];

  const summaryPromises = events.map(async ev => {
    const st = ev.status?.type;
    const hasScore = st?.completed || st?.state === "in";
    if (!hasScore) return null;
    try {
      const sUrl = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/summary?event=${ev.id}`;
      const sr = await fetch(sUrl, { next: { revalidate: 30 } });
      return await sr.json();
    } catch { return null; }
  });

  const summaries = await Promise.all(summaryPromises);

  const games = events.map((ev, idx) => {
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

    let topPerformers = [];
    const summary = summaries[idx];
    if (summary?.boxscore?.players) {
      const allPlayers = [];
      summary.boxscore.players.forEach(teamData => {
        const teamAbbr = teamData.team?.abbreviation || "";
        (teamData.statistics || []).forEach(statGroup => {
          const labels = statGroup.labels || [];
          const mainStatIdx = labels.findIndex(l =>
            ["PTS","YDS","G","A","SVS","HR","RBI","AVG","SOG"].includes(l)
          );
          (statGroup.athletes || []).forEach(athlete => {
            const stats = athlete.stats || [];
            const mainVal = mainStatIdx >= 0 ? stats[mainStatIdx] : stats[0];
            if (mainVal && mainVal !== "0" && mainVal !== "--" && athlete.athlete) {
              allPlayers.push({
                name: athlete.athlete.shortName || athlete.athlete.displayName || "",
                stat: mainStatIdx >= 0 ? labels[mainStatIdx] : (labels[0] || ""),
                value: mainVal,
                team: teamAbbr,
                numVal: parseFloat(mainVal) || 0,
              });
            }
          });
        });
      });
      topPerformers = allPlayers
        .sort((a, b) => b.numVal - a.numVal)
        .slice(0, 5)
        .map(({ name, stat, value, team }) => ({ name, stat, value, team }));
    }

    if (!topPerformers.length) {
      topPerformers = extractPerformers(comp, comp?.leaders);
    }

    return {
      id: ev.id, status,
      awayTeam: away?.team?.abbreviation || "TBD",
      awayLogo: away?.team?.logo || null,
      awayColor: away?.team?.color ? `#${away.team.color}` : null,
      homeTeam: home?.team?.abbreviation || "TBD",
      homeLogo: home?.team?.logo || null,
      homeColor: home?.team?.color ? `#${home.team.color}` : null,
      awayScore: status !== "upcoming" ? aS : null,
      homeScore: status !== "upcoming" ? hS : null,
      winner: status === "final" ? (aS > hS ? away?.team?.abbreviation : home?.team?.abbreviation) : null,
      period: st?.shortDetail || null,
      time: ev.date ? new Date(ev.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null,
      spread: comp?.odds?.[0]?.details || null,
      tv: comp?.broadcasts?.[0]?.names?.[0] || null,
      topPerformers,
    };
  });

  return Response.json({ games });
}

async function getGameDetail(cfg, gameId) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/summary?event=${gameId}`;
  const res  = await fetch(url, { next: { revalidate: 30 } });
  const data = await res.json();
  const boxscore = data.boxscore || {};
  const teams = boxscore.teams || [];

  const teamStats = teams.map(t => ({
    team: t.team?.abbreviation || "",
    logo: t.team?.logo || null,
    stats: (t.statistics || []).slice(0, 8).map(s => ({
      name: s.label || s.name || "",
      value: s.displayValue || s.value || "",
    })),
  }));

  const playerStats = teams.map(t => ({
    team: t.team?.abbreviation || "",
    players: (t.athletes || []).slice(0, 5).map(p => ({
      name: p.athlete?.shortName || p.athlete?.displayName || "",
      position: p.athlete?.position?.abbreviation || "",
      stats: (p.statistics || []).slice(0, 4).map((s, i) => ({
        name: (boxscore.players?.[0]?.statistics?.[0]?.labels || [])[i] || "",
        value: s || "",
      })),
    })).filter(p => p.name),
  }));

  return Response.json({ teamStats, playerStats });
}

async function getNews(cfg, leagueId) {
  const url  = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/news?limit=80`;
  const res  = await fetch(url, { next: { revalidate: 120 } });
  const data = await res.json();

  const notTrash = (data.articles || []).filter(a => {
    const h = a.headline || a.title || "";
    return h.length > 10 && !isTrash(h);
  });

  const real  = notTrash.filter(a => isReal(a.headline || a.title || ""));
  const other = notTrash.filter(a => !isReal(a.headline || a.title || ""));

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
