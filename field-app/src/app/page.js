"use client";
import { useState, useEffect, useRef } from "react";

// ── Module-level bullet cache — lives outside React, never wiped ──────────────
// Keys are headlines, values are { status: "loading"|"done"|"error", bullets: [] }
const CACHE = {};
const LISTENERS = {}; // headline -> Set of setState functions

function subscribeBullets(headline, setState) {
  if (!LISTENERS[headline]) LISTENERS[headline] = new Set();
  LISTENERS[headline].add(setState);
  return () => LISTENERS[headline].delete(setState);
}

function notifyListeners(headline) {
  if (LISTENERS[headline]) {
    LISTENERS[headline].forEach(fn => fn(CACHE[headline]));
  }
}

async function fetchBulletsForHeadline(headline, isSports) {
  if (CACHE[headline]) return; // already fetching or done
  CACHE[headline] = { status: "loading", bullets: [] };
  notifyListeners(headline);
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline, type: isSports ? "sports" : "world" }),
    });
    const data = await res.json();
    CACHE[headline] = { status: "done", bullets: data.bullets || [] };
  } catch {
    CACHE[headline] = { status: "error", bullets: [] };
  }
  notifyListeners(headline);
}

// ── Design ────────────────────────────────────────────────────
const C = {
  bg: "#07070F", surface: "#0D0D1A", card: "#111120",
  border: "#1C1C2E", borderBright: "#28284A",
  text: "#F0F0FF", textMid: "#7878A0", textDim: "#3A3A58",
  accent: "#6C5CE7", accentBright: "#9B8FFF",
  green: "#00D4AA", red: "#FF2D5B", orange: "#FF6B2B",
  gold: "#FFD60A", cyan: "#00B4D8",
};
const Fb = `'Inter', system-ui, sans-serif`;
const Fd = `'Bebas Neue', 'Arial Black', sans-serif`;

const LEAGUES = [
  { id: "nba", name: "NBA", emoji: "🏀", color: "#E8112D" },
  { id: "nfl", name: "NFL", emoji: "🏈", color: "#4A90D9" },
  { id: "mlb", name: "MLB", emoji: "⚾", color: "#00A651" },
  { id: "nhl", name: "NHL", emoji: "🏒", color: "#A8B8CC" },
  { id: "soccer", name: "Soccer", emoji: "⚽", color: "#00D4AA" },
  { id: "college", name: "College", emoji: "🎓", color: "#FF6B2B" },
];
const NEWS_CATS = [
  { id: "geo",      label: "Geopolitics", emoji: "🌍", color: "#FF2D5B" },
  { id: "markets",  label: "Economy",     emoji: "📈", color: "#00D4AA" },
  { id: "politics", label: "Politics",    emoji: "🏛️",  color: "#4A90D9" },
  { id: "tech",     label: "Tech & AI",   emoji: "⚡", color: "#9B8FFF" },
];
const TYPE_CFG = {
  trade:     { label: "TRADE",   color: "#FF6B2B" },
  injury:    { label: "INJURY",  color: "#FF2D5B" },
  signing:   { label: "SIGNING", color: "#00D4AA" },
  storyline: { label: "NEWS",    color: "#9B8FFF" },
  roster:    { label: "ROSTER",  color: "#FFD60A" },
  news:      { label: "NEWS",    color: "#9B8FFF" },
  award:     { label: "AWARD",   color: "#FFD60A" },
};
const BULLET_META = [
  { tag: "WHAT",    color: C.text    },
  { tag: "WHY",     color: C.orange  },
  { tag: "CONTEXT", color: C.textMid },
  { tag: "IMPACT",  color: C.green   },
];

// ── Tiny UI ───────────────────────────────────────────────────
function LiveDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10, alignItems: "center", justifyContent: "center" }}>
      <span style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: C.red, opacity: 0.35, animation: "ping 1.4s ease-in-out infinite" }} />
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, display: "block" }} />
    </span>
  );
}
function Badge({ label, color }) {
  return <span style={{ padding: "2px 8px", borderRadius: 3, background: color + "1A", color, fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", fontFamily: Fb, border: `1px solid ${color}35` }}>{label}</span>;
}
function Pill({ active, onClick, children }) {
  return <button onClick={onClick} style={{ padding: "7px 16px", borderRadius: 20, background: active ? C.accent : C.surface, border: `1px solid ${active ? C.accentBright : C.border}`, color: active ? "#fff" : C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: Fb, whiteSpace: "nowrap", transition: "all 0.15s" }}>{children}</button>;
}
function Skeleton({ h = 160 }) {
  return <div style={{ height: h, background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, animation: "pulse 1.5s infinite" }} />;
}
function SectionHead({ label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ width: 3, height: 22, background: color || C.accent, borderRadius: 2 }} />
      <span style={{ fontFamily: Fd, fontSize: 22, letterSpacing: "2px", color: C.text }}>{label}</span>
    </div>
  );
}

// ── Breaking Banner ───────────────────────────────────────────
function BreakingBanner({ items }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI(x => (x + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);
  if (!items.length) return null;
  return (
    <div style={{ background: C.red, padding: "10px 24px", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "2px", fontFamily: Fb, color: "#fff", background: "rgba(0,0,0,0.25)", padding: "3px 9px", borderRadius: 3, flexShrink: 0 }}>BREAKING</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: Fb, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{items[i]?.headline}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: Fb, flexShrink: 0 }}>{items[i]?.source} · {items[i]?.time}</span>
    </div>
  );
}

// ── Ticker ────────────────────────────────────────────────────
function Ticker({ tickers }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let x = 0, raf;
    const go = () => { x -= 0.6; if (x < -el.scrollWidth / 2) x = 0; el.style.transform = `translateX(${x}px)`; raf = requestAnimationFrame(go); };
    raf = requestAnimationFrame(go);
    return () => cancelAnimationFrame(raf);
  }, [tickers.length]);
  if (!tickers.length) return null;
  const doubled = [...tickers, ...tickers];
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 0", overflow: "hidden" }}>
      <div ref={ref} style={{ display: "flex", width: "max-content" }}>
        {doubled.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 24px", borderRight: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textDim, fontFamily: Fb, fontWeight: 700, whiteSpace: "nowrap" }}>{t.symbol}</span>
            <span style={{ fontSize: 14, color: C.text, fontFamily: Fb, fontWeight: 800, whiteSpace: "nowrap" }}>{t.value}</span>
            <span style={{ fontSize: 12, color: t.up ? C.green : C.red, fontFamily: Fb, fontWeight: 700, whiteSpace: "nowrap" }}>{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Score Card ────────────────────────────────────────────────
function ScoreCard({ game }) {
  const isLive = game.status === "live", isFinal = game.status === "final", hasScore = isLive || isFinal;
  const wA = isFinal && game.winner === game.awayTeam, wH = isFinal && game.winner === game.homeTeam;
  return (
    <div style={{ background: C.card, border: `1px solid ${isLive ? C.red + "70" : C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 140 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {isLive ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><LiveDot /><span style={{ fontSize: 10, color: C.red, fontWeight: 800, fontFamily: Fb, letterSpacing: "1px" }}>LIVE</span></div>
          : <span style={{ fontSize: 10, color: isFinal ? C.textDim : C.green, fontWeight: 700, fontFamily: Fb, letterSpacing: "1px" }}>{isFinal ? "FINAL" : "UPCOMING"}</span>}
        {game.tv && <span style={{ fontSize: 10, color: C.textDim, fontFamily: Fb }}>{game.tv}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: Fb, color: isFinal && !wA ? C.textMid : C.text }}>{game.awayTeam}</span>
          {hasScore && <span style={{ fontSize: 20, fontWeight: 900, fontFamily: Fb, color: isFinal && !wA ? C.textMid : C.text }}>{game.awayScore}</span>}
        </div>
        <div style={{ height: 1, background: C.border }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: Fb, color: isFinal && !wH ? C.textMid : C.text }}>{game.homeTeam}</span>
          {hasScore && <span style={{ fontSize: 20, fontWeight: 900, fontFamily: Fb, color: isFinal && !wH ? C.textMid : C.text }}>{game.homeScore}</span>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: isLive ? C.red : C.textDim, fontFamily: Fb, fontWeight: isLive ? 700 : 400 }}>{game.status === "upcoming" ? game.time : (game.period || "Final")}</span>
        {game.spread && <span style={{ fontSize: 10, color: C.accentBright, fontFamily: Fb, fontWeight: 600, background: C.accent + "18", padding: "2px 7px", borderRadius: 4 }}>{game.spread}</span>}
      </div>
    </div>
  );
}

// ── Market Card ───────────────────────────────────────────────
function MarketCard({ t }) {
  const accent = { index: C.cyan, crypto: C.accentBright, commodity: C.orange, bond: C.textMid, fx: "#88AAFF" }[t.type] || C.textMid;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}99, transparent)` }} />
      <div style={{ fontSize: 11, color: C.textDim, fontFamily: Fb, fontWeight: 700, marginBottom: 8 }}>{t.symbol}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: Fb, marginBottom: 5 }}>{t.value}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: t.up ? C.green : C.red, fontFamily: Fb }}>{t.change}</div>
    </div>
  );
}

// ── THE KEY COMPONENT: BulletSection ─────────────────────────
// Subscribes to the module-level cache for one specific headline.
// When the cache updates, this component re-renders independently.
// The parent never needs to know about bullet state at all.
function BulletSection({ headline, isSports }) {
  const [data, setData] = useState(() => CACHE[headline] || null);

  useEffect(() => {
    // Subscribe to future updates for this headline
    const unsub = subscribeBullets(headline, setData);
    // Kick off the fetch (no-op if already cached)
    fetchBulletsForHeadline(headline, isSports);
    // If it's already done by the time we mount, sync state
    if (CACHE[headline]) setData(CACHE[headline]);
    return unsub;
  }, [headline, isSports]);

  if (!data || data.status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 14, color: C.textMid, fontFamily: Fb, fontSize: 13 }}>
        <div style={{ width: 14, height: 14, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
        Generating analysis...
      </div>
    );
  }
  if (!data.bullets?.length) return null;
  return (
    <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 18, height: 18, borderRadius: 5, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 900, fontFamily: Fb }}>AI</span>
        </div>
        <span style={{ fontSize: 10, color: C.accentBright, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", fontFamily: Fb }}>Field Analysis</span>
      </div>
      {data.bullets.map((b, i) => {
        const m = BULLET_META[i] || BULLET_META[0];
        return (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: m.color, fontFamily: Fb, letterSpacing: "1px", background: m.color + "15", padding: "3px 6px", borderRadius: 3, border: `1px solid ${m.color}25`, flexShrink: 0, marginTop: 3 }}>{m.tag}</span>
            <span style={{ fontSize: 14, color: "#C0C0E0", lineHeight: 1.6, fontFamily: Fb }}>{b}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Headline Card — uses BulletSection ───────────────────────
function HeadlineCard({ item, rank, isSports }) {
  const league  = isSports ? LEAGUES.find(l => l.id === item.league) : null;
  const cat     = !isSports ? NEWS_CATS.find(c => c.id === item.category) : null;
  const typeCfg = isSports ? (TYPE_CFG[item.type] || TYPE_CFG.storyline) : null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
      {rank === 1 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.orange}, transparent)` }} />}
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        {rank != null && (
          <div style={{ flexShrink: 0, fontFamily: Fd, fontSize: 44, lineHeight: 1, color: rank === 1 ? C.gold : C.borderBright, letterSpacing: "-2px", minWidth: 48 }}>
            {String(rank).padStart(2, "0")}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 11, flexWrap: "wrap" }}>
            {typeCfg  && <Badge label={typeCfg.label}               color={typeCfg.color} />}
            {cat      && <Badge label={`${cat.emoji} ${cat.label}`}  color={cat.color} />}
            {item.breaking && <Badge label="🔴 BREAKING" color={C.red} />}
            {league   && <span style={{ fontSize: 13, color: league.color, fontFamily: Fb, fontWeight: 700 }}>{league.emoji} {league.name}</span>}
            {item.region && <span style={{ fontSize: 12, color: C.textDim, fontFamily: Fb }}>{item.region}</span>}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1.45, fontFamily: Fb, marginBottom: 10 }}>{item.headline}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: C.textMid, fontFamily: Fb }}>via <span style={{ color: "#9898C0", fontWeight: 600 }}>{item.source}</span></span>
            <span style={{ color: C.textDim }}>·</span>
            <span style={{ fontSize: 13, color: C.textDim, fontFamily: Fb }}>{item.time}</span>
            {item.team && <><span style={{ color: C.textDim }}>·</span><span style={{ fontSize: 13, color: C.textDim, fontFamily: Fb }}>{item.team}</span></>}
          </div>
          {/* Bullets live right here, under the headline */}
          <BulletSection headline={item.headline} isSports={isSports} />
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function FieldApp() {
  const [tab,        setTab]        = useState("sports");
  const [league,     setLeague]     = useState("nba");
  const [section,    setSection]    = useState("scores");
  const [catFilter,  setCatFilter]  = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [worldNews,  setWorldNews]  = useState([]);
  const [sportsNews, setSportsNews] = useState({});
  const [games,      setGames]      = useState({});
  const [tickers,    setTickers]    = useState([]);
  const [loading,    setLoading]    = useState({ news: true, sports: true });

  useEffect(() => {
    fetch("/api/news").then(r => r.json()).then(d => {
      setWorldNews(d.articles || []);
      setLoading(p => ({ ...p, news: false }));
    }).catch(() => setLoading(p => ({ ...p, news: false })));
  }, []);

  useEffect(() => {
    const load = () => fetch("/api/markets").then(r => r.json()).then(d => setTickers(d.tickers || [])).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (tab !== "sports") return;
    setLoading(p => ({ ...p, sports: true }));
    Promise.all([
      fetch(`/api/sports?league=${league}&type=scores`).then(r => r.json()),
      fetch(`/api/sports?league=${league}&type=news`).then(r => r.json()),
    ]).then(([s, n]) => {
      setGames(prev => ({ ...prev, [league]: s.games || [] }));
      setSportsNews(prev => ({ ...prev, [league]: n.news || [] }));
      setLoading(p => ({ ...p, sports: false }));
    }).catch(() => setLoading(p => ({ ...p, sports: false })));
  }, [tab, league]);

  const activeLeague = LEAGUES.find(l => l.id === league);
  const leagueGames  = (games[league] || []).filter(g => gameFilter === "all" || g.status === gameFilter);
  const leagueNews   = sportsNews[league] || [];
  const liveCount    = (games[league] || []).filter(g => g.status === "live").length;
  const visWorld     = catFilter === "all" ? worldNews : worldNews.filter(h => h.category === catFilter);
  const topWorld     = visWorld.filter(h => h.rank).sort((a, b) => a.rank - b.rank);
  const moreWorld    = visWorld.filter(h => !h.rank);
  const breaking     = worldNews.filter(h => h.breaking).slice(0, 3);
  const mktNews      = worldNews.filter(h => ["markets","geo"].includes(h.category));

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ flex: 1, padding: "18px 8px", border: "none", background: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: tab === id ? C.text : C.textMid, borderBottom: tab === id ? `3px solid ${id === "sports" ? (activeLeague?.color || C.accent) : id === "news" ? C.red : C.green}` : "3px solid transparent", fontFamily: Fb, transition: "all 0.15s" }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{`
        @keyframes ping  { 0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(2);opacity:0} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.45} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${C.surface}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
      `}</style>

      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 12px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: Fd, fontSize: 32, letterSpacing: "4px", color: C.text, lineHeight: 1 }}>FIELD</span>
              <span style={{ fontSize: 10, color: C.accent, fontWeight: 800, letterSpacing: "4px", fontFamily: Fb, textTransform: "uppercase" }}>Intelligence</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {breaking.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><LiveDot /><span style={{ fontSize: 11, color: C.red, fontWeight: 800, fontFamily: Fb, letterSpacing: "1px" }}>BREAKING</span></div>}
              <span style={{ fontSize: 13, color: C.textDim, fontFamily: Fb }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
          </div>
          <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
            <TabBtn id="sports" label="🏆 Sports" />
            <TabBtn id="news"   label="🌍 News" />
            <TabBtn id="markets" label="📈 Markets" />
          </div>
        </div>
      </header>

      {breaking.length > 0 && (tab === "news" || tab === "markets") && <BreakingBanner items={breaking} />}
      {tickers.length > 0 && <Ticker tickers={tickers} />}

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "30px 24px 80px" }}>

        {/* SPORTS */}
        {tab === "sports" && (
          <div>
            <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${C.border}`, marginBottom: 22 }}>
              {LEAGUES.map(l => (
                <button key={l.id} onClick={() => setLeague(l.id)} style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: league === l.id ? 800 : 500, color: league === l.id ? C.text : C.textMid, borderBottom: league === l.id ? `2px solid ${l.color}` : "2px solid transparent", whiteSpace: "nowrap", fontFamily: Fb, transition: "all 0.15s" }}>
                  {l.emoji} {l.name}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
              <Pill active={section === "scores"} onClick={() => setSection("scores")}>
                🎮 Scores {liveCount > 0 && <span style={{ marginLeft: 6, background: C.red, color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{liveCount} LIVE</span>}
              </Pill>
              <Pill active={section === "news"} onClick={() => setSection("news")}>📰 Transactions & News</Pill>
            </div>

            {section === "scores" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                  {["all","live","upcoming","final"].map(v => (
                    <Pill key={v} active={gameFilter === v} onClick={() => setGameFilter(v)}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                      {v === "live" && liveCount > 0 && <span style={{ marginLeft: 4, background: C.red, color: "#fff", borderRadius: 8, padding: "1px 5px", fontSize: 9 }}>{liveCount}</span>}
                    </Pill>
                  ))}
                </div>
                {loading.sports
                  ? <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>{[1,2,3,4].map(i => <Skeleton key={i} h={140} />)}</div>
                  : leagueGames.length === 0
                    ? <div style={{ padding: "50px 0", textAlign: "center", color: C.textDim, fontFamily: Fb }}>No games scheduled</div>
                    : <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>{leagueGames.map(g => <ScoreCard key={g.id} game={g} />)}</div>
                }
              </div>
            )}

            {section === "news" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {loading.sports
                  ? [1,2,3].map(i => <Skeleton key={i} />)
                  : leagueNews.length === 0
                    ? <div style={{ padding: "50px 0", textAlign: "center", color: C.textDim, fontFamily: Fb }}>No stories right now</div>
                    : leagueNews.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank} isSports={true} />)
                }
              </div>
            )}
          </div>
        )}

        {/* NEWS */}
        {tab === "news" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 26, flexWrap: "wrap" }}>
              <Pill active={catFilter === "all"} onClick={() => setCatFilter("all")}>All</Pill>
              {NEWS_CATS.map(c => <Pill key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>{c.emoji} {c.label}</Pill>)}
            </div>
            {loading.news ? [1,2,3].map(i => <Skeleton key={i} h={200} />) : (
              <>
                {topWorld.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <SectionHead label="TOP STORIES" color={C.gold} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {topWorld.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank} isSports={false} />)}
                    </div>
                  </div>
                )}
                {moreWorld.length > 0 && (
                  <div style={{ marginTop: 32 }}>
                    <SectionHead label="MORE STORIES" color={C.borderBright} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {moreWorld.map(item => <HeadlineCard key={item.id} item={item} rank={null} isSports={false} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* MARKETS */}
        {tab === "markets" && (
          <div>
            <div style={{ marginBottom: 36 }}>
              <SectionHead label="LIVE MARKETS" color={C.green} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                {(tickers.length > 0 ? tickers : Array(10).fill(null)).map((t, i) =>
                  t ? <MarketCard key={i} t={t} /> : <Skeleton key={i} h={90} />
                )}
              </div>
            </div>
            <SectionHead label="MOVING MARKETS" color={C.green} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mktNews.length === 0
                ? [1,2].map(i => <Skeleton key={i} />)
                : mktNews.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank || null} isSports={false} />)
              }
            </div>
          </div>
        )}

        <div style={{ marginTop: 64, paddingTop: 22, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: Fd, fontSize: 18, letterSpacing: "3px", color: C.textDim }}>FIELD</span>
          <span style={{ fontSize: 13, color: C.textDim, fontFamily: Fb }}>Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </main>
    </div>
  );
}
