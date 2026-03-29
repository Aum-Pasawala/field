// ESPN sports data — scores, play-by-play, box scores

const ESPN = {
  nba:     { sport: "basketball", league: "nba" },
  nfl:     { sport: "football",   league: "nfl" },
  mlb:     { sport: "baseball",   league: "mlb" },
  nhl:     { sport: "hockey",     league: "nhl" },
  soccer:  { sport: "soccer",     league: "eng.1" },
  college: { sport: "basketball", league: "mens-college-basketball" },
};

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

function isTrash(h = "") { const l = h.toLowerCase(); return TRASH.some(t => l.includes(t)); }
function isReal(h = "") { const l = h.toLowerCase(); return REAL.some(r => l.includes(r)); }

function guessType(h = "") {
  const l = h.toLowerCase();
  if (l.includes("trade") || l.includes("traded")) return "trade";
  if (l.includes("injur") || l.includes("ruled out") || l.includes("out for") || l.includes("surgery") || l.includes("torn")) return "injury";
  if (l.includes("sign") || l.includes("contract") || l.includes("extension") || l.includes("deal")) return "signing";
  if (l.includes("waived") || l.includes("released") || l.includes("cut by") || l.includes("claimed")) return "roster";
  if (l.includes("suspend") || l.includes("fine") || l.includes("arrest") || l.includes("banned")) return "news";
  if (l.includes("mvp") || l.includes("award") || l.includes("hall of fame") || l.includes("record")) return "award";
  if (l.includes("fired") || l.includes("hired") || l.includes("coach")) return "news";
  return "storyline";
}

function timeAgo(d) {
  if (!d) return "Recently";
  const m = (Date.now() - new Date(d)) / 60000;
  if (m < 60) return `${Math.floor(m)}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league") || "nba";
  const type   = searchParams.get("type")   || "scores";
  const gameId = searchParams.get("gameId") || null;
  const date   = searchParams.get("date")   || null; // YYYYMMDD format
  const cfg    = ESPN[league];
  if (!cfg) return Response.json({ games: [], news: [] });
  try {
    if (type === "news") return getNews(cfg, league);
    if (type === "detail" && gameId) return getGameDetail(cfg, gameId);
    return getScores(cfg, date);
  } catch (e) {
    console.error("ESPN error", e);
    return Response.json({ games: [], news: [] });
  }
}

function extractPerformers(comp, leaders) {
  if (leaders?.length) {
    const perfs = leaders.flatMap(cat =>
      (cat.leaders || []).slice(0, 2).map(l => ({
        name: l.athlete?.shortName || l.athlete?.displayName || "",
        stat: cat.shortDisplayName || cat.displayName || "",
        value: l.displayValue || "",
        team: l.athlete?.team?.abbreviation || "",
      }))
    ).filter(p => p.name && p.value);
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

async function getScores(cfg, date) {
  let url = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/scoreboard`;
  if (date) url += `?dates=${date}`;
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
          const mainStatIdx = labels.findIndex(l => ["PTS","YDS","G","A","SVS","HR","RBI","AVG","SOG"].includes(l));
          (statGroup.athletes || []).forEach(athlete => {
            const stats = athlete.stats || [];
            const mainVal = mainStatIdx >= 0 ? stats[mainStatIdx] : stats[0];
            if (mainVal && mainVal !== "0" && mainVal !== "--" && athlete.athlete) {
              allPlayers.push({
                name: athlete.athlete.shortName || athlete.athlete.displayName || "",
                stat: mainStatIdx >= 0 ? labels[mainStatIdx] : (labels[0] || ""),
                value: mainVal, team: teamAbbr,
                numVal: parseFloat(mainVal) || 0,
              });
            }
          });
        });
      });
      topPerformers = allPlayers.sort((a, b) => b.numVal - a.numVal).slice(0, 5).map(({ name, stat, value, team }) => ({ name, stat, value, team }));
    }
    if (!topPerformers.length) topPerformers = extractPerformers(comp, comp?.leaders);

    return {
      id: ev.id, status,
      awayTeam: away?.team?.abbreviation || "TBD",
      awayName: away?.team?.shortDisplayName || away?.team?.displayName || "TBD",
      awayLogo: away?.team?.logo || null,
      awayColor: away?.team?.color ? `#${away.team.color}` : null,
      homeTeam: home?.team?.abbreviation || "TBD",
      homeName: home?.team?.shortDisplayName || home?.team?.displayName || "TBD",
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

// Full game detail with play-by-play + box scores + player headshots
async function getGameDetail(cfg, gameId) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/summary?event=${gameId}`;
  const res = await fetch(url, { next: { revalidate: 15 } });
  const data = await res.json();

  // ── Team info ──
  const comp = data.header?.competitions?.[0] || {};
  const competitors = comp.competitors || [];
  const teams = competitors.map(c => ({
    id: c.id,
    abbr: c.team?.abbreviation || "",
    name: c.team?.displayName || c.team?.shortDisplayName || "",
    logo: c.team?.logos?.[0]?.href || c.team?.logo || "",
    color: c.team?.color ? "#" + c.team.color : "#888",
    score: c.score || "0",
    homeAway: c.homeAway,
    record: c.record?.[0]?.displayValue || "",
  }));
  const awayTeam = teams.find(t => t.homeAway === "away") || teams[0] || {};
  const homeTeam = teams.find(t => t.homeAway === "home") || teams[1] || {};

  const statusDetail = comp.status?.type?.shortDetail || data.header?.gameNote || "";
  const statusState = comp.status?.type?.state || "pre";

  // ── Build player lookup from boxscore (for headshots in play-by-play) ──
  const boxPlayers = data.boxscore?.players || [];
  const playerLookup = {};
  boxPlayers.forEach(teamData => {
    (teamData.statistics || []).forEach(group => {
      (group.athletes || []).forEach(a => {
        const athlete = a.athlete || {};
        if (!athlete.displayName && !athlete.shortName) return;
        const athleteId = athlete.id || "";
        const entry = {
          name: athlete.shortName || athlete.displayName || "",
          fullName: athlete.displayName || athlete.shortName || "",
          headshot: athlete.headshot?.href || athlete.headshot ||
            (athleteId ? `https://a.espn.com/combiner/i?img=/i/headshots/${cfg.sport}/players/full/${athleteId}.png&w=96&h=70&cb=1` : ""),
          jersey: athlete.jersey || "",
          position: athlete.position?.abbreviation || "",
          team: teamData.team?.abbreviation || "",
        };
        // Index by multiple name variants for matching
        if (athlete.shortName) playerLookup[athlete.shortName.toLowerCase()] = entry;
        if (athlete.displayName) playerLookup[athlete.displayName.toLowerCase()] = entry;
        // Also index by last name for partial matching
        const lastName = (athlete.displayName || "").split(" ").pop();
        if (lastName && lastName.length > 2) playerLookup[lastName.toLowerCase()] = entry;
      });
    });
  });

  // Helper: find player in text using lookup
  function findPlayerInText(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    // Try full short names first (most specific)
    for (const [key, val] of Object.entries(playerLookup)) {
      if (key.includes(" ") && lower.includes(key)) return val;
    }
    // Then try last names
    for (const [key, val] of Object.entries(playerLookup)) {
      if (!key.includes(" ") && key.length > 2 && lower.includes(key)) return val;
    }
    return null;
  }

  // ── Play-by-play ──
  const rawPlays = data.plays || [];
  const plays = rawPlays.slice(-80).reverse().map(p => {
    const isHome = p.team?.id === homeTeam.id;
    const teamAbbr = isHome ? homeTeam.abbr : (p.team?.id ? awayTeam.abbr : "");
    const teamColor = isHome ? homeTeam.color : awayTeam.color;
    const teamLogo = isHome ? homeTeam.logo : awayTeam.logo;

    // Extract participants (players involved in the play)
    let participants = (p.participants || []).map(part => {
      const athlete = part.athlete || {};
      const athleteId = athlete.id || "";
      return {
        name: athlete.shortName || athlete.displayName || "",
        headshot: athlete.headshot?.href || athlete.headshot ||
          (athleteId ? `https://a.espn.com/combiner/i?img=/i/headshots/${cfg.sport}/players/full/${athleteId}.png&w=96&h=70&cb=1` : ""),
        jersey: athlete.jersey || "",
        position: athlete.position?.abbreviation || "",
      };
    }).filter(p => p.name);

    // Fallback: if no participants from the API, try to find the player from play text
    if (participants.length === 0) {
      const found = findPlayerInText(p.text || p.shortText || "");
      if (found) {
        participants = [found];
      }
    }

    // Ensure headshots are filled from lookup even if API gave name but no photo
    participants = participants.map(part => {
      if (part.headshot) return part;
      const looked = playerLookup[part.name.toLowerCase()];
      if (looked?.headshot) return { ...part, headshot: looked.headshot };
      return part;
    });

    // Determine play type for visual treatment
    const typeText = (p.type?.text || "").toLowerCase();
    let playCategory = "other";
    if (p.scoringPlay) playCategory = "scoring";
    else if (typeText.includes("rebound")) playCategory = "rebound";
    else if (typeText.includes("turnover") || typeText.includes("steal")) playCategory = "turnover";
    else if (typeText.includes("foul")) playCategory = "foul";
    else if (typeText.includes("timeout")) playCategory = "timeout";
    else if (typeText.includes("substitution")) playCategory = "sub";
    else if (typeText.includes("end") || typeText.includes("start")) playCategory = "period";

    return {
      id: p.id || Math.random().toString(36),
      text: p.text || "",
      shortText: p.shortText || p.text || "",
      awayScore: p.awayScore ?? null,
      homeScore: p.homeScore ?? null,
      period: p.period?.number || null,
      periodText: p.period?.displayValue || "",
      clock: p.clock?.displayValue || "",
      teamAbbr,
      teamColor,
      teamLogo,
      isHome,
      scoringPlay: p.scoringPlay || false,
      scoreValue: p.scoreValue || 0,
      type: p.type?.text || "",
      playCategory,
      participants,
    };
  });

  // ── Team stats ──
  const boxTeams = data.boxscore?.teams || [];
  const teamStats = boxTeams.map(t => ({
    abbr: t.team?.abbreviation || "",
    logo: t.team?.logo || "",
    stats: (t.statistics || []).map(s => ({
      label: s.label || s.name || "",
      abbr: s.abbreviation || s.label || "",
      value: s.displayValue || String(s.value || ""),
    })),
  }));

  // ── Player box scores with headshots (reuse boxPlayers from above) ──
  const rosterData = boxPlayers.map(teamData => {
    const teamAbbr = teamData.team?.abbreviation || "";
    const teamLogo = teamData.team?.logo || "";

    const statGroups = teamData.statistics || [];
    // Get labels from first stat group
    const labels = statGroups[0]?.labels || [];

    const players = statGroups.flatMap(group =>
      (group.athletes || []).map(a => {
        const athlete = a.athlete || {};
        const athleteId = athlete.id || "";
        const headshot = athlete.headshot?.href || athlete.headshot ||
          (athleteId ? `https://a.espn.com/combiner/i?img=/i/headshots/${cfg.sport}/players/full/${athleteId}.png&w=96&h=70&cb=1` : "");

        return {
          id: athleteId,
          name: athlete.shortName || athlete.displayName || "",
          position: athlete.position?.abbreviation || "",
          jersey: athlete.jersey || "",
          headshot,
          starter: a.starter || false,
          stats: (a.stats || []).map((val, idx) => ({
            label: labels[idx] || "",
            value: val || "",
          })),
          // Pull out key stats for quick display
          min: a.stats?.[labels.indexOf("MIN")] || a.stats?.[0] || "",
          pts: a.stats?.[labels.indexOf("PTS")] || "",
          reb: a.stats?.[labels.indexOf("REB")] || "",
          ast: a.stats?.[labels.indexOf("AST")] || "",
          didNotPlay: a.didNotPlay || false,
          reason: a.reason || "",
        };
      })
    ).filter(p => p.name);

    return { abbr: teamAbbr, logo: teamLogo, labels, players };
  });

  return Response.json({
    awayTeam, homeTeam,
    statusDetail, statusState,
    plays,
    teamStats,
    rosters: rosterData,
  });
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
  const combined = real.length >= 5 ? real.slice(0, 10) : [...real, ...other].slice(0, Math.max(real.length, 5));

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
