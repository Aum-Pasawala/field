"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── Design System ────────────────────────────────────────────
const C = {
  bg:          "#080810",
  surface:     "#0F0F1A",
  card:        "#13131F",
  cardBright:  "#181828",
  border:      "#1E1E32",
  borderBright:"#2A2A44",
  text:        "#F2F2FF",
  textMid:     "#8888AA",
  textDim:     "#44445A",
  accent:      "#6C5CE7",
  accentBright:"#8B7CF6",
  green:       "#00D4AA",
  red:         "#FF3366",
  orange:      "#FF7043",
  gold:        "#FFD700",
  cyan:        "#00B4D8",
};

// ─── Static Config ────────────────────────────────────────────
const LEAGUES = [
  { id: "nba",     name: "NBA",     emoji: "🏀", color: "#C9082A" },
  { id: "nfl",     name: "NFL",     emoji: "🏈", color: "#4A90D9" },
  { id: "mlb",     name: "MLB",     emoji: "⚾", color: "#00A651" },
  { id: "nhl",     name: "NHL",     emoji: "🏒", color: "#A8B8C8" },
  { id: "soccer",  name: "Soccer",  emoji: "⚽", color: "#00D4AA" },
  { id: "college", name: "College", emoji: "🎓", color: "#FF7043" },
];

const NEWS_CATS = [
  { id: "geo",      label: "Geopolitics", emoji: "🌍", color: "#FF3366" },
  { id: "markets",  label: "Economy",     emoji: "📈", color: "#00D4AA" },
  { id: "politics", label: "Politics",    emoji: "🏛️", color: "#4A90D9" },
  { id: "tech",     label: "Tech & AI",   emoji: "⚡", color: "#6C5CE7" },
];

const TYPE_CONFIG = {
  trade:     { label: "TRADE",     color: "#FF7043" },
  injury:    { label: "INJURY",    color: "#FF3366" },
  signing:   { label: "SIGNING",   color: "#00D4AA" },
  storyline: { label: "NEWS",      color: "#6C5CE7" },
  roster:    { label: "ROSTER",    color: "#FFD700" },
  news:      { label: "NEWS",      color: "#6C5CE7" },
};

const BULLET_META = [
  { icon: "◆", color: C.text,     label: "WHAT" },
  { icon: "◆", color: C.orange,   label: "WHY"  },
  { icon: "◆", color: C.textMid,  label: "CONTEXT" },
  { icon: "◆", color: C.green,    label: "IMPACT" },
];

const RANK_LABELS = ["01", "02", "03", "04", "05"];

// ─── Utilities ────────────────────────────────────────────────
const font   = `'Inter', system-ui, sans-serif`;
const bebas  = `'Bebas Neue', 'Arial Black', sans-serif`;

// ─── Components ──────────────────────────────────────────────

function LiveDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 10, height: 10 }}>
      <span style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: C.red, opacity: 0.4, animation: "ping 1.5s ease-in-out infinite" }} />
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, display: "block" }} />
      <style>{`@keyframes ping{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.8);opacity:0}}`}</style>
    </span>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ padding: "2px 7px", borderRadius: 3, background: color + "18", color, fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", fontFamily: font, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

function TabBtn({ active, onClick, children, accent }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "14px 8px", border: "none", background: "none", cursor: "pointer",
      fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
      color: active ? C.text : C.textDim,
      borderBottom: active ? `2px solid ${accent || C.accent}` : "2px solid transparent",
      fontFamily: font, transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px", borderRadius: 20,
      background: active ? C.accent : C.surface,
      border: `1px solid ${active ? C.accent : C.border}`,
      color: active ? "#fff" : C.textMid,
      fontSize: 11, fontWeight: 600, cursor: "pointer",
      fontFamily: font, whiteSpace: "nowrap", transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

// ─── Breaking News Banner ─────────────────────────────────────
function BreakingBanner({ items }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[idx];

  return (
    <div style={{ background: C.red, padding: "10px 20px", display: "flex", alignItems: "center", gap: 14, overflow: "hidden" }}>
      <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "2px", fontFamily: font, color: "#fff", background: "rgba(0,0,0,0.3)", padding: "3px 8px", borderRadius: 3, flexShrink: 0 }}>
        BREAKING
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.headline}
      </span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: font, flexShrink: 0 }}>
        {item.source} · {item.time}
      </span>
      {items.length > 1 && (
        <div style={{ display: "flex", gap: 4, marginLeft: "auto", flexShrink: 0 }}>
          {items.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width: 5, height: 5, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s" }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ticker Bar ───────────────────────────────────────────────
function Ticker({ tickers }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0;
    const speed = 0.5;
    let raf;
    const animate = () => {
      x -= speed;
      if (x < -el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [tickers.length]);

  if (!tickers.length) return null;
  const doubled = [...tickers, ...tickers];

  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "9px 0", overflow: "hidden" }}>
      <div ref={ref} style={{ display: "flex", gap: 0, width: "max-content" }}>
        {doubled.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", borderRight: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 10, color: C.textDim, fontFamily: font, fontWeight: 700, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{t.symbol}</span>
            <span style={{ fontSize: 12, color: C.text, fontFamily: font, fontWeight: 700, whiteSpace: "nowrap" }}>{t.value}</span>
            <span style={{ fontSize: 11, color: t.up ? C.green : C.red, fontFamily: font, fontWeight: 600, whiteSpace: "nowrap" }}>{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Bullets ───────────────────────────────────────────────
function AIBullets({ bullets, loading }) {
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 14, fontFamily: font, fontSize: 12, color: C.textDim }}>
      <div style={{ width: 12, height: 12, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
      Generating analysis...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!bullets?.length) return null;

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 900 }}>AI</span>
        </div>
        <span style={{ fontSize: 9, color: C.accent, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", fontFamily: font }}>Field Analysis</span>
      </div>
      {bullets.map((b, i) => {
        const meta = BULLET_META[i] || BULLET_META[0];
        return (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, marginTop: 3 }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: meta.color, fontFamily: font, letterSpacing: "1px", background: meta.color + "15", padding: "2px 5px", borderRadius: 3, border: `1px solid ${meta.color}25` }}>{meta.label}</span>
            </div>
            <span style={{ fontSize: 13, color: "#C8C8E8", lineHeight: 1.55, fontFamily: font }}>{b}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Score Card ───────────────────────────────────────────────
function ScoreCard({ game }) {
  const isLive  = game.status === "live";
  const isFinal = game.status === "final";
  const hasScore = isLive || isFinal;
  const winnerAway = isFinal && game.winner === game.awayTeam;
  const winnerHome = isFinal && game.winner === game.homeTeam;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${isLive ? C.red + "60" : C.border}`,
      borderRadius: 10,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      aspectRatio: "1 / 1",
      boxShadow: isLive ? `0 0 20px ${C.red}15` : "none",
      transition: "all 0.2s",
    }}>
      {/* Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isLive ? (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <LiveDot />
            <span style={{ fontSize: 10, color: C.red, fontWeight: 800, fontFamily: font, letterSpacing: "1px" }}>LIVE</span>
          </div>
        ) : (
          <span style={{ fontSize: 9, color: isFinal ? C.textDim : C.green, fontWeight: 700, fontFamily: font, letterSpacing: "1px" }}>
            {isFinal ? "FINAL" : "UPCOMING"}
          </span>
        )}
        {game.tv && <span style={{ fontSize: 9, color: C.textDim, fontFamily: font }}>{game.tv}</span>}
      </div>

      {/* Teams */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: font, letterSpacing: "0.5px", color: isFinal && !winnerAway ? C.textDim : C.text }}>{game.awayTeam}</span>
          {hasScore && <span style={{ fontSize: 24, fontWeight: 900, fontFamily: font, lineHeight: 1, color: isFinal && !winnerAway ? C.textDim : winnerAway ? C.text : C.text }}>{game.awayScore}</span>}
        </div>
        <div style={{ height: 1, background: C.border }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: font, letterSpacing: "0.5px", color: isFinal && !winnerHome ? C.textDim : C.text }}>{game.homeTeam}</span>
          {hasScore && <span style={{ fontSize: 24, fontWeight: 900, fontFamily: font, lineHeight: 1, color: isFinal && !winnerHome ? C.textDim : winnerHome ? C.text : C.text }}>{game.homeScore}</span>}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, color: isLive ? C.red : C.textDim, fontFamily: font, fontWeight: isLive ? 700 : 400 }}>
          {game.status === "upcoming" ? game.time : (game.period || "Final")}
        </span>
        {game.spread && (
          <span style={{ fontSize: 10, color: C.accentBright, fontFamily: font, fontWeight: 600, background: C.accent + "15", padding: "2px 6px", borderRadius: 4, border: `1px solid ${C.accent}30` }}>
            {game.spread}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Headline Card ────────────────────────────────────────────
function HeadlineCard({ item, bullets, loading, rank, isSports }) {
  const league  = isSports ? LEAGUES.find(l => l.id === item.league) : null;
  const cat     = !isSports ? NEWS_CATS.find(c => c.id === item.category) : null;
  const typeInfo = isSports ? (TYPE_CONFIG[item.type] || TYPE_CONFIG.storyline) : null;
  const isTop   = rank != null;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "20px 22px",
      transition: "border-color 0.2s",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Rank accent bar */}
      {isTop && rank === 1 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.orange})` }} />}

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Rank number */}
        {isTop && (
          <div style={{ flexShrink: 0, minWidth: 40 }}>
            <div style={{ fontFamily: bebas, fontSize: 36, lineHeight: 1, color: rank === 1 ? C.gold : C.borderBright, letterSpacing: "-1px" }}>
              {RANK_LABELS[rank - 1]}
            </div>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            {typeInfo  && <Badge label={typeInfo.label}            color={typeInfo.color} />}
            {cat       && <Badge label={`${cat.emoji} ${cat.label}`} color={cat.color} />}
            {item.breaking && <Badge label="🔴 BREAKING" color={C.red} />}
            {league    && <span style={{ fontSize: 11, color: league.color, fontFamily: font, fontWeight: 700 }}>{league.emoji} {league.name}</span>}
            {item.region && <span style={{ fontSize: 11, color: C.textDim, fontFamily: font }}>{item.region}</span>}
          </div>

          {/* Headline */}
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.4, fontFamily: font, marginBottom: 10, letterSpacing: "-0.2px" }}>
            {item.headline}
          </div>

          {/* Meta */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.textMid, fontFamily: font }}>
              via <span style={{ color: "#A0A0C8", fontWeight: 600 }}>{item.source}</span>
            </span>
            <span style={{ color: C.textDim, fontSize: 11 }}>·</span>
            <span style={{ fontSize: 12, color: C.textDim, fontFamily: font }}>{item.time}</span>
            {item.team && <><span style={{ color: C.textDim }}>·</span><span style={{ fontSize: 12, color: C.textDim, fontFamily: font }}>{item.team}</span></>}
          </div>
        </div>
      </div>

      <AIBullets bullets={bullets} loading={loading} />
    </div>
  );
}

// ─── Market Cards ─────────────────────────────────────────────
function MarketCard({ ticker }) {
  const typeColors = { index: C.cyan, crypto: C.accentBright, commodity: C.orange, bond: C.textMid, fx: "#88AAFF" };
  const accent = typeColors[ticker.type] || C.textMid;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: `linear-gradient(90deg, ${accent}88, transparent)` }} />
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: font, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 8 }}>{ticker.symbol}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: font, marginBottom: 5, letterSpacing: "-0.5px" }}>{ticker.value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: ticker.up ? C.green : C.red, fontFamily: font }}>{ticker.change}</div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function FieldApp() {
  const [mainTab,       setMainTab]       = useState("sports");
  const [league,        setLeague]        = useState("nba");
  const [sportsSection, setSportsSection] = useState("scores");
  const [catFilter,     setCatFilter]     = useState("all");
  const [gameFilter,    setGameFilter]    = useState("all");

  const [worldNews,   setWorldNews]   = useState([]);
  const [sportsNews,  setSportsNews]  = useState({});
  const [games,       setGames]       = useState({});
  const [tickers,     setTickers]     = useState([]);
  const [bullets,     setBullets]     = useState({});
  const [loadingData, setLoadingData] = useState({ news: true, sports: true, markets: true });

  const fetchBullets = useCallback(async (item, isSports) => {
    const id = item.id;
    setBullets(prev => {
      if (prev[id]?.bullets || prev[id]?.loading) return prev;
      return { ...prev, [id]: { loading: true, bullets: null } };
    });
    try {
      const res  = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ headline: item.headline, type: isSports ? "sports" : "world" }) });
      const data = await res.json();
      setBullets(prev => ({ ...prev, [id]: { loading: false, bullets: data.bullets } }));
    } catch {
      setBullets(prev => ({ ...prev, [id]: { loading: false, bullets: null } }));
    }
  }, []);

  // Fetch world news
  useEffect(() => {
    fetch("/api/news").then(r => r.json()).then(d => { setWorldNews(d.articles || []); setLoadingData(p => ({ ...p, news: false })); }).catch(() => setLoadingData(p => ({ ...p, news: false })));
  }, []);

  // Fetch tickers
  useEffect(() => {
    fetch("/api/markets").then(r => r.json()).then(d => { setTickers(d.tickers || []); setLoadingData(p => ({ ...p, markets: false })); }).catch(() => setLoadingData(p => ({ ...p, markets: false })));
    const t = setInterval(() => {
      fetch("/api/markets").then(r => r.json()).then(d => setTickers(d.tickers || [])).catch(() => {});
    }, 60000);
    return () => clearInterval(t);
  }, []);

  // Fetch sports
  useEffect(() => {
    if (mainTab !== "sports") return;
    setLoadingData(p => ({ ...p, sports: true }));
    Promise.all([
      fetch(`/api/sports?league=${league}&type=scores`).then(r => r.json()),
      fetch(`/api/sports?league=${league}&type=news`).then(r => r.json()),
    ]).then(([s, n]) => {
      setGames(prev      => ({ ...prev, [league]: s.games || [] }));
      setSportsNews(prev => ({ ...prev, [league]: n.news  || [] }));
      setLoadingData(p   => ({ ...p, sports: false }));
    }).catch(() => setLoadingData(p => ({ ...p, sports: false })));
  }, [mainTab, league]);

  // Auto-load bullets for visible headlines
  useEffect(() => {
    if (mainTab === "news" || mainTab === "markets") {
      const visible = catFilter === "all" ? worldNews : worldNews.filter(h => h.category === catFilter);
      visible.slice(0, 10).forEach(item => fetchBullets(item, false));
    }
  }, [mainTab, catFilter, worldNews, fetchBullets]);

  useEffect(() => {
    if (mainTab === "sports" && sportsSection === "news") {
      (sportsNews[league] || []).slice(0, 8).forEach(item => fetchBullets(item, true));
    }
  }, [mainTab, sportsSection, league, sportsNews, fetchBullets]);

  // Derived
  const activeLeague   = LEAGUES.find(l => l.id === league);
  const leagueGames    = (games[league] || []).filter(g => gameFilter === "all" || g.status === gameFilter);
  const leagueNews     = sportsNews[league] || [];
  const liveCount      = (games[league] || []).filter(g => g.status === "live").length;
  const visibleWorld   = catFilter === "all" ? worldNews : worldNews.filter(h => h.category === catFilter);
  const topWorld       = visibleWorld.filter(h => h.rank).sort((a, b) => a.rank - b.rank);
  const moreWorld      = visibleWorld.filter(h => !h.rank);
  const breakingItems  = worldNews.filter(h => h.breaking).slice(0, 3);
  const marketNews     = worldNews.filter(h => ["markets","geo"].includes(h.category));

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* ── Top Header ── */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
            {/* Wordmark */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: bebas, fontSize: 28, letterSpacing: "3px", color: C.text, lineHeight: 1 }}>FIELD</span>
              <span style={{ fontSize: 9, color: C.accent, fontWeight: 800, letterSpacing: "3px", fontFamily: font, textTransform: "uppercase" }}>Intelligence</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {breakingItems.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <LiveDot />
                  <span style={{ fontSize: 10, color: C.red, fontWeight: 800, fontFamily: font, letterSpacing: "1px" }}>LIVE</span>
                </div>
              )}
              <span style={{ fontSize: 11, color: C.textDim, fontFamily: font }}>
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* Main Tabs */}
          <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
            <TabBtn active={mainTab === "sports"} onClick={() => setMainTab("sports")} accent={activeLeague?.color}>🏆 Sports</TabBtn>
            <TabBtn active={mainTab === "news"}   onClick={() => setMainTab("news")}   accent={C.red}>🌍 News</TabBtn>
            <TabBtn active={mainTab === "markets"}onClick={() => setMainTab("markets")} accent={C.green}>📈 Markets</TabBtn>
          </div>
        </div>
      </header>

      {/* ── Breaking News Banner ── */}
      {breakingItems.length > 0 && (mainTab === "news" || mainTab === "markets") && (
        <BreakingBanner items={breakingItems} />
      )}

      {/* ── Ticker ── */}
      {tickers.length > 0 && <Ticker tickers={tickers} />}

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* ══ SPORTS TAB ══ */}
        {mainTab === "sports" && (
          <div>
            {/* League tabs */}
            <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${C.border}`, marginBottom: 22 }}>
              {LEAGUES.map(l => (
                <button key={l.id} onClick={() => setLeague(l.id)} style={{
                  padding: "9px 16px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: league === l.id ? 800 : 500, letterSpacing: "0.5px",
                  color: league === l.id ? C.text : C.textDim,
                  borderBottom: league === l.id ? `2px solid ${l.color}` : "2px solid transparent",
                  whiteSpace: "nowrap", fontFamily: font, transition: "all 0.15s",
                }}>
                  {l.emoji} {l.name}
                </button>
              ))}
            </div>

            {/* Section toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              <Pill active={sportsSection === "scores"} onClick={() => setSportsSection("scores")}>
                🎮 Scores {liveCount > 0 && <span style={{ marginLeft: 5, background: C.red, color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 9 }}>{liveCount} LIVE</span>}
              </Pill>
              <Pill active={sportsSection === "news"} onClick={() => setSportsSection("news")}>📰 Transactions & News</Pill>
            </div>

            {/* SCORES */}
            {sportsSection === "scores" && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
                  {["all","live","upcoming","final"].map(v => (
                    <Pill key={v} active={gameFilter === v} onClick={() => setGameFilter(v)}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                      {v === "live" && liveCount > 0 && <span style={{ marginLeft: 4, background: C.red, color: "#fff", borderRadius: 8, padding: "1px 4px", fontSize: 8 }}>{liveCount}</span>}
                    </Pill>
                  ))}
                </div>
                {loadingData.sports ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ aspectRatio: "1/1", background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, animation: "pulse 1.5s infinite" }} />)}
                    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
                  </div>
                ) : leagueGames.length === 0 ? (
                  <div style={{ padding: "50px 0", textAlign: "center", color: C.textDim, fontFamily: font, fontSize: 14 }}>No games scheduled</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {leagueGames.map(g => <ScoreCard key={g.id} game={g} />)}
                  </div>
                )}
              </div>
            )}

            {/* NEWS */}
            {sportsSection === "news" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {loadingData.sports ? (
                  [1,2,3].map(i => <div key={i} style={{ height: 140, background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, animation: "pulse 1.5s infinite" }} />)
                ) : leagueNews.length === 0 ? (
                  <div style={{ padding: "50px 0", textAlign: "center", color: C.textDim, fontFamily: font }}>No stories right now</div>
                ) : leagueNews.map(item => (
                  <HeadlineCard key={item.id} item={item} rank={item.rank} isSports={true} bullets={bullets[item.id]?.bullets} loading={bullets[item.id]?.loading} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ NEWS TAB ══ */}
        {mainTab === "news" && (
          <div>
            {/* Category filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 26, flexWrap: "wrap" }}>
              <Pill active={catFilter === "all"} onClick={() => setCatFilter("all")}>All</Pill>
              {NEWS_CATS.map(c => <Pill key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>{c.emoji} {c.label}</Pill>)}
            </div>

            {loadingData.news ? (
              [1,2,3].map(i => <div key={i} style={{ height: 180, background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12, animation: "pulse 1.5s infinite" }} />)
            ) : <>
              {topWorld.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, background: `linear-gradient(180deg, ${C.gold}, ${C.orange})`, borderRadius: 2 }} />
                    <span style={{ fontFamily: bebas, fontSize: 20, letterSpacing: "2px", color: C.text }}>TOP STORIES</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {topWorld.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank} isSports={false} bullets={bullets[item.id]?.bullets} loading={bullets[item.id]?.loading} />)}
                  </div>
                </div>
              )}
              {moreWorld.length > 0 && (
                <div style={{ marginTop: 30 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, background: C.borderBright, borderRadius: 2 }} />
                    <span style={{ fontFamily: bebas, fontSize: 20, letterSpacing: "2px", color: C.textMid }}>MORE STORIES</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {moreWorld.map(item => <HeadlineCard key={item.id} item={item} rank={null} isSports={false} bullets={bullets[item.id]?.bullets} loading={bullets[item.id]?.loading} />)}
                  </div>
                </div>
              )}
            </>}
          </div>
        )}

        {/* ══ MARKETS TAB ══ */}
        {mainTab === "markets" && (
          <div>
            {/* Market grid */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 3, height: 20, background: C.green, borderRadius: 2 }} />
                <span style={{ fontFamily: bebas, fontSize: 20, letterSpacing: "2px", color: C.text }}>LIVE MARKETS</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 4 }}>
                  <LiveDot />
                  <span style={{ fontSize: 9, color: C.green, fontWeight: 700, fontFamily: font, letterSpacing: "1px" }}>UPDATING</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {(tickers.length > 0 ? tickers : Array(10).fill(null)).map((t, i) => (
                  t ? <MarketCard key={i} ticker={t} />
                    : <div key={i} style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px", height: 80, animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            </div>

            {/* Market moving news */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 3, height: 20, background: C.green, borderRadius: 2 }} />
                <span style={{ fontFamily: bebas, fontSize: 20, letterSpacing: "2px", color: C.text }}>MOVING MARKETS</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {marketNews.length === 0
                  ? [1,2,3].map(i => <div key={i} style={{ height: 160, background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, animation: "pulse 1.5s infinite" }} />)
                  : marketNews.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank || null} isSports={false} bullets={bullets[item.id]?.bullets} loading={bullets[item.id]?.loading} />)
                }
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: bebas, fontSize: 16, letterSpacing: "2px", color: C.textDim }}>FIELD</span>
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: font }}>Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </main>

      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: ${C.surface}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }`}</style>
    </div>
  );
}
