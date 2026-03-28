"use client";
import { useState, useEffect, useCallback } from "react";

// ── Design tokens ─────────────────────────────────────────────
const D = {
  bg: "#0C0C0E", surface: "#141416", card: "#1A1A1E", cardHover: "#1F1F24",
  border: "#2A2A30", borderLight: "#333340",
  text: "#F0F0F0", textMid: "#9090A0", textDim: "#55555F",
  accent: "#7B61FF", green: "#2DC97A", red: "#E63946", orange: "#FF6B35", gold: "#FFD700",
};

// ── Static config ─────────────────────────────────────────────
const LEAGUES = [
  { id: "nba", name: "NBA", emoji: "🏀", color: "#C9082A" },
  { id: "nfl", name: "NFL", emoji: "🏈", color: "#4A90D9" },
  { id: "mlb", name: "MLB", emoji: "⚾", color: "#3A8A3A" },
  { id: "nhl", name: "NHL", emoji: "🏒", color: "#A8A8B8" },
  { id: "soccer", name: "Soccer", emoji: "⚽", color: "#2DC97A" },
  { id: "college", name: "College", emoji: "🎓", color: "#C97A2D" },
];

const NEWS_CATS = [
  { id: "geo", label: "Geopolitics", emoji: "🌍", color: "#E63946" },
  { id: "markets", label: "Economy", emoji: "📈", color: "#2DC97A" },
  { id: "politics", label: "Politics", emoji: "🏛️", color: "#4A90D9" },
  { id: "tech", label: "Tech & AI", emoji: "⚡", color: "#7B61FF" },
];

const NEWS_TYPES = {
  trade: { label: "Trade", color: "#FF6B35" },
  injury: { label: "Injury", color: "#E63946" },
  signing: { label: "Signing", color: "#2DC97A" },
  storyline: { label: "Storyline", color: "#7B61FF" },
  roster: { label: "Roster", color: "#F4A261" },
};

const RANK_CIRCLES = ["①", "②", "③", "④", "⑤"];
const BULLET_ICONS = ["📌", "⚠️", "🕰️", "📊"];
const BULLET_COLORS = [D.textMid, "#F4A261", D.textDim, D.green];

// ── Shared UI ─────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span style={{ padding: "3px 8px", borderRadius: 4, background: color + "20", color, fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", border: `1px solid ${color}35`, flexShrink: 0 }}>
      {label}
    </span>
  );
}

function StatusDot({ status }) {
  if (status === "live") return (
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: D.red, display: "inline-block", boxShadow: `0 0 6px ${D.red}` }} />
      <span style={{ fontSize: 10, color: D.red, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>LIVE</span>
    </span>
  );
  if (status === "final") return <span style={{ fontSize: 10, color: D.textDim, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>FINAL</span>;
  return <span style={{ fontSize: 10, color: D.green, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>UPCOMING</span>;
}

function SectionLabel({ label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={{ width: 3, height: 16, background: color || D.accent, borderRadius: 2 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: D.textMid, fontFamily: "system-ui, sans-serif", letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 20, background: active ? D.accent : D.surface, border: `1px solid ${active ? D.accent : D.border}`, color: active ? "#fff" : D.textMid, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap", transition: "all 0.15s" }}>
      {children}
    </button>
  );
}

// ── AI Bullets ────────────────────────────────────────────────
function AIBullets({ bullets, loading }) {
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0 4px", fontFamily: "system-ui, sans-serif", fontSize: 12, color: D.textDim }}>
      <div style={{ width: 12, height: 12, border: `2px solid ${D.border}`, borderTopColor: D.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
      Analyzing...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!bullets?.length) return null;
  return (
    <div style={{ borderTop: `1px solid ${D.border}`, marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: D.accent }} />
        <span style={{ fontSize: 9, color: D.accent, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>AI Analysis</span>
      </div>
      {bullets.map((b, i) => (
        <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{BULLET_ICONS[i] || "•"}</span>
          <span style={{ fontSize: 13, color: BULLET_COLORS[i] || D.textMid, lineHeight: 1.5, fontFamily: "system-ui, sans-serif" }}>{b}</span>
        </div>
      ))}
    </div>
  );
}

// ── Headline Card ─────────────────────────────────────────────
function HeadlineCard({ item, bullets, loading, isSports }) {
  const league = isSports ? LEAGUES.find(l => l.id === item.league) : null;
  const cat = !isSports ? NEWS_CATS.find(c => c.id === item.category) : null;
  const typeInfo = isSports ? (NEWS_TYPES[item.type] || { label: item.type, color: "#888" }) : null;

  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 10, padding: "18px 20px" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {item.rank && (
          <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: item.rank === 1 ? D.gold + "22" : D.surface, border: `1px solid ${item.rank === 1 ? D.gold + "44" : D.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: item.rank === 1 ? D.gold : D.textDim, fontFamily: "system-ui, sans-serif", fontWeight: 700, marginTop: 2 }}>
            {RANK_CIRCLES[item.rank - 1]}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9, flexWrap: "wrap" }}>
            {typeInfo && <Badge label={typeInfo.label} color={typeInfo.color} />}
            {cat && <Badge label={`${cat.emoji} ${cat.label}`} color={cat.color} />}
            {league && <span style={{ fontSize: 11, color: league.color, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>{league.emoji} {league.name}</span>}
            {item.region && <span style={{ fontSize: 11, color: D.textDim, fontFamily: "system-ui, sans-serif" }}>{item.region}</span>}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: D.text, lineHeight: 1.4, fontFamily: "'Georgia', serif", marginBottom: 8 }}>{item.headline}</div>
          <div style={{ display: "flex", gap: 10, fontFamily: "system-ui, sans-serif", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: D.textMid }}>via <span style={{ color: "#C0C0D0", fontWeight: 500 }}>{item.source}</span></span>
            <span style={{ color: D.textDim }}>·</span>
            <span style={{ fontSize: 12, color: D.textDim }}>{item.time}</span>
            {item.team && <><span style={{ color: D.textDim }}>·</span><span style={{ fontSize: 12, color: D.textDim }}>{item.team}</span></>}
          </div>
        </div>
      </div>
      <AIBullets bullets={bullets} loading={loading} />
    </div>
  );
}

// ── Game Card ─────────────────────────────────────────────────
function GameCard({ game }) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const hasScore = isLive || isFinal;
  const tc = (isWinner) => !isFinal ? D.text : isWinner ? D.text : D.textDim;

  return (
    <div style={{ background: D.card, border: `1px solid ${isLive ? D.red + "50" : D.border}`, borderRadius: 10, padding: "14px", display: "flex", flexDirection: "column", justifyContent: "space-between", aspectRatio: "1 / 1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StatusDot status={game.status} />
        {game.tv && <span style={{ fontSize: 10, color: D.textDim, fontFamily: "system-ui, sans-serif" }}>{game.tv}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: tc(game.winner === game.awayTeam), fontFamily: "system-ui, sans-serif" }}>{game.awayTeam}</span>
          {hasScore && <span style={{ fontSize: 22, fontWeight: 800, color: tc(game.winner === game.awayTeam), fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>{game.awayScore ?? "-"}</span>}
        </div>
        <div style={{ height: 1, background: D.border }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: tc(game.winner === game.homeTeam), fontFamily: "system-ui, sans-serif" }}>{game.homeTeam}</span>
          {hasScore && <span style={{ fontSize: 22, fontWeight: 800, color: tc(game.winner === game.homeTeam), fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>{game.homeScore ?? "-"}</span>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${D.border}`, paddingTop: 8 }}>
        <span style={{ fontSize: 10, color: isLive ? D.red : D.textDim, fontFamily: "system-ui, sans-serif", fontWeight: isLive ? 600 : 400 }}>
          {game.status === "upcoming" ? game.time : (game.period || "Final")}
        </span>
        {game.spread && <span style={{ fontSize: 10, color: D.accent, fontFamily: "system-ui, sans-serif", fontWeight: 600, background: D.accent + "15", padding: "2px 6px", borderRadius: 4, border: `1px solid ${D.accent}30` }}>{game.spread}</span>}
      </div>
    </div>
  );
}

// ── Ticker Bar ────────────────────────────────────────────────
function TickerBar({ tickers }) {
  return (
    <div style={{ background: D.surface, borderBottom: `1px solid ${D.border}`, padding: "8px 0", overflowX: "auto" }}>
      <div style={{ display: "flex", minWidth: "max-content", padding: "0 20px" }}>
        {tickers.map((t, i) => (
          <div key={t.symbol} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderRight: i < tickers.length - 1 ? `1px solid ${D.border}` : "none" }}>
            <span style={{ fontSize: 11, color: D.textDim, fontFamily: "system-ui, sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>{t.symbol}</span>
            <span style={{ fontSize: 12, color: D.text, fontFamily: "system-ui, sans-serif", fontWeight: 700, whiteSpace: "nowrap" }}>{t.value}</span>
            <span style={{ fontSize: 11, color: t.up ? D.green : D.red, fontFamily: "system-ui, sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function FieldApp() {
  const [mainTab, setMainTab] = useState("news");
  const [league, setLeague] = useState("nba");
  const [sportsSection, setSportsSection] = useState("news");
  const [catFilter, setCatFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");

  // Data state
  const [worldNews, setWorldNews] = useState([]);
  const [sportsNews, setSportsNews] = useState({});
  const [games, setGames] = useState({});
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState({ news: true, sports: true, markets: true });

  // AI bullets: { [itemId]: { loading, bullets } }
  const [bullets, setBullets] = useState({});

  const fetchBullets = useCallback(async (item, isSports) => {
    if (bullets[item.id]?.bullets || bullets[item.id]?.loading) return;
    setBullets(prev => ({ ...prev, [item.id]: { loading: true, bullets: null } }));
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: item.headline, type: isSports ? "sports" : "world" }),
      });
      const data = await res.json();
      setBullets(prev => ({ ...prev, [item.id]: { loading: false, bullets: data.bullets } }));
    } catch {
      setBullets(prev => ({ ...prev, [item.id]: { loading: false, bullets: null } }));
    }
  }, [bullets]);

  // Fetch world news
  useEffect(() => {
    fetch("/api/news").then(r => r.json()).then(d => {
      setWorldNews(d.articles || []);
      setLoading(p => ({ ...p, news: false }));
    }).catch(() => setLoading(p => ({ ...p, news: false })));
  }, []);

  // Fetch market tickers
  useEffect(() => {
    fetch("/api/markets").then(r => r.json()).then(d => {
      setTickers(d.tickers || []);
      setLoading(p => ({ ...p, markets: false }));
    }).catch(() => setLoading(p => ({ ...p, markets: false })));
  }, []);

  // Fetch sports data when league changes
  useEffect(() => {
    if (mainTab !== "sports") return;
    Promise.all([
      fetch(`/api/sports?league=${league}&type=scores`).then(r => r.json()),
      fetch(`/api/sports?league=${league}&type=news`).then(r => r.json()),
    ]).then(([scoresData, newsData]) => {
      setGames(prev => ({ ...prev, [league]: scoresData.games || [] }));
      setSportsNews(prev => ({ ...prev, [league]: newsData.news || [] }));
      setLoading(p => ({ ...p, sports: false }));
    }).catch(() => setLoading(p => ({ ...p, sports: false })));
  }, [mainTab, league]);

  // Auto-fetch bullets for visible items
  useEffect(() => {
    if (mainTab === "news" || mainTab === "markets") {
      const visible = catFilter === "all" ? worldNews : worldNews.filter(h => h.category === catFilter);
      visible.slice(0, 8).forEach(item => fetchBullets(item, false));
    }
  }, [mainTab, catFilter, worldNews]);

  useEffect(() => {
    if (mainTab === "sports" && sportsSection === "news") {
      (sportsNews[league] || []).forEach(item => fetchBullets(item, true));
    }
  }, [mainTab, sportsSection, league, sportsNews]);

  // Derived
  const activeLeague = LEAGUES.find(l => l.id === league);
  const leagueGames = (games[league] || []).filter(g => gameFilter === "all" || g.status === gameFilter);
  const leagueNews = sportsNews[league] || [];
  const liveCount = (games[league] || []).filter(g => g.status === "live").length;

  const visibleWorld = catFilter === "all" ? worldNews : worldNews.filter(h => h.category === catFilter);
  const topWorld = visibleWorld.filter(h => h.rank).sort((a, b) => a.rank - b.rank);
  const moreWorld = visibleWorld.filter(h => !h.rank);

  const marketNews = worldNews.filter(h => h.category === "markets" || h.category === "geo");

  const MainTab = ({ id, label, emoji }) => (
    <button onClick={() => setMainTab(id)} style={{ flex: 1, padding: "13px 8px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: mainTab === id ? 700 : 400, color: mainTab === id ? D.text : D.textDim, borderBottom: mainTab === id ? `2px solid ${D.accent}` : "2px solid transparent", transition: "all 0.15s", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {emoji} {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: D.bg }}>
      {/* Header */}
      <header style={{ background: D.surface, borderBottom: `1px solid ${D.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 12px" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: D.text, letterSpacing: "-0.5px", fontFamily: "'Georgia', serif" }}>Field</div>
              <div style={{ fontSize: 9, color: D.textDim, letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", marginTop: 1 }}>Intelligence</div>
            </div>
            <div style={{ fontSize: 11, color: D.textDim, fontFamily: "system-ui, sans-serif" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", borderTop: `1px solid ${D.border}` }}>
            <MainTab id="sports" label="Sports" emoji="🏆" />
            <MainTab id="news" label="News" emoji="🌍" />
            <MainTab id="markets" label="Markets" emoji="📈" />
          </div>
        </div>
      </header>

      {mainTab === "markets" && tickers.length > 0 && <TickerBar tickers={tickers} />}

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* ── SPORTS ── */}
        {mainTab === "sports" && (
          <div>
            <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${D.border}`, marginBottom: 20 }}>
              {LEAGUES.map(l => (
                <button key={l.id} onClick={() => setLeague(l.id)} style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: league === l.id ? 700 : 400, color: league === l.id ? D.text : D.textMid, borderBottom: league === l.id ? `2px solid ${activeLeague?.color}` : "2px solid transparent", whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif", transition: "all 0.15s" }}>
                  {l.emoji} {l.name}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[["news", "📰 News"], ["games", "🎮 Games"]].map(([val, label]) => (
                <Pill key={val} active={sportsSection === val} onClick={() => setSportsSection(val)}>{label}</Pill>
              ))}
            </div>

            {sportsSection === "news" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loading.sports
                  ? [1, 2, 3].map(i => <div key={i} style={{ height: 120, background: D.card, borderRadius: 10, border: `1px solid ${D.border}`, animation: "pulse 1.5s infinite" }} />)
                  : leagueNews.length === 0
                    ? <div style={{ padding: "40px 0", textAlign: "center", color: D.textDim, fontFamily: "system-ui, sans-serif" }}>No stories right now</div>
                    : leagueNews.map(item => (
                      <HeadlineCard key={item.id} item={item} isSports={true} bullets={bullets[item.id]?.bullets} loading={bullets[item.id]?.loading} />
                    ))
                }
              </div>
            )}

            {sportsSection === "games" && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                  {["all", "live", "upcoming", "final"].map(val => (
                    <Pill key={val} active={gameFilter === val} onClick={() => setGameFilter(val)}>
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                      {val === "live" && liveCount > 0 && <span style={{ marginLeft: 5, background: D.red, color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 9 }}>{liveCount}</span>}
                    </Pill>
                  ))}
                </div>
                {loading.sports
                  ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{[1,2,3,4].map(i => <div key={i} style={{ aspectRatio: "1/1", background: D.card, borderRadius: 10, border: `1px solid ${D.border}` }} />)}</div>
                  : leagueGames.length === 0
                    ? <div style={{ padding: "40px 0", textAlign: "center", color: D.textDim, fontFamily: "system-ui, sans-serif" }}>No games to show</div>
                    : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {leagueGames.map(g => <GameCard key={g.id} game={g} />)}
                      </div>
                }
              </div>
            )}
          </div>
        )}

        {/* ── NEWS ── */}
        {mainTab === "news" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              <Pill active={catFilter === "all"} onClick={() => setCatFilter("all")}>All</Pill>
              {NEWS_CATS.map(c => (
                <Pill key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>{c.emoji} {c.label}</Pill>
              ))}
            </div>

            {loading.news
              ? [1,2,3].map(i => <div key={i} style={{ height: 160, background: D.card, borderRadius: 10, border: `1px solid ${D.border}`, marginBottom: 10 }} />)
              : <>
                  {topWorld.length > 0 && <>
                    <SectionLabel label="Top Stories" color={D.accent} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                      {topWorld.map(item => <HeadlineCard key={item.id} item={item} isSports={false} bullets={bullets[item.id]?.bullets} loading={bullets[item.id]?.loading} />)}
                    </div>
                  </>}
                  {moreWorld.length > 0 && <>
                    <SectionLabel label="More Stories" color={D.borderLight} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {moreWorld.map(item => <HeadlineCard key={item.id} item={item} isSports={false} bullets={bullets[item.id]?.bullets} loading={bullets[item.id]?.loading} />)}
                    </div>
                  </>}
                </>
            }
          </div>
        )}

        {/* ── MARKETS ── */}
        {mainTab === "markets" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <SectionLabel label="Live Markets" color={D.green} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {(tickers.length > 0 ? tickers : Array(8).fill(null)).map((t, i) => (
                  <div key={i} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 10, padding: "14px" }}>
                    {t ? <>
                      <div style={{ fontSize: 10, color: D.textDim, fontFamily: "system-ui, sans-serif", fontWeight: 600, marginBottom: 6 }}>{t.symbol}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: D.text, fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>{t.value}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.up ? D.green : D.red, fontFamily: "system-ui, sans-serif" }}>{t.change}</div>
                    </> : <div style={{ height: 60, background: D.surface, borderRadius: 6 }} />}
                  </div>
                ))}
              </div>
            </div>

            <SectionLabel label="Moving Markets" color={D.green} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {marketNews.length === 0
                ? [1,2,3].map(i => <div key={i} style={{ height: 160, background: D.card, borderRadius: 10, border: `1px solid ${D.border}` }} />)
                : marketNews.map(item => <HeadlineCard key={item.id} item={item} isSports={false} bullets={bullets[item.id]?.bullets} loading={bullets[item.id]?.loading} />)
              }
            </div>
          </div>
        )}

        <div style={{ marginTop: 56, paddingTop: 22, borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", fontFamily: "system-ui, sans-serif" }}>
          <span style={{ fontSize: 11, color: D.textDim }}>Field · Intelligence</span>
          <span style={{ fontSize: 11, color: D.textDim }}>Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </main>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
