"use client";
import { useState, useEffect, useRef } from "react";

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
  { id: "nba",     name: "NBA",     emoji: "🏀", color: "#E8112D" },
  { id: "nfl",     name: "NFL",     emoji: "🏈", color: "#4A90D9" },
  { id: "mlb",     name: "MLB",     emoji: "⚾", color: "#00A651" },
  { id: "nhl",     name: "NHL",     emoji: "🏒", color: "#A8B8CC" },
  { id: "soccer",  name: "Soccer",  emoji: "⚽", color: "#00D4AA" },
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

// ── Team Logo ─────────────────────────────────────────────────
function TeamLogo({ logo, abbr, color, size = 32 }) {
  const [err, setErr] = useState(false);
  if (logo && !err) {
    return (
      <img
        src={logo}
        alt={abbr}
        width={size}
        height={size}
        onError={() => setErr(true)}
        style={{ objectFit: "contain", flexShrink: 0 }}
      />
    );
  }
  // Fallback: colored circle with abbr
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: (color || C.borderBright) + "33", border: `1px solid ${color || C.borderBright}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.28, fontWeight: 800, color: color || C.textMid, fontFamily: Fb }}>{abbr?.slice(0, 3)}</span>
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

// ── Game Detail Modal ─────────────────────────────────────────
function GameModal({ game, league, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sports?league=${league}&type=detail&gameId=${game.id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [game.id, league]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: C.surface, border: `1px solid ${C.borderBright}`, borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "85vh", overflow: "auto", padding: 28 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={40} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: Fd, fontSize: 28, color: C.text, letterSpacing: "1px" }}>
                {game.awayScore ?? "-"} — {game.homeScore ?? "-"}
              </div>
              <div style={{ fontSize: 11, color: game.status === "live" ? C.red : C.textMid, fontFamily: Fb, fontWeight: 700, letterSpacing: "1px" }}>
                {game.status === "live" ? `🔴 ${game.period}` : game.status === "final" ? "FINAL" : game.time}
              </div>
            </div>
            <TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={40} />
          </div>
          <button onClick={onClose} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", color: C.textMid, cursor: "pointer", fontSize: 13, fontFamily: Fb }}>✕ Close</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.textMid, fontFamily: Fb, padding: "20px 0" }}>
            <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            Loading stats...
          </div>
        ) : !detail?.teamStats?.length ? (
          <div style={{ color: C.textDim, fontFamily: Fb, textAlign: "center", padding: "30px 0" }}>
            Stats not available yet
          </div>
        ) : (
          <div>
            {/* Team Stats */}
            {detail.teamStats?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.accentBright, letterSpacing: "2px", fontFamily: Fb, marginBottom: 14, textTransform: "uppercase" }}>Team Stats</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {detail.teamStats.map((t, ti) => (
                    <div key={ti} style={{ background: C.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.text, fontFamily: Fb, marginBottom: 12 }}>{t.team}</div>
                      {t.stats.map((s, si) => (
                        <div key={si} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: C.textMid, fontFamily: Fb }}>{s.name}</span>
                          <span style={{ fontSize: 12, color: C.text, fontFamily: Fb, fontWeight: 600 }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Player Stats */}
            {detail.playerStats?.map((t, ti) => t.players?.length > 0 && (
              <div key={ti} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.accentBright, letterSpacing: "2px", fontFamily: Fb, marginBottom: 12, textTransform: "uppercase" }}>{t.team} Players</div>
                <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  {t.players.map((p, pi) => (
                    <div key={pi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: pi < t.players.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: Fb }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: C.textMid, fontFamily: Fb, marginLeft: 8 }}>{p.position}</span>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        {p.stats.filter(s => s.value && s.value !== "0").slice(0, 4).map((s, si) => (
                          <div key={si} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: Fb }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: Fb }}>{s.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Top Performers Section ────────────────────────────────────
function TopPerformersSection({ games }) {
  // Collect all performers across all games that have scores
  const activeGames = games.filter(g => g.status === "live" || g.status === "final");
  if (!activeGames.length) return null;

  // Build a flat list: each game's performers, grouped by game
  const hasAny = activeGames.some(g => g.topPerformers?.length > 0);
  if (!hasAny) return null;

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ width: 3, height: 22, background: C.gold, borderRadius: 2 }} />
        <span style={{ fontFamily: Fd, fontSize: 22, letterSpacing: "2px", color: C.text }}>TOP PERFORMERS</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {activeGames.map(game => {
          if (!game.topPerformers?.length) return null;
          return (
            <div key={game.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 22px" }}>
              {/* Game label */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={20} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.textMid, fontFamily: Fb }}>{game.awayTeam}</span>
                </div>
                <span style={{ fontSize: 12, color: C.textDim, fontFamily: Fb }}>
                  {game.awayScore != null ? `${game.awayScore} - ${game.homeScore}` : "vs"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={20} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.textMid, fontFamily: Fb }}>{game.homeTeam}</span>
                </div>
                {game.status === "live" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                    <LiveDot />
                    <span style={{ fontSize: 10, color: C.red, fontWeight: 800, fontFamily: Fb }}>{game.period}</span>
                  </div>
                )}
                {game.status === "final" && <span style={{ fontSize: 10, color: C.textDim, fontFamily: Fb, marginLeft: "auto", fontWeight: 700 }}>FINAL</span>}
              </div>

              {/* Performers grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {game.topPerformers.slice(0, 5).map((p, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: 8, padding: "12px 10px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: i === 0 ? C.gold : C.text, fontFamily: Fb, lineHeight: 1, marginBottom: 4 }}>{p.value}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: C.accentBright, fontFamily: Fb, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>{p.stat}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: Fb, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.textDim, fontFamily: Fb }}>{p.team}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Score Card — with logos + top performers ──────────────────
function ScoreCard({ game, onSelect }) {
  const isLive  = game.status === "live";
  const isFinal = game.status === "final";
  const hasScore = isLive || isFinal;
  const wA = isFinal && game.winner === game.awayTeam;
  const wH = isFinal && game.winner === game.homeTeam;

  return (
    <div
      onClick={() => onSelect(game)}
      style={{ background: C.card, border: `1px solid ${isLive ? C.red + "70" : C.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", transition: "border-color 0.2s, background 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#16162A"}
      onMouseLeave={e => e.currentTarget.style.background = C.card}
    >
      {/* Status row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isLive
          ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><LiveDot /><span style={{ fontSize: 10, color: C.red, fontWeight: 800, fontFamily: Fb, letterSpacing: "1px" }}>LIVE</span></div>
          : <span style={{ fontSize: 10, color: isFinal ? C.textDim : C.green, fontWeight: 700, fontFamily: Fb, letterSpacing: "1px" }}>{isFinal ? "FINAL" : "UPCOMING"}</span>
        }
        {game.tv && <span style={{ fontSize: 10, color: C.textDim, fontFamily: Fb }}>{game.tv}</span>}
      </div>

      {/* Teams + scores */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Away */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={28} />
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: Fb, color: isFinal && !wA ? C.textMid : C.text }}>{game.awayTeam}</span>
          </div>
          {hasScore && <span style={{ fontSize: 22, fontWeight: 900, fontFamily: Fb, color: isFinal && !wA ? C.textMid : C.text, lineHeight: 1 }}>{game.awayScore}</span>}
        </div>
        <div style={{ height: 1, background: C.border }} />
        {/* Home */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={28} />
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: Fb, color: isFinal && !wH ? C.textMid : C.text }}>{game.homeTeam}</span>
          </div>
          {hasScore && <span style={{ fontSize: 22, fontWeight: 900, fontFamily: Fb, color: isFinal && !wH ? C.textMid : C.text, lineHeight: 1 }}>{game.homeScore}</span>}
        </div>
      </div>

      {/* Period + spread */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <span style={{ fontSize: 11, color: isLive ? C.red : C.textDim, fontFamily: Fb, fontWeight: isLive ? 700 : 400 }}>
          {game.status === "upcoming" ? game.time : (game.period || "Final")}
        </span>
        {game.spread && <span style={{ fontSize: 10, color: C.accentBright, fontFamily: Fb, fontWeight: 600, background: C.accent + "18", padding: "2px 7px", borderRadius: 4 }}>{game.spread}</span>}
      </div>

      {/* Tap hint */}
      <div style={{ textAlign: "center", fontSize: 10, color: C.textDim, fontFamily: Fb }}>Tap for full stats →</div>
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

// ── Headline Card ─────────────────────────────────────────────
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
  const [selectedGame, setSelectedGame] = useState(null);

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

      {selectedGame && <GameModal game={selectedGame} league={league} onClose={() => setSelectedGame(null)} />}

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
                  ? <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>{[1,2,3].map(i => <Skeleton key={i} h={200} />)}</div>
                  : leagueGames.length === 0
                    ? <div style={{ padding: "50px 0", textAlign: "center", color: C.textDim, fontFamily: Fb }}>No games scheduled</div>
                    : <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                          {leagueGames.map(g => <ScoreCard key={g.id} game={g} onSelect={setSelectedGame} />)}
                        </div>
                        <TopPerformersSection games={leagueGames} />
                      </>
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
            {loading.news ? [1,2,3].map(i => <Skeleton key={i} h={160} />) : (
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
