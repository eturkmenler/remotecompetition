import { useState, useEffect } from "react";

const KEYWORDS = [
  "remote",
  "remote work",
  "remote jobs",
  "hire remote",
  "remote payroll",
  "remote employer of record",
];

const MOCK_SEED = [
  {
    advertiser: "Deel",
    domain: "deel.com",
    headline: "Global Hiring Made Easy – Hire Anyone, Anywhere",
    description: "Deel handles payroll, compliance & benefits in 150+ countries. No entity needed.",
    displayUrl: "deel.com/global-hiring",
    position: 1,
    estimatedCpc: "$12–18",
    cpcMid: 15,
    badge: "Top Competitor",
    badgeColor: "#ef4444",
    keywords: ["remote", "hire remote", "remote payroll", "remote employer of record"],
  },
  {
    advertiser: "Rippling",
    domain: "rippling.com",
    headline: "Rippling – The All-in-One HR & IT Platform",
    description: "Manage payroll, devices, and apps for remote teams worldwide. Start in 90 seconds.",
    displayUrl: "rippling.com/remote-teams",
    position: 2,
    estimatedCpc: "$10–16",
    cpcMid: 13,
    badge: "Top Competitor",
    badgeColor: "#ef4444",
    keywords: ["remote", "remote work", "hire remote", "remote payroll"],
  },
  {
    advertiser: "Toptal",
    domain: "toptal.com",
    headline: "Hire Top 3% Remote Freelancers – Toptal",
    description: "Access elite remote developers, designers & finance experts. Match in 48hrs.",
    displayUrl: "toptal.com/hire",
    position: 3,
    estimatedCpc: "$8–14",
    cpcMid: 11,
    badge: "Top Competitor",
    badgeColor: "#ef4444",
    keywords: ["remote", "remote jobs", "hire remote"],
  },
  {
    advertiser: "Remote.com",
    domain: "remote.com",
    headline: "Remote – Global Employment Platform",
    description: "Hire, pay & manage remote employees worldwide. EOR, payroll & benefits in 180+ countries.",
    displayUrl: "remote.com",
    position: 4,
    estimatedCpc: "$9–15",
    cpcMid: 12,
    badge: "You",
    badgeColor: "#6366f1",
    keywords: ["remote", "remote work", "remote payroll", "remote employer of record"],
  },
  {
    advertiser: "Oyster HR",
    domain: "oysterhr.com",
    headline: "Oyster – Hire Globally Without the Hassle",
    description: "Compliant global employment for remote-first companies. 180+ countries.",
    displayUrl: "oysterhr.com/global-employment",
    position: 5,
    estimatedCpc: "$7–12",
    cpcMid: 9.5,
    badge: "Emerging",
    badgeColor: "#f59e0b",
    keywords: ["remote", "hire remote", "remote employer of record"],
  },
  {
    advertiser: "Velocity Global",
    domain: "velocityglobal.com",
    headline: "Global EOR & Workforce Solutions – Velocity Global",
    description: "Expand globally without entity setup. Employer of Record in 185+ countries.",
    displayUrl: "velocityglobal.com/eor",
    position: 6,
    estimatedCpc: "$11–17",
    cpcMid: 14,
    badge: "Active",
    badgeColor: "#10b981",
    keywords: ["remote", "remote payroll", "remote employer of record"],
  },
  {
    advertiser: "G2",
    domain: "g2.com",
    headline: "Best Remote Work Software 2024 – G2 Reviews",
    description: "Compare top remote team tools. Read 500k+ reviews from real users.",
    displayUrl: "g2.com/categories/remote-work",
    position: 7,
    estimatedCpc: "$3–6",
    cpcMid: 4.5,
    badge: "Non-Direct",
    badgeColor: "#64748b",
    keywords: ["remote", "remote work"],
  },
  {
    advertiser: "Indeed",
    domain: "indeed.com",
    headline: "Remote Jobs Near You – Indeed.com",
    description: "Millions of remote job listings. Get hired faster with Indeed.",
    displayUrl: "indeed.com/remote-jobs",
    position: 8,
    estimatedCpc: "$2–5",
    cpcMid: 3.5,
    badge: "Non-Direct",
    badgeColor: "#64748b",
    keywords: ["remote", "remote jobs", "remote work"],
  },
];

const CPC_RANGES = {
  "remote": { low: 2, avg: 8, high: 18, volume: "1M–10M/mo" },
  "remote work": { low: 1.5, avg: 5, high: 12, volume: "100k–1M/mo" },
  "remote jobs": { low: 1, avg: 3, high: 8, volume: "1M–10M/mo" },
  "hire remote": { low: 6, avg: 14, high: 22, volume: "10k–100k/mo" },
  "remote payroll": { low: 8, avg: 18, high: 30, volume: "10k–100k/mo" },
  "remote employer of record": { low: 10, avg: 22, high: 40, volume: "1k–10k/mo" },
};

function Sparkbar({ value, max, color }) {
  return (
    <div style={{ background: "#1e293b", borderRadius: 4, height: 6, width: "100%", overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.min(100, (value / max) * 100)}%`,
          height: "100%",
          background: color,
          borderRadius: 4,
          transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </div>
  );
}

// Per-advertiser trademark CPC reduction factor (how much auction pressure they add)
// Competitors using "remote" in copy drive up your CPC more aggressively
const TRADEMARK_REDUCTION = {
  "Deel": 0.28,          // 28% reduction - heavy bidder, very aggressive
  "Rippling": 0.24,
  "Toptal": 0.18,
  "Remote.com": 0,       // you — your own CPC unaffected
  "Oyster HR": 0.15,
  "Velocity Global": 0.22,
  "G2": 0.08,
  "Indeed": 0.06,
};

// Aggregate market CPC reduction when trademark enforced (competitors removed from auction)
const KEYWORD_TRADEMARK_REDUCTION = {
  "remote": 0.31,
  "remote work": 0.22,
  "remote jobs": 0.14,
  "hire remote": 0.28,
  "remote payroll": 0.25,
  "remote employer of record": 0.30,
};

function formatCurrency(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000).toLocaleString()}k`;
  return `$${Math.round(n).toLocaleString()}`;
}

export default function App() {
  const [activeKeyword, setActiveKeyword] = useState("remote");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [tab, setTab] = useState("advertisers");
  const [animKey, setAnimKey] = useState(0);
  const [trademarkActive, setTrademarkActive] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(400000);

  const filteredAds = MOCK_SEED.filter((a) => a.keywords.includes(activeKeyword));
  const cpc = CPC_RANGES[activeKeyword];

  const kwReduction = KEYWORD_TRADEMARK_REDUCTION[activeKeyword] || 0.25;
  const cpcWithTrademark = +(cpc.avg * (1 - kwReduction)).toFixed(2);
  const currentClicks = Math.round(monthlyBudget / cpc.avg);
  const trademarkClicks = Math.round(monthlyBudget / cpcWithTrademark);
  const extraClicks = trademarkClicks - currentClicks;
  const savingsEquivalent = Math.round(extraClicks * cpc.avg); // dollar value of extra clicks

  async function fetchLiveInsights() {
    setLoading(true);
    setFetchError(null);
    setLiveData(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `You are a Google Ads intelligence analyst. Search for current Google advertisers bidding on the keyword "${activeKeyword}". 
Return ONLY a JSON object (no markdown, no backticks) with this structure:
{
  "keyword": "${activeKeyword}",
  "fetchedAt": "<ISO timestamp>",
  "topAdvertisers": [
    { "name": "Company", "domain": "domain.com", "headline": "Ad headline", "estimatedCpc": "$X–Y" }
  ],
  "insight": "1-2 sentence market observation"
}
Include 3-5 advertisers you find evidence of bidding on this keyword. Use web search to verify current activity.`,
          messages: [
            {
              role: "user",
              content: `Search for who is currently running Google Ads for the keyword "${activeKeyword}" and return JSON with top advertisers and CPC estimates.`,
            },
          ],
        }),
      });
      const data = await response.json();
      const text = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setLiveData(parsed);
    } catch (e) {
      setFetchError("Could not fetch live data. Showing estimated intelligence below.");
    }
    setLoading(false);
  }

  function switchKeyword(kw) {
    setActiveKeyword(kw);
    setAnimKey((k) => k + 1);
    setLiveData(null);
    setFetchError(null);
  }

  const maxCpc = Math.max(...filteredAds.map((a) => a.cpcMid));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        color: "#e2e8f0",
        fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
        padding: "0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .ad-row { animation: fadeSlideIn 0.4s ease both; }
        .pulse { animation: pulse-dot 1.5s ease infinite; }
        .kw-btn {
          padding: 6px 14px;
          border-radius: 3px;
          border: 1px solid #1e293b;
          background: transparent;
          color: #64748b;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .kw-btn:hover { border-color: #6366f1; color: #a5b4fc; }
        .kw-btn.active { background: #1e1b4b; border-color: #6366f1; color: #a5b4fc; }
        .tab-btn {
          padding: 8px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #64748b;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .tab-btn.active { color: #a5b4fc; border-bottom-color: #6366f1; }
        .live-btn {
          padding: 8px 18px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border: none;
          border-radius: 4px;
          color: white;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: opacity 0.2s;
        }
        .live-btn:hover { opacity: 0.85; }
        .live-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(14,20,40,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
            }}
            className="pulse"
          />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", color: "#f1f5f9" }}>
            GOOGLE ADS INTELLIGENCE
          </span>
          <span style={{ color: "#334155", fontSize: 11 }}>// keyword monitor</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#475569", fontSize: 10, letterSpacing: "0.1em" }}>
            MARKET DATA · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {/* Budget input */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d1526", border: "1px solid #1e293b", borderRadius: 4, padding: "4px 10px" }}>
            <span style={{ color: "#475569", fontSize: 10 }}>BUDGET/MO</span>
            <span style={{ color: "#64748b", fontSize: 11 }}>$</span>
            <input
              type="number"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(Math.max(1000, Number(e.target.value)))}
              style={{ background: "transparent", border: "none", color: "#a5b4fc", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, width: 80, outline: "none" }}
            />
          </div>
          {/* Trademark toggle */}
          <button
            onClick={() => setTrademarkActive(t => !t)}
            style={{
              padding: "7px 14px",
              background: trademarkActive ? "linear-gradient(135deg, #064e3b, #065f46)" : "#0d1526",
              border: `1px solid ${trademarkActive ? "#10b981" : "#1e293b"}`,
              borderRadius: 4,
              color: trademarkActive ? "#10b981" : "#475569",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}
          >
            {trademarkActive ? "™ TRADEMARK ON" : "™ TRADEMARK OFF"}
          </button>
          <button
            className="live-btn"
            onClick={fetchLiveInsights}
            disabled={loading}
          >
            {loading ? "SCANNING..." : "⚡ LIVE FETCH"}
          </button>
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Keyword selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.15em", marginBottom: 10 }}>SELECT KEYWORD</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {KEYWORDS.map((kw) => (
              <button
                key={kw}
                className={`kw-btn ${activeKeyword === kw ? "active" : ""}`}
                onClick={() => switchKeyword(kw)}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* CPC Overview */}
        <div
          key={`cpc-${animKey}`}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
            marginBottom: trademarkActive ? 12 : 28,
            animation: "fadeSlideIn 0.5s ease",
          }}
        >
          {[
            { label: "AVG CPC NOW", value: `$${cpc.avg}`, sub: "current market", color: "#6366f1" },
            { label: "CPC W/ TRADEMARK", value: `$${cpcWithTrademark}`, sub: `−${Math.round(kwReduction * 100)}% fewer bidders`, color: "#10b981" },
            { label: "CLICKS/MO NOW", value: currentClicks.toLocaleString(), sub: `at $${(monthlyBudget/1000).toFixed(0)}k budget`, color: "#f59e0b" },
            { label: "CLICKS W/ TRADEMARK", value: trademarkClicks.toLocaleString(), sub: `+${extraClicks.toLocaleString()} extra`, color: "#10b981" },
            { label: "SAVINGS EQUIVALENT", value: formatCurrency(savingsEquivalent), sub: "extra click value/mo", color: "#ef4444" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#0d1526",
                border: "1px solid #1e293b",
                borderRadius: 6,
                padding: "16px 20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: stat.color,
                  opacity: 0.6,
                }}
              />
              <div style={{ color: "#475569", fontSize: 9, letterSpacing: "0.15em", marginBottom: 8 }}>{stat.label}</div>
              <div style={{ color: stat.color, fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </div>
              <div style={{ color: "#334155", fontSize: 10, marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Trademark savings banner */}
        {trademarkActive && (
          <div style={{
            background: "linear-gradient(135deg, #022c22, #064e3b)",
            border: "1px solid #10b981",
            borderRadius: 6,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 24,
            animation: "fadeSlideIn 0.3s ease",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} className="pulse" />
            <div>
              <div style={{ color: "#10b981", fontSize: 11, letterSpacing: "0.1em", marginBottom: 3 }}>™ TRADEMARK SCENARIO ACTIVE</div>
              <div style={{ color: "#6ee7b7", fontSize: 12 }}>
                If Remote.com's trademark blocks competitors from bidding, your CPC drops from <strong style={{color:"#fff"}}>${cpc.avg}</strong> → <strong style={{color:"#10b981"}}>${cpcWithTrademark}</strong> on "{activeKeyword}".
                At a ${(monthlyBudget/1000).toFixed(0)}k/mo budget that's <strong style={{color:"#10b981"}}>{extraClicks.toLocaleString()} extra clicks</strong> worth <strong style={{color:"#10b981"}}>{formatCurrency(savingsEquivalent)}</strong>/mo in additional reach — without spending a cent more.
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid #1e293b", marginBottom: 24, display: "flex", gap: 4 }}>
          {["advertisers", "ad copy", "keyword map"].map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Live data banner */}
        {liveData && (
          <div
            style={{
              background: "linear-gradient(135deg, #0f2027, #1a1035)",
              border: "1px solid #4f46e5",
              borderRadius: 6,
              padding: "16px 20px",
              marginBottom: 20,
              animation: "fadeSlideIn 0.4s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} className="pulse" />
              <span style={{ color: "#a5b4fc", fontSize: 11, letterSpacing: "0.1em" }}>LIVE INTELLIGENCE · {liveData.keyword?.toUpperCase()}</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>{liveData.insight}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {liveData.topAdvertisers?.map((a, i) => (
                <div
                  key={i}
                  style={{
                    background: "#1e1b4b",
                    border: "1px solid #3730a3",
                    borderRadius: 4,
                    padding: "6px 12px",
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: "#e2e8f0" }}>{a.name}</span>
                  <span style={{ color: "#6366f1", marginLeft: 8 }}>{a.estimatedCpc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {fetchError && (
          <div style={{ color: "#f59e0b", fontSize: 11, marginBottom: 16, padding: "8px 12px", background: "#1c1407", borderRadius: 4, border: "1px solid #451a03" }}>
            ⚠ {fetchError}
          </div>
        )}

        {/* ADVERTISERS TAB */}
        {tab === "advertisers" && (
          <div key={animKey}>
            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr 88px 88px 110px 110px 70px",
                gap: 12,
                padding: "8px 16px",
                color: "#334155",
                fontSize: 9,
                letterSpacing: "0.15em",
                marginBottom: 6,
              }}
            >
              <span>#</span>
              <span>ADVERTISER</span>
              <span>CPC NOW</span>
              <span>CPC W/ ™</span>
              <span>BID STRENGTH</span>
              <span>
                <span style={{ color: trademarkActive ? "#10b981" : "#334155" }}>
                  {trademarkActive ? "★ SAVINGS/MO" : "SAVINGS/MO"}
                </span>
              </span>
              <span>TYPE</span>
            </div>

            {filteredAds.map((ad, i) => {
              const reduction = TRADEMARK_REDUCTION[ad.advertiser] ?? 0.15;
              const cpcWithTm = ad.badge === "You" ? ad.cpcMid : +(ad.cpcMid * (1 - reduction)).toFixed(2);
              // Savings for Remote.com = how much less we pay per click if this competitor is removed
              // = reduction * their contribution to auction pressure * Remote.com's spend share
              const competitorClicksRemovedValue = ad.badge !== "You"
                ? Math.round((monthlyBudget / cpc.avg) * reduction * 0.15 * ad.cpcMid)
                : null;

              return (
                <div
                  key={ad.advertiser}
                  className="ad-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr 88px 88px 110px 110px 70px",
                    gap: 12,
                    padding: "14px 16px",
                    background: ad.badge === "You" ? "rgba(99,102,241,0.06)" : trademarkActive && ad.badge !== "You" && ad.badge !== "Non-Direct" ? "rgba(239,68,68,0.04)" : "#0d1526",
                    border: `1px solid ${ad.badge === "You" ? "#3730a3" : trademarkActive && ad.badge !== "You" && ad.badge !== "Non-Direct" ? "#450a0a" : "#1e293b"}`,
                    borderRadius: 6,
                    marginBottom: 6,
                    alignItems: "center",
                    animationDelay: `${i * 0.06}s`,
                    cursor: "default",
                    opacity: trademarkActive && ad.badge !== "You" && ad.badge !== "Non-Direct" ? 0.75 : 1,
                    position: "relative",
                  }}
                >
                  <span style={{ color: "#334155", fontSize: 11 }}>{i + 1}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ color: "#f1f5f9", fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                        {ad.advertiser}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          padding: "2px 7px",
                          borderRadius: 3,
                          background: `${ad.badgeColor}22`,
                          color: ad.badgeColor,
                          border: `1px solid ${ad.badgeColor}44`,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {ad.badge}
                      </span>
                      {trademarkActive && ad.badge !== "You" && ad.badge !== "Non-Direct" && (
                        <span style={{ fontSize: 9, color: "#ef4444", letterSpacing: "0.08em" }}>BLOCKED ™</span>
                      )}
                    </div>
                    <div style={{ color: "#475569", fontSize: 10 }}>{ad.displayUrl}</div>
                  </div>

                  {/* CPC Now */}
                  <div style={{ color: "#10b981", fontSize: 13, fontWeight: 500 }}>${ad.cpcMid}</div>

                  {/* CPC w/ Trademark */}
                  <div>
                    {ad.badge === "You" ? (
                      <span style={{ color: "#475569", fontSize: 11 }}>—</span>
                    ) : (
                      <div>
                        <div style={{ color: trademarkActive ? "#10b981" : "#64748b", fontSize: 13, fontWeight: 500 }}>
                          ${cpcWithTm}
                        </div>
                        <div style={{ color: "#334155", fontSize: 9 }}>−{Math.round(reduction * 100)}% bid</div>
                      </div>
                    )}
                  </div>

                  {/* Bid strength bar */}
                  <div style={{ width: "100%" }}>
                    <Sparkbar value={ad.cpcMid} max={maxCpc} color={ad.badge === "You" ? "#6366f1" : ad.badge === "Top Competitor" ? "#ef4444" : "#475569"} />
                    <div style={{ color: "#334155", fontSize: 9, marginTop: 3 }}>${ad.cpcMid}/click est.</div>
                  </div>

                  {/* Savings/mo */}
                  <div>
                    {ad.badge === "You" ? (
                      <div>
                        <div style={{ color: trademarkActive ? "#10b981" : "#334155", fontSize: 13, fontWeight: 600 }}>
                          {trademarkActive ? formatCurrency(savingsEquivalent) : "—"}
                        </div>
                        {trademarkActive && <div style={{ color: "#10b981", fontSize: 9 }}>total mkt impact</div>}
                      </div>
                    ) : (
                      <div>
                        <div style={{ color: trademarkActive ? "#10b981" : "#334155", fontSize: 13, fontWeight: 500 }}>
                          {trademarkActive ? formatCurrency(competitorClicksRemovedValue) : "—"}
                        </div>
                        {trademarkActive && <div style={{ color: "#475569", fontSize: 9 }}>if removed</div>}
                      </div>
                    )}
                  </div>

                  <span style={{ color: "#475569", fontSize: 10 }}>
                    {ad.badge === "You" ? "🟣 Own" : ad.badge === "Non-Direct" ? "⬜ Agg." : "🔴 Direct"}
                  </span>
                </div>
              );
            })}

            <div style={{ color: "#1e293b", fontSize: 10, marginTop: 16, textAlign: "center", letterSpacing: "0.08em" }}>
              CPC estimates based on industry benchmarks · Trademark savings modeled at {Math.round(kwReduction * 100)}% auction pressure reduction for "{activeKeyword}" · Toggle ™ to compare scenarios
            </div>
          </div>
        )}

        {/* AD COPY TAB */}
        {tab === "ad copy" && (
          <div key={`copy-${animKey}`}>
            {filteredAds.map((ad, i) => (
              <div
                key={ad.advertiser}
                className="ad-row"
                style={{
                  background: "#0d1526",
                  border: `1px solid ${ad.badge === "You" ? "#3730a3" : "#1e293b"}`,
                  borderRadius: 6,
                  padding: "16px 20px",
                  marginBottom: 10,
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 9, color: "#10b981", letterSpacing: "0.1em" }}>Ad</span>
                      <span style={{ color: "#475569", fontSize: 11 }}>{ad.displayUrl}</span>
                    </div>
                    <div style={{ color: "#6366f1", fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 4 }}>
                      {ad.headline}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{ad.description}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                    <div style={{ color: "#10b981", fontSize: 13, fontWeight: 600 }}>{ad.estimatedCpc}</div>
                    <div style={{ color: "#334155", fontSize: 9, letterSpacing: "0.1em" }}>est. CPC</div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8, marginTop: 4 }}>
                  <span
                    style={{
                      fontSize: 9,
                      padding: "2px 7px",
                      borderRadius: 3,
                      background: `${ad.badgeColor}22`,
                      color: ad.badgeColor,
                      border: `1px solid ${ad.badgeColor}44`,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {ad.badge} · {ad.advertiser}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KEYWORD MAP TAB */}
        {tab === "keyword map" && (
          <div key={`map-${animKey}`} style={{ animation: "fadeSlideIn 0.4s ease" }}>
            <div style={{ marginBottom: 16, color: "#64748b", fontSize: 11 }}>
              Estimated CPC ranges across related keywords — sorted by bid value
            </div>
            {Object.entries(CPC_RANGES)
              .sort((a, b) => b[1].avg - a[1].avg)
              .map(([kw, data], i) => (
                <div
                  key={kw}
                  className="ad-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 80px 80px 80px 1fr 100px",
                    gap: 16,
                    padding: "12px 16px",
                    background: kw === activeKeyword ? "rgba(99,102,241,0.06)" : "#0d1526",
                    border: `1px solid ${kw === activeKeyword ? "#3730a3" : "#1e293b"}`,
                    borderRadius: 6,
                    marginBottom: 6,
                    alignItems: "center",
                    animationDelay: `${i * 0.06}s`,
                    cursor: "pointer",
                  }}
                  onClick={() => switchKeyword(kw)}
                >
                  <span style={{ color: kw === activeKeyword ? "#a5b4fc" : "#e2e8f0", fontSize: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {kw}
                  </span>
                  <span style={{ color: "#10b981", fontSize: 12 }}>${data.low}</span>
                  <span style={{ color: "#f59e0b", fontSize: 12 }}>${data.avg}</span>
                  <span style={{ color: "#ef4444", fontSize: 12 }}>${data.high}</span>
                  <Sparkbar value={data.avg} max={22} color={kw === activeKeyword ? "#6366f1" : "#334155"} />
                  <span style={{ color: "#475569", fontSize: 10 }}>{data.volume}</span>
                </div>
              ))}
            <div style={{ display: "grid", gridTemplateColumns: "200px 80px 80px 80px 1fr 100px", gap: 16, padding: "6px 16px", color: "#334155", fontSize: 9, letterSpacing: "0.12em", marginTop: 4 }}>
              <span>KEYWORD</span><span>LOW</span><span>AVG</span><span>HIGH</span><span></span><span>VOLUME</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
