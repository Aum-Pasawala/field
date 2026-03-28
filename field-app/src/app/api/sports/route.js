// src/app/api/sports/route.js
// Fetches live scores from ESPN's public (unofficial) API.
// No API key required — ESPN's scoreboard endpoints are publicly accessible.

const ESPN_ENDPOINTS = {
  nba: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  nfl: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
  mlb: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
  nhl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",
  soccer: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
  college: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard",
};

const ESPN_NEWS = {
  nba: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news",
  nfl: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/news",
  mlb: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news",
  nhl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news",
  soccer: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news",
  college: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league") || "nba";
  const type = searchParams.get("type") || "scores"; // scores | news

  try {
    if (type === "news") {
      return await fetchNews(league);
    }
    return await fetchScores(league);
  } catch (err) {
    console.error("Sports API error:", err);
    return Response.json({ games: [], news: [] });
  }
}

async function fetchScores(league) {
  const url = ESPN_ENDPOINTS[league];
  if (!url) return Response.json({ games: [] });

  const res = await fetch(url, { next: { revalidate: 30 } }); // cache 30s for live scores
  const data = await res.json();

  const events = data.events || [];
  const games = events.map(event => {
    const comp = event.competitions?.[0];
    const competitors = comp?.competitors || [];
    const away = competitors.find(c => c.homeAway === "away");
    const home = competitors.find(c => c.homeAway === "home");
    const status = event.status?.type;
    const situation = comp?.situation;

    let gameStatus = "upcoming";
    if (status?.completed) gameStatus = "final";
    else if (status?.state === "in") gameStatus = "live";

    const awayScore = parseInt(away?.score || "0");
    const homeScore = parseInt(home?.score || "0");
    let winner = null;
    if (gameStatus === "final") {
      winner = awayScore > homeScore ? away?.team?.abbreviation : home?.team?.abbreviation;
    }

    const odds = comp?.odds?.[0];
    const spread = odds?.details || null;
    const tv = comp?.broadcasts?.[0]?.names?.[0] || null;
    const period = status?.type?.shortDetail || null;
    const time = event.date ? new Date(event.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;

    return {
      id: event.id,
      status: gameStatus,
      awayTeam: away?.team?.abbreviation || "TBD",
      homeTeam: home?.team?.abbreviation || "TBD",
      awayScore: gameStatus !== "upcoming" ? awayScore : null,
      homeScore: gameStatus !== "upcoming" ? homeScore : null,
      winner,
      period,
      time,
      spread,
      tv,
    };
  });

  return Response.json({ games });
}

async function fetchNews(league) {
  const url = ESPN_NEWS[league];
  if (!url) return Response.json({ news: [] });

  const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
  const data = await res.json();

  const articles = (data.articles || []).slice(0, 8).map((a, i) => {
    const headline = a.headline || a.title || "";
    const type = guessType(headline);
    return {
      id: `${league}-${i}`,
      league,
      type,
      headline,
      source: a.byline || "ESPN",
      time: timeAgo(a.published),
      team: a.categories?.find(c => c.type === "team")?.description || "",
      rank: i < 5 ? i + 1 : null,
    };
  });

  return Response.json({ news: articles });
}

function guessType(headline = "") {
  const h = headline.toLowerCase();
  if (h.includes("trade") || h.includes("traded")) return "trade";
  if (h.includes("injur") || h.includes("ruled out") || h.includes("out for")) return "injury";
  if (h.includes("sign") || h.includes("contract") || h.includes("extension") || h.includes("deal")) return "signing";
  if (h.includes("transfer") || h.includes("portal")) return "roster";
  return "storyline";
}

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const diff = (Date.now() - new Date(dateStr)) / 1000 / 60;
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}
