"use client";
import { useState, useEffect, useRef } from "react";

// ── Design ────────────────────────────────────────────────────
const C = {
  bg:          "#05050D",
  surface:     "#0A0A16",
  card:        "#0F0F1E",
  cardHover:   "#141428",
  border:      "#1A1A2E",
  borderBright:"#252540",
  text:        "#EEEEFF",
  textMid:     "#8080A8",
  textDim:     "#383854",
  accent:      "#7C6FFF",
  accentBright:"#A89DFF",
  green:       "#00E5B8",
  red:         "#FF2952",
  orange:      "#FF6B2B",
  gold:        "#FFD60A",
  cyan:        "#00C2D4",
};
const Fb = `'Inter', system-ui, sans-serif`;
const Fd = `'Bebas Neue', 'Arial Black', sans-serif`;

const LEAGUES = [
  { id: "nba",     name: "NBA",     emoji: "🏀", color: "#E8112D" },
  { id: "nfl",     name: "NFL",     emoji: "🏈", color: "#4A90D9" },
  { id: "mlb",     name: "MLB",     emoji: "⚾", color: "#00A651" },
  { id: "nhl",     name: "NHL",     emoji: "🏒", color: "#A8B8CC" },
  { id: "soccer",  name: "Soccer",  emoji: "⚽", color: "#00E5B8" },
  { id: "college", name: "College", emoji: "🎓", color: "#FF6B2B" },
];
const NEWS_CATS = [
  { id: "geo",      label: "Geopolitics", emoji: "🌍", color: "#FF2952" },
  { id: "markets",  label: "Economy",     emoji: "📈", color: "#00E5B8" },
  { id: "politics", label: "Politics",    emoji: "🏛️",  color: "#4A90D9" },
  { id: "tech",     label: "Tech & AI",   emoji: "⚡", color: "#A89DFF" },
];
const TYPE_CFG = {
  trade:     { label: "TRADE",   color: "#FF6B2B" },
  injury:    { label: "INJURY",  color: "#FF2952" },
  signing:   { label: "SIGNING", color: "#00E5B8" },
  storyline: { label: "NEWS",    color: "#A89DFF" },
  roster:    { label: "ROSTER",  color: "#FFD60A" },
  news:      { label: "NEWS",    color: "#A89DFF" },
  award:     { label: "AWARD",   color: "#FFD60A" },
};

// ── Base components ───────────────────────────────────────────
function LiveDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 12, height: 12, alignItems: "center", justifyContent: "center" }}>
      <span style={{ position: "absolute", width: 12, height: 12, borderRadius: "50%", background: C.red, opacity: 0.3, animation: "ping 1.4s ease-in-out infinite" }} />
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, display: "block" }} />
    </span>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ padding: "3px 9px", borderRadius: 4, background: color + "20", color, fontSize: 11, fontWeight: 800, letterSpacing: "1px", fontFamily: Fb, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 20px", borderRadius: 24,
      background: active ? C.accent : C.surface,
      border: `1px solid ${active ? C.accentBright : C.border}`,
      color: active ? "#fff" : C.textMid,
      fontSize: 14, fontWeight: 600, cursor: "pointer",
      fontFamily: Fb, whiteSpace: "nowrap", transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

function Skeleton({ h = 180 }) {
  return <div style={{ height: h, background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, animation: "pulse 1.5s infinite" }} />;
}

function SectionHead({ label, color, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 4, height: 26, background: color || C.accent, borderRadius: 2 }} />
        <span style={{ fontFamily: Fd, fontSize: 26, letterSpacing: "2.5px", color: C.text, lineHeight: 1 }}>{label}</span>
      </div>
      {sub && <span style={{ fontSize: 13, color: C.textDim, fontFamily: Fb }}>{sub}</span>}
    </div>
  );
}

// ── Team Logo ─────────────────────────────────────────────────
function TeamLogo({ logo, abbr, color, size = 32 }) {
  const [err, setErr] = useState(false);
  if (logo && !err) {
    return <img src={logo} alt={abbr} width={size} height={size} onError={() => setErr(true)} style={{ objectFit: "contain", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: (color || C.borderBright) + "30", border: `1px solid ${color || C.borderBright}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.3, fontWeight: 800, color: color || C.textMid, fontFamily: Fb }}>{abbr?.slice(0, 3)}</span>
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
    <div style={{ background: `linear-gradient(90deg, ${C.red}EE, #CC1040EE)`, padding: "12px 28px", display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "2px", fontFamily: Fb, color: "#fff", background: "rgba(0,0,0,0.3)", padding: "4px 10px", borderRadius: 4, flexShrink: 0 }}>🔴 BREAKING</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: Fb, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{items[i]?.headline}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: Fb, flexShrink: 0 }}>{items[i]?.source} · {items[i]?.time}</span>
    </div>
  );
}

// ── Ticker ────────────────────────────────────────────────────
function Ticker({ tickers }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let x = 0, raf;
    const go = () => { x -= 0.7; if (x < -el.scrollWidth / 2) x = 0; el.style.transform = `translateX(${x}px)`; raf = requestAnimationFrame(go); };
    raf = requestAnimationFrame(go);
    return () => cancelAnimationFrame(raf);
  }, [tickers.length]);
  if (!tickers.length) return null;
  const doubled = [...tickers, ...tickers];
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "11px 0", overflow: "hidden" }}>
      <div ref={ref} style={{ display: "flex", width: "max-content" }}>
        {doubled.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 28px", borderRight: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textDim, fontFamily: Fb, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>{t.symbol}</span>
            <span style={{ fontSize: 15, color: C.text, fontFamily: Fb, fontWeight: 800, whiteSpace: "nowrap" }}>{t.value}</span>
            <span style={{ fontSize: 13, color: t.up ? C.green : C.red, fontFamily: Fb, fontWeight: 700, whiteSpace: "nowrap" }}>{t.change}</span>
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
      .then(r => r.json()).then(d => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [game.id, league]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: C.surface, border: `1px solid ${C.borderBright}`, borderRadius: 20, width: "100%", maxWidth: 720, maxHeight: "88vh", overflow: "auto", padding: 32 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={44} />
              <span style={{ fontFamily: Fd, fontSize: 20, color: C.text, letterSpacing: "1px" }}>{game.awayTeam}</span>
            </div>
            <div style={{ textAlign: "center", padding: "0 16px" }}>
              <div style={{ fontFamily: Fd, fontSize: 36, color: C.text, letterSpacing: "2px", lineHeight: 1 }}>
                {game.awayScore ?? "–"} <span style={{ color: C.textDim }}>–</span> {game.homeScore ?? "–"}
              </div>
              <div style={{ fontSize: 12, color: game.status === "live" ? C.red : C.textMid, fontFamily: Fb, fontWeight: 700, letterSpacing: "1px", marginTop: 4 }}>
                {game.status === "live" ? `🔴 ${game.period}` : game.status === "final" ? "FINAL" : game.time}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: Fd, fontSize: 20, color: C.text, letterSpacing: "1px" }}>{game.homeTeam}</span>
              <TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={44} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 16px", color: C.textMid, cursor: "pointer", fontSize: 14, fontFamily: Fb }}>✕ Close</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: C.textMid, fontFamily: Fb, fontSize: 15, padding: "24px 0" }}>
            <div style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            Loading stats...
          </div>
        ) : !detail?.teamStats?.length ? (
          <div style={{ color: C.textDim, fontFamily: Fb, textAlign: "center", padding: "40px 0", fontSize: 15 }}>Stats not available yet</div>
        ) : (
          <div>
            {detail.teamStats?.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.accentBright, letterSpacing: "2px", fontFamily: Fb, marginBottom: 16, textTransform: "uppercase" }}>Team Stats</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {detail.teamStats.map((t, ti) => (
                    <div key={ti} style={{ background: C.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: Fb, marginBottom: 14 }}>{t.team}</div>
                      {t.stats.map((s, si) => (
                        <div key={si} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, color: C.textMid, fontFamily: Fb }}>{s.name}</span>
                          <span style={{ fontSize: 13, color: C.text, fontFamily: Fb, fontWeight: 700 }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detail.playerStats?.map((t, ti) => t.players?.length > 0 && (
              <div key={ti} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.accentBright, letterSpacing: "2px", fontFamily: Fb, marginBottom: 14, textTransform: "uppercase" }}>{t.team} Players</div>
                <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  {t.players.map((p, pi) => (
                    <div key={pi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: pi < t.players.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: Fb }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: C.textMid, fontFamily: Fb, marginLeft: 10 }}>{p.position}</span>
                      </div>
                      <div style={{ display: "flex", gap: 20 }}>
                        {p.stats.filter(s => s.value && s.value !== "0").slice(0, 4).map((s, si) => (
                          <div key={si} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: Fb }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: C.textDim, fontFamily: Fb }}>{s.name}</div>
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

// ── Top Performers ────────────────────────────────────────────
function TopPerformersSection({ games }) {
  const activeGames = games.filter(g => (g.status === "live" || g.status === "final") && g.topPerformers?.length > 0);
  if (!activeGames.length) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <SectionHead label="TOP PERFORMERS" color={C.gold} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {activeGames.map(game => (
          <div key={game.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
            {/* Game header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={24} />
                <span style={{ fontSize: 15, fontWeight: 800, color: C.textMid, fontFamily: Fb }}>{game.awayTeam}</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 900, color: C.text, fontFamily: Fd, letterSpacing: "1px" }}>
                {game.awayScore != null ? `${game.awayScore} — ${game.homeScore}` : "vs"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.textMid, fontFamily: Fb }}>{game.homeTeam}</span>
                <TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={24} />
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                {game.status === "live" ? <><LiveDot /><span style={{ fontSize: 12, color: C.red, fontWeight: 800, fontFamily: Fb, letterSpacing: "1px" }}>{game.period}</span></> : <span style={{ fontSize: 12, color: C.textDim, fontFamily: Fb, fontWeight: 700, letterSpacing: "1px" }}>FINAL</span>}
              </div>
            </div>
            {/* Performers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {game.topPerformers.slice(0, 5).map((p, i) => (
                <div key={i} style={{ background: C.surface, borderRadius: 10, padding: "16px 12px", border: `1px solid ${i === 0 ? C.gold + "50" : C.border}`, textAlign: "center", position: "relative", overflow: "hidden" }}>
                  {i === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />}
                  <div style={{ fontSize: 28, fontWeight: 900, color: i === 0 ? C.gold : C.text, fontFamily: Fd, letterSpacing: "1px", lineHeight: 1, marginBottom: 4 }}>{p.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.accentBright, fontFamily: Fb, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>{p.stat}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: Fb, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: Fb }}>{p.team}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Score Card ────────────────────────────────────────────────
function ScoreCard({ game, onSelect }) {
  const isLive  = game.status === "live";
  const isFinal = game.status === "final";
  const hasScore = isLive || isFinal;
  const wA = isFinal && game.winner === game.awayTeam;
  const wH = isFinal && game.winner === game.homeTeam;
  return (
    <div
      onClick={() => onSelect(game)}
      style={{ background: C.card, border: `1px solid ${isLive ? C.red + "80" : C.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14, cursor: "pointer", transition: "all 0.15s", boxShadow: isLive ? `0 0 24px ${C.red}18` : "none" }}
      onMouseEnter={e => { e.currentTarget.style.background = C.cardHover; e.currentTarget.style.borderColor = isLive ? C.red : C.borderBright; }}
      onMouseLeave={e => { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = isLive ? C.red + "80" : C.border; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isLive
          ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><LiveDot /><span style={{ fontSize: 11, color: C.red, fontWeight: 800, fontFamily: Fb, letterSpacing: "1px" }}>LIVE</span></div>
          : <span style={{ fontSize: 11, color: isFinal ? C.textDim : C.green, fontWeight: 700, fontFamily: Fb, letterSpacing: "1px" }}>{isFinal ? "FINAL" : "UPCOMING"}</span>
        }
        {game.tv && <span style={{ fontSize: 11, color: C.textDim, fontFamily: Fb }}>{game.tv}</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={32} />
            <span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fb, color: isFinal && !wA ? C.textMid : C.text }}>{game.awayTeam}</span>
          </div>
          {hasScore && <span style={{ fontSize: 26, fontWeight: 900, fontFamily: Fb, color: isFinal && !wA ? C.textMid : C.text, lineHeight: 1 }}>{game.awayScore}</span>}
        </div>
        <div style={{ height: 1, background: C.border }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={32} />
            <span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fb, color: isFinal && !wH ? C.textMid : C.text }}>{game.homeTeam}</span>
          </div>
          {hasScore && <span style={{ fontSize: 26, fontWeight: 900, fontFamily: Fb, color: isFinal && !wH ? C.textMid : C.text, lineHeight: 1 }}>{game.homeScore}</span>}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 12, color: isLive ? C.red : C.textDim, fontFamily: Fb, fontWeight: isLive ? 700 : 400 }}>
          {game.status === "upcoming" ? game.time : (game.period || "Final")}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {game.spread && <span style={{ fontSize: 11, color: C.accentBright, fontFamily: Fb, fontWeight: 600, background: C.accent + "18", padding: "3px 8px", borderRadius: 5 }}>{game.spread}</span>}
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: Fb }}>Box score →</span>
        </div>
      </div>
    </div>
  );
}

// ── Market Card ───────────────────────────────────────────────
function MarketCard({ t }) {
  const accent = { index: C.cyan, crypto: C.accentBright, commodity: C.orange, bond: C.textMid, fx: "#88AAFF" }[t.type] || C.textMid;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}CC, transparent)` }} />
      <div style={{ fontSize: 12, color: C.textDim, fontFamily: Fb, fontWeight: 700, marginBottom: 10, letterSpacing: "0.5px" }}>{t.symbol}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: Fb, marginBottom: 6, letterSpacing: "-0.5px" }}>{t.value}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: t.up ? C.green : C.red, fontFamily: Fb }}>{t.change}</div>
    </div>
  );
}

// ── Headline Card ─────────────────────────────────────────────
function HeadlineCard({ item, rank, isSports }) {
  const league  = isSports ? LEAGUES.find(l => l.id === item.league) : null;
  const cat     = !isSports ? NEWS_CATS.find(c => c.id === item.category) : null;
  const typeCfg = isSports ? (TYPE_CFG[item.type] || TYPE_CFG.storyline) : null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 28px", position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}>
      {rank === 1 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.orange}, transparent)` }} />}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {rank != null && (
          <div style={{ flexShrink: 0, fontFamily: Fd, fontSize: 52, lineHeight: 1, color: rank === 1 ? C.gold : C.borderBright, letterSpacing: "-2px", minWidth: 56 }}>
            {String(rank).padStart(2, "0")}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            {typeCfg  && <Badge label={typeCfg.label}               color={typeCfg.color} />}
            {cat      && <Badge label={`${cat.emoji} ${cat.label}`}  color={cat.color} />}
            {item.breaking && <Badge label="🔴 BREAKING" color={C.red} />}
            {league   && <span style={{ fontSize: 14, color: league.color, fontFamily: Fb, fontWeight: 700 }}>{league.emoji} {league.name}</span>}
            {item.region && <span style={{ fontSize: 13, color: C.textDim, fontFamily: Fb }}>{item.region}</span>}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1.45, fontFamily: Fb, marginBottom: 12, letterSpacing: "-0.3px" }}>
            {item.headline}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: C.textMid, fontFamily: Fb }}>via <span style={{ color: "#9898C8", fontWeight: 600 }}>{item.source}</span></span>
            <span style={{ color: C.textDim }}>·</span>
            <span style={{ fontSize: 14, color: C.textDim, fontFamily: Fb }}>{item.time}</span>
            {item.team && <><span style={{ color: C.textDim }}>·</span><span style={{ fontSize: 14, color: C.textDim, fontFamily: Fb }}>{item.team}</span></>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function FieldApp() {
  const [tab,          setTab]          = useState("sports");
  const [league,       setLeague]       = useState("nba");
  const [section,      setSection]      = useState("scores");
  const [catFilter,    setCatFilter]    = useState("all");
  const [gameFilter,   setGameFilter]   = useState("all");
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
  const mktNews      = worldNews.filter(h => ["markets", "geo"].includes(h.category));

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: "20px 8px", border: "none", background: "none", cursor: "pointer",
      fontSize: 16, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
      color: tab === id ? C.text : C.textMid,
      borderBottom: tab === id ? `3px solid ${id === "sports" ? (activeLeague?.color || C.accent) : id === "news" ? C.red : C.green}` : "3px solid transparent",
      fontFamily: Fb, transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{`
        @keyframes ping  { 0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(2.2);opacity:0} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${C.surface}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        button { transition: all 0.15s; }
      `}</style>

      {selectedGame && <GameModal game={selectedGame} league={league} onClose={() => setSelectedGame(null)} />}

      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0 14px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: Fd, fontSize: 36, letterSpacing: "5px", color: C.text, lineHeight: 1 }}>FIELD</span>
              <span style={{ fontSize: 11, color: C.accent, fontWeight: 800, letterSpacing: "4px", fontFamily: Fb, textTransform: "uppercase" }}>Intelligence</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {breaking.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <LiveDot />
                  <span style={{ fontSize: 12, color: C.red, fontWeight: 800, fontFamily: Fb, letterSpacing: "1px" }}>BREAKING</span>
                </div>
              )}
              <span style={{ fontSize: 14, color: C.textDim, fontFamily: Fb }}>
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
            <TabBtn id="sports"  label="🏆 Sports" />
            <TabBtn id="news"    label="🌍 News" />
            <TabBtn id="markets" label="📈 Markets" />
          </div>
        </div>
      </header>

      {breaking.length > 0 && (tab === "news" || tab === "markets") && <BreakingBanner items={breaking} />}
      {tickers.length > 0 && <Ticker tickers={tickers} />}

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px 100px" }}>

        {/* ── SPORTS ── */}
        {tab === "sports" && (
          <div>
            <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${C.border}`, marginBottom: 26 }}>
              {LEAGUES.map(l => (
                <button key={l.id} onClick={() => setLeague(l.id)} style={{
                  padding: "12px 22px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 15, fontWeight: league === l.id ? 800 : 500,
                  color: league === l.id ? C.text : C.textMid,
                  borderBottom: league === l.id ? `3px solid ${l.color}` : "3px solid transparent",
                  whiteSpace: "nowrap", fontFamily: Fb, transition: "all 0.15s",
                }}>
                  {l.emoji} {l.name}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 26 }}>
              <Pill active={section === "scores"} onClick={() => setSection("scores")}>
                🎮 Scores {liveCount > 0 && <span style={{ marginLeft: 8, background: C.red, color: "#fff", borderRadius: 10, padding: "2px 7px", fontSize: 11, fontWeight: 800 }}>{liveCount} LIVE</span>}
              </Pill>
              <Pill active={section === "news"} onClick={() => setSection("news")}>📰 Transactions & News</Pill>
            </div>

            {section === "scores" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
                  {["all","live","upcoming","final"].map(v => (
                    <Pill key={v} active={gameFilter === v} onClick={() => setGameFilter(v)}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                      {v === "live" && liveCount > 0 && <span style={{ marginLeft: 6, background: C.red, color: "#fff", borderRadius: 8, padding: "1px 6px", fontSize: 10 }}>{liveCount}</span>}
                    </Pill>
                  ))}
                </div>
                {loading.sports
                  ? <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>{[1,2,3].map(i => <Skeleton key={i} h={200} />)}</div>
                  : leagueGames.length === 0
                    ? <div style={{ padding: "60px 0", textAlign: "center", color: C.textDim, fontFamily: Fb, fontSize: 16 }}>No games scheduled</div>
                    : <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                          {leagueGames.map(g => <ScoreCard key={g.id} game={g} onSelect={setSelectedGame} />)}
                        </div>
                        <TopPerformersSection games={leagueGames} />
                      </>
                }
              </div>
            )}

            {section === "news" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {loading.sports
                  ? [1,2,3].map(i => <Skeleton key={i} />)
                  : leagueNews.length === 0
                    ? <div style={{ padding: "60px 0", textAlign: "center", color: C.textDim, fontFamily: Fb, fontSize: 16 }}>No stories right now</div>
                    : leagueNews.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank} isSports={true} />)
                }
              </div>
            )}
          </div>
        )}

        {/* ── NEWS ── */}
        {tab === "news" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
              <Pill active={catFilter === "all"} onClick={() => setCatFilter("all")}>All</Pill>
              {NEWS_CATS.map(c => <Pill key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>{c.emoji} {c.label}</Pill>)}
            </div>
            {loading.news ? [1,2,3].map(i => <Skeleton key={i} h={180} />) : (
              <>
                {topWorld.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <SectionHead label="TOP STORIES" color={C.gold} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {topWorld.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank} isSports={false} />)}
                    </div>
                  </div>
                )}
                {moreWorld.length > 0 && (
                  <div style={{ marginTop: 40 }}>
                    <SectionHead label="MORE STORIES" color={C.borderBright} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {moreWorld.map(item => <HeadlineCard key={item.id} item={item} rank={null} isSports={false} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── MARKETS ── */}
        {tab === "markets" && (
          <div>
            <div style={{ marginBottom: 40 }}>
              <SectionHead label="LIVE MARKETS" color={C.green} sub="Updates every minute" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
                {(tickers.length > 0 ? tickers : Array(10).fill(null)).map((t, i) =>
                  t ? <MarketCard key={i} t={t} /> : <Skeleton key={i} h={100} />
                )}
              </div>
            </div>
            <SectionHead label="MOVING MARKETS" color={C.green} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mktNews.length === 0
                ? [1,2].map(i => <Skeleton key={i} />)
                : mktNews.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank || null} isSports={false} />)
              }
            </div>
          </div>
        )}

        <div style={{ marginTop: 72, paddingTop: 24, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: Fd, fontSize: 20, letterSpacing: "4px", color: C.textDim }}>FIELD</span>
          <span style={{ fontSize: 14, color: C.textDim, fontFamily: Fb }}>
            Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </main>
    </div>
  );
}
