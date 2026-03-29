"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#05050D",surface:"#0A0A16",card:"#0F0F1E",cardHover:"#141428",
  border:"#1A1A2E",borderBright:"#252540",text:"#EEEEFF",textMid:"#8080A8",
  textDim:"#383854",accent:"#7C6FFF",accentBright:"#A89DFF",green:"#00E5B8",
  red:"#FF2952",orange:"#FF6B2B",gold:"#FFD60A",cyan:"#00C2D4",
};
const Fb = "'Inter', system-ui, sans-serif";
const Fd = "'Bebas Neue', 'Arial Black', sans-serif";
const LEAGUES = [
  { id:"nba", name:"NBA", emoji:"\u{1F3C0}", color:"#E8112D" },
  { id:"nfl", name:"NFL", emoji:"\u{1F3C8}", color:"#4A90D9" },
  { id:"mlb", name:"MLB", emoji:"\u26BE", color:"#00A651" },
  { id:"nhl", name:"NHL", emoji:"\u{1F3D2}", color:"#A8B8CC" },
  { id:"soccer", name:"Soccer", emoji:"\u26BD", color:"#00E5B8" },
  { id:"college", name:"College", emoji:"\u{1F393}", color:"#FF6B2B" },
];
const NEWS_CATS = [
  { id:"geo", label:"Geopolitics", emoji:"\u{1F30D}", color:"#FF2952" },
  { id:"markets", label:"Economy", emoji:"\u{1F4C8}", color:"#00E5B8" },
  { id:"politics", label:"Politics", emoji:"\u{1F3DB}\uFE0F", color:"#4A90D9" },
  { id:"tech", label:"Tech & AI", emoji:"\u26A1", color:"#A89DFF" },
];
const TYPE_CFG = {
  trade:{ label:"TRADE", color:"#FF6B2B" }, injury:{ label:"INJURY", color:"#FF2952" },
  signing:{ label:"SIGNING", color:"#00E5B8" }, storyline:{ label:"NEWS", color:"#A89DFF" },
  roster:{ label:"ROSTER", color:"#FFD60A" }, news:{ label:"NEWS", color:"#A89DFF" },
  award:{ label:"AWARD", color:"#FFD60A" },
};
const GRADE_COLORS = {
  "A+":"#00E5B8","A":"#00E5B8","A-":"#00D4A8","B+":"#7CCA5C","B":"#A8CC44","B-":"#C4CC22",
  "C+":"#FFD60A","C":"#FFB800","C-":"#FF9900","D+":"#FF6B2B","D":"#FF4D2B","D-":"#FF2952",
  "F":"#FF2952","?":"#383854",
};

function LiveDot() {
  return (<span style={{ position:"relative", display:"inline-flex", width:12, height:12, alignItems:"center", justifyContent:"center" }}>
    <span style={{ position:"absolute", width:12, height:12, borderRadius:"50%", background:C.red, opacity:0.3, animation:"ping 1.4s ease-in-out infinite" }} />
    <span style={{ width:7, height:7, borderRadius:"50%", background:C.red, display:"block" }} />
  </span>);
}
function Badge({ label, color }) {
  return (<span style={{ padding:"3px 9px", borderRadius:4, background:color+"20", color, fontSize:11, fontWeight:800, letterSpacing:"1px", fontFamily:Fb, border:"1px solid "+color+"40" }}>{label}</span>);
}
function Pill({ active, onClick, children }) {
  return (<button onClick={onClick} style={{ padding:"9px 20px", borderRadius:24, background:active?C.accent:C.surface, border:"1px solid "+(active?C.accentBright:C.border), color:active?"#fff":C.textMid, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:Fb, whiteSpace:"nowrap", transition:"all 0.15s" }}>{children}</button>);
}
function Skeleton({ h=180 }) {
  return <div style={{ height:h, background:C.card, borderRadius:14, border:"1px solid "+C.border, animation:"pulse 1.5s infinite" }} />;
}
function SectionHead({ label, color, sub }) {
  return (<div style={{ display:"flex", alignItems:"baseline", gap:14, marginBottom:20 }}>
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ width:4, height:26, background:color||C.accent, borderRadius:2 }} />
      <span style={{ fontFamily:Fd, fontSize:26, letterSpacing:"2.5px", color:C.text, lineHeight:1 }}>{label}</span>
    </div>
    {sub && <span style={{ fontSize:13, color:C.textDim, fontFamily:Fb }}>{sub}</span>}
  </div>);
}
function TeamLogo({ logo, abbr, color, size=32 }) {
  const [err, setErr] = useState(false);
  if (logo && !err) return <img src={logo} alt={abbr} width={size} height={size} onError={() => setErr(true)} style={{ objectFit:"contain", flexShrink:0 }} />;
  return (<div style={{ width:size, height:size, borderRadius:"50%", background:(color||C.borderBright)+"30", border:"1px solid "+(color||C.borderBright)+"50", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
    <span style={{ fontSize:size*0.3, fontWeight:800, color:color||C.textMid, fontFamily:Fb }}>{abbr?.slice(0,3)}</span>
  </div>);
}

function BreakingBanner({ items }) {
  const [i, setI] = useState(0);
  useEffect(() => { if (items.length < 2) return; const t = setInterval(() => setI(x => (x+1)%items.length), 5000); return () => clearInterval(t); }, [items.length]);
  if (!items.length) return null;
  return (<div style={{ background:"linear-gradient(90deg, "+C.red+"EE, #CC1040EE)", padding:"12px 28px", display:"flex", alignItems:"center", gap:16 }}>
    <span style={{ fontSize:11, fontWeight:900, letterSpacing:"2px", fontFamily:Fb, color:"#fff", background:"rgba(0,0,0,0.3)", padding:"4px 10px", borderRadius:4, flexShrink:0 }}>{"\u{1F534}"} BREAKING</span>
    <span style={{ fontSize:15, fontWeight:600, color:"#fff", fontFamily:Fb, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{items[i]?.headline}</span>
    <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontFamily:Fb, flexShrink:0 }}>{items[i]?.source} · {items[i]?.time}</span>
  </div>);
}

function Ticker({ tickers }) {
  const ref = useRef(null);
  useEffect(() => { const el=ref.current; if(!el) return; let x=0,raf; const go=()=>{x-=0.7;if(x<-el.scrollWidth/2)x=0;el.style.transform="translateX("+x+"px)";raf=requestAnimationFrame(go);}; raf=requestAnimationFrame(go); return ()=>cancelAnimationFrame(raf); }, [tickers.length]);
  if (!tickers.length) return null;
  const d = [...tickers,...tickers];
  return (<div style={{ background:C.surface, borderBottom:"1px solid "+C.border, padding:"11px 0", overflow:"hidden" }}>
    <div ref={ref} style={{ display:"flex", width:"max-content" }}>
      {d.map((t,i) => (<div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"0 28px", borderRight:"1px solid "+C.border }}>
        <span style={{ fontSize:12, color:C.textDim, fontFamily:Fb, fontWeight:700, whiteSpace:"nowrap", letterSpacing:"0.5px" }}>{t.symbol}</span>
        <span style={{ fontSize:15, color:C.text, fontFamily:Fb, fontWeight:800, whiteSpace:"nowrap" }}>{t.value}</span>
        <span style={{ fontSize:13, color:t.up?C.green:C.red, fontFamily:Fb, fontWeight:700, whiteSpace:"nowrap" }}>{t.change}</span>
      </div>))}
    </div>
  </div>);
}

// ── GAME DETAIL PAGE ─────────────────────────────────────────
function GameDetailPage({ game, league, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("plays");

  useEffect(() => {
    setLoading(true);
    const doFetch = () => {
      fetch("/api/sports?league=" + league + "&type=detail&gameId=" + game.id)
        .then(r => r.json())
        .then(d => { setDetail(d); setLoading(false); })
        .catch(() => setLoading(false));
    };
    doFetch();
    // Auto-refresh every 15s if game is live
    if (game.status === "live") {
      const iv = setInterval(doFetch, 15000);
      return () => clearInterval(iv);
    }
  }, [game.id, league]);

  const away = detail?.awayTeam || {};
  const home = detail?.homeTeam || {};
  const plays = detail?.plays || [];
  const teamStats = detail?.teamStats || [];
  const rosters = detail?.rosters || [];
  const awayRoster = rosters[0] || { players: [], labels: [] };
  const homeRoster = rosters[1] || { players: [], labels: [] };

  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      {/* Back bar */}
      <div style={{ background:C.surface, borderBottom:"1px solid "+C.border, padding:"12px 28px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={onBack} style={{ background:C.card, border:"1px solid "+C.border, borderRadius:8, padding:"8px 16px", color:C.textMid, cursor:"pointer", fontSize:14, fontFamily:Fb, display:"flex", alignItems:"center", gap:6 }}>
            {"\u2190"} Back
          </button>
          <span style={{ fontSize:13, color:C.textDim, fontFamily:Fb }}>
            {isLive ? "\u{1F534} LIVE" : isFinal ? "FINAL" : game.time}
          </span>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 28px" }}>
        {/* Scoreboard */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:32, padding:"32px 0 24px" }}>
          <div style={{ textAlign:"center", minWidth:120 }}>
            <TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={56} />
            <div style={{ fontFamily:Fd, fontSize:18, color:C.text, letterSpacing:"1px", marginTop:8 }}>{game.awayTeam}</div>
            {away.record && <div style={{ fontSize:12, color:C.textDim, fontFamily:Fb }}>{away.record}</div>}
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:Fd, fontSize:52, color:C.text, letterSpacing:"3px", lineHeight:1 }}>
              {game.awayScore ?? "0"} <span style={{ color:C.textDim, fontSize:36 }}>{"\u2014"}</span> {game.homeScore ?? "0"}
            </div>
            <div style={{ fontSize:13, color:isLive?C.red:C.textMid, fontFamily:Fb, fontWeight:700, letterSpacing:"1px", marginTop:8 }}>
              {isLive ? "\u{1F534} " + (game.period || "LIVE") : isFinal ? "FINAL" : game.time}
            </div>
          </div>
          <div style={{ textAlign:"center", minWidth:120 }}>
            <TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={56} />
            <div style={{ fontFamily:Fd, fontSize:18, color:C.text, letterSpacing:"1px", marginTop:8 }}>{game.homeTeam}</div>
            {home.record && <div style={{ fontSize:12, color:C.textDim, fontFamily:Fb }}>{home.record}</div>}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid "+C.border, marginBottom:24 }}>
          {[
            { id:"plays", label:"\u{1F4CB} Feed" },
            { id:"stats", label:"\u{1F4CA} Game" },
            { id:"away", label:game.awayTeam },
            { id:"home", label:game.homeTeam },
          ].map(t => {
            const isTeamTab = t.id === "away" || t.id === "home";
            const teamColor = t.id === "away" ? game.awayColor : t.id === "home" ? game.homeColor : C.accent;
            return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding:"14px 8px", border:"none", background:"none", cursor:"pointer",
              fontSize:14, fontWeight:tab===t.id?800:500, color:tab===t.id?(isTeamTab?teamColor:C.text):C.textMid,
              borderBottom:tab===t.id?"3px solid "+(isTeamTab?teamColor:C.accent):"3px solid transparent",
              fontFamily:Fb, transition:"all 0.15s", letterSpacing:"0.5px",
            }}>{t.label}</button>
          )})}
        </div>

        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:60 }}>{[1,2,3,4,5].map(i=><Skeleton key={i} h={70} />)}</div>
        ) : (
          <div style={{ paddingBottom:60 }}>

            {/* ── PLAYS TAB ── */}
            {tab === "plays" && (
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {plays.length === 0 ? (
                  <div style={{ padding:"60px 0", textAlign:"center", color:C.textDim, fontFamily:Fb }}>No play-by-play available yet</div>
                ) : (() => {
                  let lastPeriod = null;
                  return plays.map((p, i) => {
                    const showPeriodDivider = p.period && p.period !== lastPeriod;
                    lastPeriod = p.period;
                    const mainPlayer = p.participants?.[0];
                    const assistPlayer = p.participants?.[1];
                    const isPeriodMarker = p.playCategory === "period";
                    const isTimeout = p.playCategory === "timeout";
                    const isSub = p.playCategory === "sub";
                    const isTurnover = p.playCategory === "turnover";
                    const isFoul = p.playCategory === "foul";
                    const isScoring = p.scoringPlay;
                    const teamColor = p.teamColor || C.borderBright;

                    return (
                      <div key={p.id || i}>
                        {/* Period divider */}
                        {showPeriodDivider && (
                          <div style={{ padding:"14px 0", display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ flex:1, height:1, background:C.borderBright }} />
                            <span style={{ fontSize:13, fontWeight:800, color:C.accentBright, fontFamily:Fb, letterSpacing:"2px", textTransform:"uppercase" }}>
                              {p.periodText || ("Q" + p.period)}
                            </span>
                            <div style={{ flex:1, height:1, background:C.borderBright }} />
                          </div>
                        )}

                        {/* Period start/end markers */}
                        {isPeriodMarker ? (
                          <div style={{ padding:"10px 18px", textAlign:"center" }}>
                            <span style={{ fontSize:12, color:C.textDim, fontFamily:Fb, fontWeight:600, letterSpacing:"1px" }}>{p.text}</span>
                          </div>
                        ) : isTimeout ? (
                          /* Timeout */
                          <div style={{ padding:"10px 18px", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:C.textDim, fontFamily:Fb, letterSpacing:"1px", textTransform:"uppercase", background:C.surface, padding:"4px 12px", borderRadius:4, border:"1px solid "+C.border }}>
                              {"\u23F8"} {p.text || "Timeout"}
                            </span>
                          </div>
                        ) : isSub ? (
                          /* Substitution — minimal */
                          <div style={{ padding:"6px 18px", display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:12, color:C.textDim, fontFamily:Fb }}>{"\u{1F504}"} {p.shortText || p.text}</span>
                          </div>
                        ) : isScoring ? (
                          /* ── SCORING PLAY — the big one ── */
                          <div style={{
                            margin:"6px 0",
                            background: teamColor + "12",
                            border:"1px solid " + teamColor + "30",
                            borderRadius:12,
                            overflow:"hidden",
                          }}>
                            {/* Score bar at top */}
                            <div style={{ height:3, background:"linear-gradient(90deg, "+teamColor+"80, "+teamColor+"20, transparent)" }} />
                            <div style={{ padding:"16px 18px" }}>
                              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                                {/* Player headshot */}
                                {mainPlayer ? (
                                  <PlayerHeadshot src={mainPlayer.headshot} name={mainPlayer.name} color={teamColor} />
                                ) : p.teamLogo ? (
                                  <TeamLogo logo={p.teamLogo} abbr={p.teamAbbr} color={teamColor} size={40} />
                                ) : null}

                                <div style={{ flex:1, minWidth:0 }}>
                                  {/* Play type badge + score value */}
                                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                    <span style={{ fontSize:11, fontWeight:800, color:teamColor, fontFamily:Fb, letterSpacing:"1px", textTransform:"uppercase" }}>
                                      {p.scoreValue === 3 ? "THREE" : p.scoreValue === 2 ? "BUCKET" : p.scoreValue === 1 ? "FREE THROW" : p.type || "SCORE"}
                                    </span>
                                    {p.scoreValue > 0 && (
                                      <span style={{ fontSize:11, fontWeight:800, color:teamColor, fontFamily:Fb, background:teamColor+"20", padding:"2px 8px", borderRadius:4 }}>
                                        +{p.scoreValue}
                                      </span>
                                    )}
                                  </div>

                                  {/* Play description */}
                                  <div style={{ fontSize:15, color:C.text, fontFamily:Fb, fontWeight:600, lineHeight:1.45, marginBottom:4 }}>
                                    {p.shortText || p.text}
                                  </div>

                                  {/* Player details */}
                                  {mainPlayer && (
                                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                                      <span style={{ fontSize:13, color:C.text, fontFamily:Fb, fontWeight:700 }}>{mainPlayer.name}</span>
                                      {mainPlayer.jersey && <span style={{ fontSize:11, color:C.textDim, fontFamily:Fb }}>#{mainPlayer.jersey}</span>}
                                      {assistPlayer && (
                                        <span style={{ fontSize:12, color:C.textMid, fontFamily:Fb }}>
                                          {"\u00B7"} assist: <span style={{ fontWeight:600, color:C.text }}>{assistPlayer.name}</span>
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Score */}
                                <div style={{ textAlign:"right", flexShrink:0 }}>
                                  <div style={{ fontSize:20, fontWeight:900, color:C.text, fontFamily:Fd, letterSpacing:"1px" }}>
                                    {p.awayScore != null ? p.awayScore + "-" + p.homeScore : ""}
                                  </div>
                                  <div style={{ fontSize:11, color:C.textDim, fontFamily:Fb, marginTop:2 }}>
                                    {p.clock}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ── Non-scoring play ── */
                          <div style={{
                            padding:"10px 18px",
                            borderLeft:"3px solid " + (isTurnover ? C.red+"50" : isFoul ? C.orange+"50" : C.border+"60"),
                            borderBottom:"1px solid " + C.border + "40",
                            display:"flex",
                            gap:12,
                            alignItems:"center",
                          }}>
                            {/* Small team logo or player pic */}
                            {mainPlayer?.headshot ? (
                              <img src={mainPlayer.headshot} alt={mainPlayer.name} width={28} height={28}
                                style={{ borderRadius:"50%", objectFit:"cover", border:"1px solid "+C.border, flexShrink:0 }}
                                onError={e => { e.target.style.display="none"; }} />
                            ) : p.teamLogo ? (
                              <img src={p.teamLogo} alt={p.teamAbbr} width={20} height={20}
                                style={{ objectFit:"contain", flexShrink:0, opacity:0.5 }}
                                onError={e => { e.target.style.display="none"; }} />
                            ) : (
                              <div style={{ width:20, flexShrink:0 }} />
                            )}

                            <div style={{ flex:1, minWidth:0 }}>
                              <span style={{ fontSize:13, color:isTurnover?C.red:isFoul?C.orange:C.textMid, fontFamily:Fb, fontWeight:isTurnover||isFoul?600:400, lineHeight:1.45 }}>
                                {p.shortText || p.text}
                              </span>
                            </div>

                            <div style={{ textAlign:"right", flexShrink:0 }}>
                              {p.awayScore != null && (
                                <span style={{ fontSize:13, color:C.textDim, fontFamily:Fb, fontWeight:600 }}>{p.awayScore}-{p.homeScore}</span>
                              )}
                              {p.clock && <div style={{ fontSize:11, color:C.textDim+"80", fontFamily:Fb }}>{p.clock}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* ── STATS TAB ── */}
            {tab === "stats" && (
              <div>
                {teamStats.length >= 2 ? (
                  <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, overflow:"hidden" }}>
                    {/* Header */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 1fr", padding:"16px 20px", borderBottom:"1px solid "+C.border, background:C.surface }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={28} />
                        <span style={{ fontFamily:Fb, fontWeight:800, color:C.text, fontSize:15 }}>{game.awayTeam}</span>
                      </div>
                      <div style={{ textAlign:"center", fontSize:12, color:C.textDim, fontFamily:Fb, fontWeight:700, letterSpacing:"1px", alignSelf:"center" }}>STAT</div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
                        <span style={{ fontFamily:Fb, fontWeight:800, color:C.text, fontSize:15 }}>{game.homeTeam}</span>
                        <TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={28} />
                      </div>
                    </div>
                    {/* Stat rows */}
                    {teamStats[0]?.stats?.map((s, si) => {
                      const homeVal = teamStats[1]?.stats?.[si]?.value || "";
                      const awayNum = parseFloat(s.value) || 0;
                      const homeNum = parseFloat(homeVal) || 0;
                      const awayWins = awayNum > homeNum;
                      const homeWins = homeNum > awayNum;
                      return (
                        <div key={si} style={{ display:"grid", gridTemplateColumns:"1fr 100px 1fr", padding:"12px 20px", borderBottom: si < (teamStats[0]?.stats?.length||0)-1 ? "1px solid "+C.border+"60" : "none" }}>
                          <div style={{ fontSize:15, fontWeight:awayWins?800:400, color:awayWins?C.text:C.textMid, fontFamily:Fb }}>{s.value}</div>
                          <div style={{ textAlign:"center", fontSize:12, color:C.textDim, fontFamily:Fb, fontWeight:600 }}>{s.label || s.abbr}</div>
                          <div style={{ fontSize:15, fontWeight:homeWins?800:400, color:homeWins?C.text:C.textMid, fontFamily:Fb, textAlign:"right" }}>{homeVal}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding:"60px 0", textAlign:"center", color:C.textDim, fontFamily:Fb }}>Stats not available yet</div>
                )}
              </div>
            )}

            {/* ── TEAM BOX SCORE TABS ── */}
            {(tab === "away" || tab === "home") && (() => {
              const roster = tab === "away" ? awayRoster : homeRoster;
              const teamColor = tab === "away" ? (game.awayColor || C.accent) : (game.homeColor || C.accent);
              const teamName = tab === "away" ? game.awayTeam : game.homeTeam;
              const teamLogo = tab === "away" ? game.awayLogo : game.homeLogo;
              const labels = roster.labels || [];
              // Key stat columns to show
              const keyCols = ["MIN","PTS","REB","AST","STL","BLK","+/-","FG%","3PT","TO"];
              const colIdxs = keyCols.map(k => labels.findIndex(l => l === k || l.toUpperCase() === k)).filter(i => i >= 0);
              const shownLabels = colIdxs.map(i => labels[i]);

              const starters = roster.players.filter(p => p.starter);
              const bench = roster.players.filter(p => !p.starter && !p.didNotPlay);
              const dnp = roster.players.filter(p => p.didNotPlay);

              const renderPlayer = (p, pi) => (
                <div key={p.id || pi} style={{
                  display:"grid",
                  gridTemplateColumns:"44px 1fr " + shownLabels.map(() => "48px").join(" "),
                  alignItems:"center",
                  padding:"10px 14px",
                  borderBottom:"1px solid "+C.border+"60",
                  gap:8,
                }}>
                  {/* Headshot */}
                  <PlayerHeadshot src={p.headshot} name={p.name} color={teamColor} />
                  {/* Name & position */}
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:Fb, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:C.textDim, fontFamily:Fb }}>{p.position}{p.jersey ? " #"+p.jersey : ""}</div>
                  </div>
                  {/* Stats */}
                  {colIdxs.map((ci, si) => {
                    const val = p.stats?.[ci]?.value ?? "";
                    const isKey = shownLabels[si] === "PTS";
                    return (
                      <div key={si} style={{ textAlign:"center", fontSize:isKey?15:13, fontWeight:isKey?800:600, color:isKey?C.text:C.textMid, fontFamily:Fb }}>
                        {val}
                      </div>
                    );
                  })}
                </div>
              );

              return (
                <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, overflow:"hidden" }}>
                  {/* Team header */}
                  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 18px", borderBottom:"1px solid "+C.border, background:C.surface }}>
                    <TeamLogo logo={teamLogo} abbr={teamName} color={teamColor} size={32} />
                    <span style={{ fontFamily:Fb, fontWeight:800, color:C.text, fontSize:16 }}>{teamName}</span>
                  </div>
                  {/* Column headers */}
                  <div style={{
                    display:"grid",
                    gridTemplateColumns:"44px 1fr " + shownLabels.map(() => "48px").join(" "),
                    padding:"8px 14px",
                    borderBottom:"1px solid "+C.border,
                    gap:8,
                  }}>
                    <div />
                    <div style={{ fontSize:11, color:C.textDim, fontFamily:Fb, fontWeight:700 }}>PLAYER</div>
                    {shownLabels.map((l,i) => (
                      <div key={i} style={{ textAlign:"center", fontSize:11, color:C.textDim, fontFamily:Fb, fontWeight:700 }}>{l}</div>
                    ))}
                  </div>
                  {/* Starters section */}
                  {starters.length > 0 && (
                    <>
                      <div style={{ padding:"8px 14px", fontSize:11, fontWeight:800, color:C.accentBright, fontFamily:Fb, letterSpacing:"1.5px", background:C.accent+"08" }}>STARTERS</div>
                      {starters.map(renderPlayer)}
                    </>
                  )}
                  {/* Bench section */}
                  {bench.length > 0 && (
                    <>
                      <div style={{ padding:"8px 14px", fontSize:11, fontWeight:800, color:C.textMid, fontFamily:Fb, letterSpacing:"1.5px", background:C.surface }}>BENCH</div>
                      {bench.map(renderPlayer)}
                    </>
                  )}
                  {/* DNP */}
                  {dnp.length > 0 && (
                    <>
                      <div style={{ padding:"8px 14px", fontSize:11, fontWeight:800, color:C.textDim, fontFamily:Fb, letterSpacing:"1.5px", background:C.surface }}>DID NOT PLAY</div>
                      {dnp.map((p, pi) => (
                        <div key={p.id||pi} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderBottom:"1px solid "+C.border+"40" }}>
                          <PlayerHeadshot src={p.headshot} name={p.name} color={teamColor} />
                          <span style={{ fontSize:13, color:C.textDim, fontFamily:Fb }}>{p.name}</span>
                          {p.reason && <span style={{ fontSize:11, color:C.textDim, fontFamily:Fb, marginLeft:4 }}>({p.reason})</span>}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerHeadshot({ src, name, color }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={name} width={40} height={40} onError={() => setErr(true)} style={{ borderRadius:"50%", objectFit:"cover", background:C.surface, border:"2px solid "+(color||C.border), flexShrink:0 }} />;
  }
  return (
    <div style={{ width:40, height:40, borderRadius:"50%", background:(color||C.borderBright)+"20", border:"2px solid "+(color||C.border), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize:14, fontWeight:800, color:color||C.textMid, fontFamily:Fb }}>{(name||"?").charAt(0)}</span>
    </div>
  );
}

// ── Top Performers Section ────────────────────────────────────
function TopPerformersSection({ games }) {
  const active = games.filter(g => (g.status==="live"||g.status==="final") && g.topPerformers?.length > 0);
  if (!active.length) return null;
  return (
    <div style={{ marginTop:32 }}>
      <SectionHead label="TOP PERFORMERS" color={C.gold} />
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {active.map(game => (
          <div key={game.id} style={{ background:C.card, border:"1px solid "+C.border, borderRadius:14, padding:"20px 24px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, paddingBottom:14, borderBottom:"1px solid "+C.border }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={24} /><span style={{ fontSize:15, fontWeight:800, color:C.textMid, fontFamily:Fb }}>{game.awayTeam}</span></div>
              <span style={{ fontSize:16, fontWeight:900, color:C.text, fontFamily:Fd, letterSpacing:"1px" }}>{game.awayScore!=null ? game.awayScore+" \u2014 "+game.homeScore : "vs"}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:15, fontWeight:800, color:C.textMid, fontFamily:Fb }}>{game.homeTeam}</span><TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={24} /></div>
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>{game.status==="live"?<><LiveDot /><span style={{ fontSize:12, color:C.red, fontWeight:800, fontFamily:Fb, letterSpacing:"1px" }}>{game.period}</span></>:<span style={{ fontSize:12, color:C.textDim, fontFamily:Fb, fontWeight:700, letterSpacing:"1px" }}>FINAL</span>}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
              {game.topPerformers.slice(0,5).map((p,i) => (
                <div key={i} style={{ background:C.surface, borderRadius:10, padding:"16px 12px", border:"1px solid "+(i===0?C.gold+"50":C.border), textAlign:"center", position:"relative", overflow:"hidden" }}>
                  {i===0 && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, "+C.gold+", transparent)" }} />}
                  <div style={{ fontSize:28, fontWeight:900, color:i===0?C.gold:C.text, fontFamily:Fd, letterSpacing:"1px", lineHeight:1, marginBottom:4 }}>{p.value}</div>
                  <div style={{ fontSize:10, fontWeight:800, color:C.accentBright, fontFamily:Fb, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:8 }}>{p.stat}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:Fb, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                  <div style={{ fontSize:11, color:C.textDim, fontFamily:Fb }}>{p.team}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ game, onSelect }) {
  const isLive=game.status==="live"; const isFinal=game.status==="final"; const hasScore=isLive||isFinal;
  const wA=isFinal&&game.winner===game.awayTeam; const wH=isFinal&&game.winner===game.homeTeam;
  return (
    <div onClick={() => onSelect(game)} style={{ background:C.card, border:"1px solid "+(isLive?C.red+"80":C.border), borderRadius:14, padding:"18px 20px", display:"flex", flexDirection:"column", gap:14, cursor:"pointer", transition:"all 0.15s", boxShadow:isLive?"0 0 24px "+C.red+"18":"none" }}
      onMouseEnter={e => { e.currentTarget.style.background=C.cardHover; e.currentTarget.style.borderColor=isLive?C.red:C.borderBright; }}
      onMouseLeave={e => { e.currentTarget.style.background=C.card; e.currentTarget.style.borderColor=isLive?C.red+"80":C.border; }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        {isLive ? <div style={{ display:"flex", alignItems:"center", gap:6 }}><LiveDot /><span style={{ fontSize:11, color:C.red, fontWeight:800, fontFamily:Fb, letterSpacing:"1px" }}>LIVE</span></div>
          : <span style={{ fontSize:11, color:isFinal?C.textDim:C.green, fontWeight:700, fontFamily:Fb, letterSpacing:"1px" }}>{isFinal?"FINAL":"UPCOMING"}</span>}
        {game.tv && <span style={{ fontSize:11, color:C.textDim, fontFamily:Fb }}>{game.tv}</span>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}><TeamLogo logo={game.awayLogo} abbr={game.awayTeam} color={game.awayColor} size={32} /><span style={{ fontSize:16, fontWeight:800, fontFamily:Fb, color:isFinal&&!wA?C.textMid:C.text }}>{game.awayTeam}</span></div>
          {hasScore && <span style={{ fontSize:26, fontWeight:900, fontFamily:Fb, color:isFinal&&!wA?C.textMid:C.text, lineHeight:1 }}>{game.awayScore}</span>}
        </div>
        <div style={{ height:1, background:C.border }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}><TeamLogo logo={game.homeLogo} abbr={game.homeTeam} color={game.homeColor} size={32} /><span style={{ fontSize:16, fontWeight:800, fontFamily:Fb, color:isFinal&&!wH?C.textMid:C.text }}>{game.homeTeam}</span></div>
          {hasScore && <span style={{ fontSize:26, fontWeight:900, fontFamily:Fb, color:isFinal&&!wH?C.textMid:C.text, lineHeight:1 }}>{game.homeScore}</span>}
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:"1px solid "+C.border }}>
        <span style={{ fontSize:12, color:isLive?C.red:C.textDim, fontFamily:Fb, fontWeight:isLive?700:400 }}>{game.status==="upcoming"?game.time:(game.period||"Final")}</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {game.spread && <span style={{ fontSize:11, color:C.accentBright, fontFamily:Fb, fontWeight:600, background:C.accent+"18", padding:"3px 8px", borderRadius:5 }}>{game.spread}</span>}
          <span style={{ fontSize:11, color:C.textDim, fontFamily:Fb }}>Game detail {"\u2192"}</span>
        </div>
      </div>
    </div>
  );
}

function MarketCard({ t }) {
  const accent = { index:C.cyan, crypto:C.accentBright, commodity:C.orange, bond:C.textMid, fx:"#88AAFF" }[t.type] || C.textMid;
  return (<div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:12, padding:"18px 20px", position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, "+accent+"CC, transparent)" }} />
    <div style={{ fontSize:12, color:C.textDim, fontFamily:Fb, fontWeight:700, marginBottom:10, letterSpacing:"0.5px" }}>{t.symbol}</div>
    <div style={{ fontSize:22, fontWeight:800, color:C.text, fontFamily:Fb, marginBottom:6, letterSpacing:"-0.5px" }}>{t.value}</div>
    <div style={{ fontSize:15, fontWeight:700, color:t.up?C.green:C.red, fontFamily:Fb }}>{t.change}</div>
  </div>);
}

// ── FIXED AI Analysis Panel ───────────────────────────────────
function AnalysisPanel({ analysis, loading, type }) {
  if (loading) {
    return (<div style={{ marginTop:16, padding:"20px 24px", background:"linear-gradient(135deg, "+C.accent+"08, "+C.accent+"04)", borderRadius:12, border:"1px solid "+C.accent+"25" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:16, height:16, border:"2px solid "+C.border, borderTopColor:C.accent, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        <span style={{ fontSize:13, color:C.accentBright, fontFamily:Fb, fontWeight:600, letterSpacing:"0.5px" }}>Generating analysis...</span>
      </div>
      <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
        {[90,70,80].map((w,i) => <div key={i} style={{ height:14, background:C.accent+"12", borderRadius:4, width:w+"%", animation:"pulse 1.5s infinite", animationDelay:i*0.2+"s" }} />)}
      </div>
    </div>);
  }

  if (!analysis) return null;

  // Extract text from whatever format the API returned
  const summary = analysis.summary || analysis.text || "";
  const impact = analysis.impact || "";
  const context = analysis.context || "";
  const grade = analysis.grade || "";
  const gradeReason = analysis.gradeReason || "";
  const showGrade = grade && (type === "trade" || type === "signing");
  const gradeColor = GRADE_COLORS[grade] || C.textMid;

  // If we got NOTHING useful, show a fallback message
  const hasContent = summary || impact || context;
  const fallbackText = !hasContent ? "Analysis data received but could not be displayed. Raw: " + JSON.stringify(analysis).slice(0, 200) : "";

  return (<div style={{ marginTop:16, background:"linear-gradient(135deg, "+C.accent+"0A, "+C.accent+"04)", borderRadius:12, border:"1px solid "+C.accent+"25", overflow:"hidden", animation:"fadeSlideIn 0.3s ease-out" }}>
    {/* Header */}
    <div style={{ padding:"10px 20px", background:C.accent+"12", borderBottom:"1px solid "+C.accent+"18", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:14, letterSpacing:"0.5px" }}>{"\u2726"}</span>
        <span style={{ fontSize:11, fontWeight:800, color:C.accentBright, fontFamily:Fb, letterSpacing:"2px", textTransform:"uppercase" }}>AI Analysis</span>
      </div>
      {showGrade && <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:11, color:C.textMid, fontFamily:Fb, fontWeight:600 }}>GRADE</span>
        <span style={{ fontSize:20, fontWeight:900, fontFamily:Fd, color:gradeColor, letterSpacing:"1px", lineHeight:1, textShadow:"0 0 20px "+gradeColor+"40" }}>{grade}</span>
      </div>}
    </div>
    {/* Content */}
    <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:14 }}>
      {summary ? <div style={{ fontSize:15, color:C.text, fontFamily:Fb, fontWeight:500, lineHeight:1.55 }}>{summary}</div> : null}

      {showGrade && gradeReason ? <div style={{ padding:"10px 14px", background:gradeColor+"10", borderRadius:8, borderLeft:"3px solid "+gradeColor+"60" }}>
        <span style={{ fontSize:13, color:gradeColor, fontFamily:Fb, fontWeight:600 }}>{gradeReason}</span>
      </div> : null}

      {impact ? <div>
        <div style={{ fontSize:11, fontWeight:800, color:C.orange, fontFamily:Fb, letterSpacing:"1.5px", marginBottom:6, textTransform:"uppercase" }}>
          {type === "geo" ? "Geopolitical Impact" : type === "markets" ? "Economic Impact" : type === "politics" ? "Political Impact" : type === "tech" ? "Tech & Industry Impact" : ["trade","injury","signing","roster","news","award","storyline"].includes(type) ? "Team & League Impact" : "World Impact"}
        </div>
        <div style={{ fontSize:14, color:C.textMid, fontFamily:Fb, lineHeight:1.55 }}>{impact}</div>
      </div> : null}

      {context ? <div>
        <div style={{ fontSize:11, fontWeight:800, color:C.cyan, fontFamily:Fb, letterSpacing:"1.5px", marginBottom:6, textTransform:"uppercase" }}>Historical Context</div>
        <div style={{ fontSize:14, color:C.textMid, fontFamily:Fb, lineHeight:1.55 }}>{context}</div>
      </div> : null}

      {fallbackText ? <div style={{ fontSize:13, color:C.red, fontFamily:Fb, lineHeight:1.5 }}>{fallbackText}</div> : null}
    </div>
  </div>);
}

// ── Headline Card (self-contained, auto-fetches analysis) ─────
function HeadlineCard({ item, rank, isSports }) {
  const [analysis, setAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const league = isSports ? LEAGUES.find(l => l.id === item.league) : null;
  const cat = !isSports ? NEWS_CATS.find(c => c.id === item.category) : null;
  const typeCfg = isSports ? (TYPE_CFG[item.type] || TYPE_CFG.storyline) : null;

  useEffect(() => {
    let dead = false;
    setAiLoading(true);
    setAnalysis(null);

    const controller = new AbortController();

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline: item.headline, type: item.type || "news", category: item.category || null }),
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(data => {
        if (dead) return;
        // Validate we got an object with at least one useful field
        if (data && typeof data === "object" && (data.summary || data.impact || data.context || data.text)) {
          setAnalysis(data);
        } else {
          setAnalysis({ summary: "Received unexpected response format from analysis API." });
        }
        setAiLoading(false);
      })
      .catch(err => {
        if (dead) return;
        if (err.name === "AbortError") return;
        setAnalysis({ summary: "Analysis could not be loaded. Check that /api/analyze is deployed." });
        setAiLoading(false);
      });

    return () => { dead = true; controller.abort(); };
  }, [item.id, item.headline]);

  return (
    <div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:14, padding:"24px 28px", position:"relative", overflow:"hidden", transition:"border-color 0.2s" }}>
      {rank === 1 && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg, "+C.gold+", "+C.orange+", transparent)" }} />}
      <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
        {rank != null && <div style={{ flexShrink:0, fontFamily:Fd, fontSize:52, lineHeight:1, color:rank===1?C.gold:C.borderBright, letterSpacing:"-2px", minWidth:56 }}>{String(rank).padStart(2,"0")}</div>}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12, flexWrap:"wrap" }}>
            {typeCfg && <Badge label={typeCfg.label} color={typeCfg.color} />}
            {cat && <Badge label={cat.emoji+" "+cat.label} color={cat.color} />}
            {item.breaking && <Badge label={"\u{1F534} BREAKING"} color={C.red} />}
            {league && <span style={{ fontSize:14, color:league.color, fontFamily:Fb, fontWeight:700 }}>{league.emoji} {league.name}</span>}
            {item.region && <span style={{ fontSize:13, color:C.textDim, fontFamily:Fb }}>{item.region}</span>}
          </div>
          <div style={{ fontSize:20, fontWeight:700, color:C.text, lineHeight:1.45, fontFamily:Fb, marginBottom:12, letterSpacing:"-0.3px" }}>{item.headline}</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:14, color:C.textMid, fontFamily:Fb }}>via <span style={{ color:"#9898C8", fontWeight:600 }}>{item.source}</span></span>
            <span style={{ color:C.textDim }}>{"\u00B7"}</span>
            <span style={{ fontSize:14, color:C.textDim, fontFamily:Fb }}>{item.time}</span>
            {item.team && <><span style={{ color:C.textDim }}>{"\u00B7"}</span><span style={{ fontSize:14, color:C.textDim, fontFamily:Fb }}>{item.team}</span></>}
          </div>
          <AnalysisPanel analysis={analysis} loading={aiLoading} type={isSports ? item.type : item.category} />
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function FieldApp() {
  const [tab, setTab] = useState("sports");
  const [league, setLeague] = useState("nba");
  const [section, setSection] = useState("scores");
  const [catFilter, setCatFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [selectedGame, setSelectedGame] = useState(null);
  const [scoreDate, setScoreDate] = useState(new Date()); // Date navigation

  const [worldNews, setWorldNews] = useState([]);
  const [sportsNews, setSportsNews] = useState({});
  const [games, setGames] = useState({});
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState({ news:true, sports:true });

  useEffect(() => {
    const loadNews = () => fetch("/api/news").then(r=>r.json()).then(d=>{setWorldNews(d.articles||[]);setLoading(p=>({...p,news:false}));}).catch(()=>setLoading(p=>({...p,news:false})));
    loadNews();
    const t = setInterval(loadNews, 60000); // Refresh news every 60 seconds
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load=()=>fetch("/api/markets").then(r=>r.json()).then(d=>setTickers(d.tickers||[])).catch(()=>{});
    load(); const t=setInterval(load,60000); return ()=>clearInterval(t);
  }, []);

  useEffect(() => {
    if (tab !== "sports") return;
    setLoading(p => ({ ...p, sports:true }));
    const d = scoreDate;
    const dateStr = d.getFullYear() + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
    const cacheKey = league + "_" + dateStr;
    Promise.all([
      fetch("/api/sports?league="+league+"&type=scores&date="+dateStr).then(r=>r.json()),
      fetch("/api/sports?league="+league+"&type=news").then(r=>r.json()),
    ]).then(([s,n]) => {
      setGames(prev => ({ ...prev, [cacheKey]: s.games || [] }));
      setSportsNews(prev => ({ ...prev, [league]: n.news || [] }));
      setLoading(p => ({ ...p, sports:false }));
    }).catch(() => setLoading(p => ({ ...p, sports:false })));
  }, [tab, league, scoreDate]);

  // If a game is selected, show the full game detail page
  if (selectedGame) {
    return <GameDetailPage game={selectedGame} league={league} onBack={() => setSelectedGame(null)} />;
  }

  const activeLeague = LEAGUES.find(l => l.id === league);
  const scoreDateStr = scoreDate.getFullYear() + String(scoreDate.getMonth()+1).padStart(2,"0") + String(scoreDate.getDate()).padStart(2,"0");
  const gameCacheKey = league + "_" + scoreDateStr;
  const leagueGames = (games[gameCacheKey]||[]).filter(g => gameFilter==="all" || g.status===gameFilter);
  const leagueNews = sportsNews[league] || [];
  const liveCount = (games[gameCacheKey]||[]).filter(g => g.status==="live").length;
  const visWorld = catFilter==="all" ? worldNews : worldNews.filter(h => h.category===catFilter);
  const topWorld = visWorld.filter(h => h.rank).sort((a,b) => a.rank-b.rank);
  const moreWorld = visWorld.filter(h => !h.rank);
  const breaking = worldNews.filter(h => h.breaking).slice(0,3);
  const mktNews = worldNews.filter(h => ["markets","geo"].includes(h.category));

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      flex:1, padding:"20px 8px", border:"none", background:"none", cursor:"pointer",
      fontSize:16, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase",
      color: tab===id ? C.text : C.textMid,
      borderBottom: tab===id ? "3px solid "+(id==="sports"?(activeLeague?.color||C.accent):id==="news"?C.red:C.green) : "3px solid transparent",
      fontFamily:Fb, transition:"all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <style>{"\
        @keyframes ping{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(2.2);opacity:0}}\
        @keyframes spin{to{transform:rotate(360deg)}}\
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}\
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}\
        *{box-sizing:border-box}\
        ::-webkit-scrollbar{width:4px;height:4px}\
        ::-webkit-scrollbar-track{background:"+C.surface+"}\
        ::-webkit-scrollbar-thumb{background:"+C.border+";border-radius:2px}\
        button{transition:all 0.15s}\
      "}</style>

      <header style={{ background:C.surface, borderBottom:"1px solid "+C.border, position:"sticky", top:0, zIndex:200 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 28px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 0 14px" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:12 }}>
              <span style={{ fontFamily:Fd, fontSize:36, letterSpacing:"5px", color:C.text, lineHeight:1 }}>FIELD</span>
              <span style={{ fontSize:11, color:C.accent, fontWeight:800, letterSpacing:"4px", fontFamily:Fb, textTransform:"uppercase" }}>Intelligence</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              {breaking.length > 0 && <div style={{ display:"flex", alignItems:"center", gap:6 }}><LiveDot /><span style={{ fontSize:12, color:C.red, fontWeight:800, fontFamily:Fb, letterSpacing:"1px" }}>BREAKING</span></div>}
              <span style={{ fontSize:14, color:C.textDim, fontFamily:Fb }}>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
            </div>
          </div>
          <div style={{ display:"flex", borderTop:"1px solid "+C.border }}>
            <TabBtn id="sports" label={"\u{1F3C6} Sports"} />
            <TabBtn id="news" label={"\u{1F30D} News"} />
            <TabBtn id="markets" label={"\u{1F4C8} Markets"} />
          </div>
        </div>
      </header>

      {breaking.length>0 && (tab==="news"||tab==="markets") && <BreakingBanner items={breaking} />}
      {tickers.length>0 && <Ticker tickers={tickers} />}

      <main style={{ maxWidth:1100, margin:"0 auto", padding:"36px 28px 100px" }}>

        {tab==="sports" && (
          <div>
            <div style={{ display:"flex", overflowX:"auto", borderBottom:"1px solid "+C.border, marginBottom:26 }}>
              {LEAGUES.map(l => (
                <button key={l.id} onClick={() => setLeague(l.id)} style={{ padding:"12px 22px", border:"none", background:"none", cursor:"pointer", fontSize:15, fontWeight:league===l.id?800:500, color:league===l.id?C.text:C.textMid, borderBottom:league===l.id?"3px solid "+l.color:"3px solid transparent", whiteSpace:"nowrap", fontFamily:Fb, transition:"all 0.15s" }}>{l.emoji} {l.name}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:12, marginBottom:26 }}>
              <Pill active={section==="scores"} onClick={() => setSection("scores")}>{"\u{1F3AE}"} Scores {liveCount>0 && <span style={{ marginLeft:8, background:C.red, color:"#fff", borderRadius:10, padding:"2px 7px", fontSize:11, fontWeight:800 }}>{liveCount} LIVE</span>}</Pill>
              <Pill active={section==="news"} onClick={() => setSection("news")}>{"\u{1F4F0}"} Transactions & News</Pill>
            </div>

            {section==="scores" && (
              <div>
                {/* Date navigation */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:20 }}>
                  <button onClick={() => setScoreDate(d => { const n=new Date(d); n.setDate(n.getDate()-1); return n; })} style={{ background:C.card, border:"1px solid "+C.border, borderRadius:8, padding:"8px 14px", color:C.textMid, cursor:"pointer", fontSize:16, fontFamily:Fb, fontWeight:700 }}>{"\u2190"}</button>
                  {[-2,-1,0,1,2].map(offset => {
                    const d = new Date(); d.setDate(d.getDate() + offset);
                    const dStr = d.getFullYear() + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
                    const isActive = scoreDateStr === dStr;
                    const isToday = offset === 0;
                    const label = isToday ? "Today" : d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
                    return (
                      <button key={offset} onClick={() => setScoreDate(new Date(d))} style={{
                        background: isActive ? C.accent+"25" : C.card,
                        border: "1px solid " + (isActive ? C.accent : C.border),
                        borderRadius: 8, padding: "8px 16px", cursor: "pointer",
                        color: isActive ? C.accentBright : C.textMid,
                        fontSize: 13, fontFamily: Fb, fontWeight: isActive ? 700 : 500,
                        whiteSpace: "nowrap", transition: "all 0.15s",
                      }}>{label}</button>
                    );
                  })}
                  <button onClick={() => setScoreDate(d => { const n=new Date(d); n.setDate(n.getDate()+1); return n; })} style={{ background:C.card, border:"1px solid "+C.border, borderRadius:8, padding:"8px 14px", color:C.textMid, cursor:"pointer", fontSize:16, fontFamily:Fb, fontWeight:700 }}>{"\u2192"}</button>
                </div>
                <div style={{ display:"flex", gap:10, marginBottom:22, flexWrap:"wrap" }}>
                  {["all","live","upcoming","final"].map(v => (
                    <Pill key={v} active={gameFilter===v} onClick={() => setGameFilter(v)}>
                      {v.charAt(0).toUpperCase()+v.slice(1)}
                      {v==="live" && liveCount>0 && <span style={{ marginLeft:6, background:C.red, color:"#fff", borderRadius:8, padding:"1px 6px", fontSize:10 }}>{liveCount}</span>}
                    </Pill>
                  ))}
                </div>
                {loading.sports
                  ? <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>{[1,2,3].map(i=><Skeleton key={i} h={200} />)}</div>
                  : leagueGames.length===0
                    ? <div style={{ padding:"60px 0", textAlign:"center", color:C.textDim, fontFamily:Fb, fontSize:16 }}>No games scheduled</div>
                    : <>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                          {leagueGames.map(g => <ScoreCard key={g.id} game={g} onSelect={setSelectedGame} />)}
                        </div>
                        <TopPerformersSection games={leagueGames} />
                      </>
                }
              </div>
            )}

            {section==="news" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {loading.sports ? [1,2,3].map(i=><Skeleton key={i} />) : leagueNews.length===0
                  ? <div style={{ padding:"60px 0", textAlign:"center", color:C.textDim, fontFamily:Fb, fontSize:16 }}>No stories right now</div>
                  : leagueNews.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank} isSports={true} />)
                }
              </div>
            )}
          </div>
        )}

        {tab==="news" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
              <Pill active={catFilter==="all"} onClick={() => setCatFilter("all")}>All</Pill>
              {NEWS_CATS.map(c => <Pill key={c.id} active={catFilter===c.id} onClick={() => setCatFilter(c.id)}>{c.emoji} {c.label}</Pill>)}
            </div>
            {loading.news ? [1,2,3].map(i=><Skeleton key={i} h={180} />) : (
              <>
                {topWorld.length>0 && <div style={{ marginBottom:16 }}>
                  <SectionHead label="TOP STORIES" color={C.gold} />
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{topWorld.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank} isSports={false} />)}</div>
                </div>}
                {moreWorld.length>0 && <div style={{ marginTop:40 }}>
                  <SectionHead label="MORE STORIES" color={C.borderBright} />
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{moreWorld.map(item => <HeadlineCard key={item.id} item={item} rank={null} isSports={false} />)}</div>
                </div>}
              </>
            )}
          </div>
        )}

        {tab==="markets" && (
          <div>
            <div style={{ marginBottom:40 }}>
              <SectionHead label="LIVE MARKETS" color={C.green} sub="Updates every minute" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
                {(tickers.length>0?tickers:Array(10).fill(null)).map((t,i) => t?<MarketCard key={i} t={t} />:<Skeleton key={i} h={100} />)}
              </div>
            </div>
            <SectionHead label="MOVING MARKETS" color={C.green} />
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {mktNews.length===0 ? [1,2].map(i=><Skeleton key={i} />) : mktNews.map(item => <HeadlineCard key={item.id} item={item} rank={item.rank||null} isSports={false} />)}
            </div>
          </div>
        )}

        <div style={{ marginTop:72, paddingTop:24, borderTop:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:Fd, fontSize:20, letterSpacing:"4px", color:C.textDim }}>FIELD</span>
          <span style={{ fontSize:14, color:C.textDim, fontFamily:Fb }}>Updated {new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
        </div>
      </main>
    </div>
  );
}
