
import React, { useState, useEffect } from "react";
import { C, CHALLENGES } from "../constants/constants.js";
import useBreakpoint from "../hooks/useBreakpoint.js";
import { PageHero, Card, SectionHeader, Pill, Avatar } from "../components/common/Atoms.jsx";
import { supabase } from "../services/supabase.js";
import { fetchLeaderboard as fetchLeaderboardApi } from "../services/api.js";

// ── Leaderboard Page (Real-time) ──────────────────────────────────────────────
function LeaderboardPage({ user, results }) {
  const { isMobile } = useBreakpoint();
  const [tab, setTab] = useState("combined");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const totalXP = results.reduce((a, r) => a + (r.challenge.xp || 100), 0);

  // Fetch real-time leaderboard data
  useEffect(() => {
    if (!user?.id) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const profiles = await fetchLeaderboardApi();
        const formattedLeaderboard = profiles.map((profile, index) => ({
          ...profile,
          rank: index + 1,
          badge: index < 3 ? ["⭐", "✨", "🌟"][index] : "🔥",
          country: "🌍",
          isYou: profile.id === user?.id,
        }));

        setLeaderboard(formattedLeaderboard);

        // Find user's rank
        const userIndex = formattedLeaderboard.findIndex(p => p.isYou);
        if (userIndex !== -1) {
          setUserRank(formattedLeaderboard[userIndex]);
        } else {
          // Calculate rank for current user even if not in top 100
          const userSolved = results.length;
          const userPoints = user?.points || totalXP;
          const ownAvgScore = results.length ? Math.round(results.reduce((a, r) => a + r.codeScore, 0) / results.length) : 0;
          const ownAvgIntegrity = results.length ? Math.round(results.reduce((a, r) => a + r.integrityScore, 0) / results.length) : 0;
          const maxPoints = Math.max(1, ...formattedLeaderboard.map(p => p.pts || 0), userPoints);
          const ownXpNormalized = Math.round((userPoints / maxPoints) * 100);
          const ownCombined = Math.round(ownAvgIntegrity * 0.4 + ownAvgScore * 0.3 + ownXpNormalized * 0.3);

          // Count users with higher points
          const higherRanked = formattedLeaderboard.filter(p => p.pts > userPoints).length;

          setUserRank({
            rank: higherRanked + 1,
            name: user?.name || "You",
            avatar: user?.avatar || "U",
            pts: userPoints,
            solved: userSolved,
            streak: user?.streak || 5,
            avgScore: ownAvgScore,
            avgIntegrity: ownAvgIntegrity,
            combined: ownCombined,
            badge: "⭐",
            country: "🌍",
            isYou: true
          });
        }
      } catch (e) {
        console.error("Failed to fetch leaderboard:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Set up real-time subscription for leaderboard updates
    const subscription = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        // Refresh leaderboard when profiles are updated
        fetchLeaderboard();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, (payload) => {
        // Refresh leaderboard when new submissions are made
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, user?.points, results.length, totalXP]);

  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const RANK_CRITERIA = {
    combined: { label: "Combined", metric: "combined", suffix: "", desc: "Weighted: 40% integrity, 30% score, 30% XP" },
    xp: { label: "XP", metric: "pts", suffix: "", desc: "Ranked by total points earned" },
    integrity: { label: "Integrity", metric: "avgIntegrity", suffix: "%", desc: "Ranked by average integrity score" },
    score: { label: "Score", metric: "avgScore", suffix: "%", desc: "Ranked by average code score" },
  };
  const tabs = Object.keys(RANK_CRITERIA);
  const activeCriteria = RANK_CRITERIA[tab];

  // Re-rank the full leaderboard (+ the current user, if outside top 100) by the selected criterion
  const rankedBoard = React.useMemo(() => {
    const pool = [...leaderboard];
    if (userRank && !pool.find(p => p.isYou)) pool.push(userRank);
    return pool
      .slice()
      .sort((a, b) => (b[activeCriteria.metric] || 0) - (a[activeCriteria.metric] || 0))
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [leaderboard, userRank, tab]);

  // Display the complete ranked board so every registered profile is visible.
  const displayBoard = loading ? [] : rankedBoard;
  const youInRanked = rankedBoard.find(p => p.isYou);

  return (
    <div style={{ overflowY: "auto", flex: 1, background: C.bg }}>
      <PageHero tag="🏆 Leaderboard" title="Top Coders Worldwide" sub="Compete, climb, and prove your rank among the best." />
      <div className="sl-page-wrap" style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>

        {/* Loading State */}
        {loading && (
          <Card style={{ marginBottom: 16, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 14, color: C.muted }}>Loading leaderboard...</div>
          </Card>
        )}

        {/* Top 3 podium - only show when not loading */}
        {!loading && displayBoard.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: isMobile ? 12 : 24, padding: isMobile ? "12px 0" : "20px 0" }}>
            {[displayBoard[1], displayBoard[0], displayBoard[2]].filter(Boolean).map((p, i) => {
              const order = [1, 0, 2];
              const heights = isMobile ? [90, 110, 80] : [110, 134, 96];
              const podiumColors = ["#C0C0C0", "#FFD700", "#CD7F32"];
              const realRank = order[i];
              return (
                <div key={p?.id || i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: isMobile ? 16 : 20, marginBottom: 2 }}>{p.badge}</div>
                  <Avatar initials={p.avatar} size={isMobile ? 40 : 52} bg={podiumColors[i]} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 600, fontSize: isMobile ? 11 : 13, color: C.text, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p?.name?.split(" ")[0] || "-"}</div>
                    <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15, color: podiumColors[i] }}>{(p?.[activeCriteria.metric] || 0).toLocaleString()}{activeCriteria.suffix}</div>
                  </div>
                  <div style={{ width: isMobile ? 60 : 80, background: podiumColors[i] + "33", border: `2px solid ${podiumColors[i]}`, borderRadius: "8px 8px 0 0", height: heights[i], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: isMobile ? 22 : 28, color: podiumColors[i] }}>#{realRank + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          {tabs.map(t => <Pill key={t} label={RANK_CRITERIA[t].label} active={tab === t} onClick={() => setTab(t)} />)}
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 14px" }}>{activeCriteria.desc}</p>

        {/* Full table - only show when not loading */}
        {!loading && displayBoard.length > 0 && (
        <Card>
          <SectionHeader title="Rankings" sub={`Ranked by ${activeCriteria.label.toLowerCase()} — ${activeCriteria.desc.toLowerCase()}`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 74px 64px 64px 64px", gap: 8, padding: "8px 12px", background: C.bg, borderRadius: 8, marginBottom: 8 }}>
              {["#", "Name", activeCriteria.label, "XP", "Integrity", "Score"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: .5 }}>{h}</div>
              ))}
            </div>
            {displayBoard.map((p, i) => {
              const isYou = p.isYou;
              const displayRank = p.rank || (i + 1);
              return (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 74px 64px 64px 64px", gap: 8, padding: "10px 12px", borderRadius: 10, background: isYou ? C.indigoLight : "transparent", border: isYou ? `1.5px solid ${C.indigo}33` : "1.5px solid transparent", marginBottom: 4, alignItems: "center", transition: "background .15s" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: i < 3 ? rankColors[i] : C.muted, textAlign: "center" }}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : displayRank}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <Avatar initials={p.avatar} size={30} bg={i === 0 ? C.amber : i === 1 ? C.muted : i === 2 ? C.orange : C.indigo} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isYou ? C.indigo : C.text }}>{p.name}{isYou ? " (You)" : ""}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: i < 3 ? rankColors[i] : C.indigo }}>{(p[activeCriteria.metric] || 0).toLocaleString()}{activeCriteria.suffix}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{(p.pts || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.avgIntegrity || 0}%</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.avgScore || 0}%</div>
                </div>
              );
            })}
          </div>
        </Card>
        )}

        {/* Your stats card - reflects rank in the currently selected criterion */}
        <Card style={{ marginTop: 14, background: C.dark }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 15, color: "#fff", margin: "0 0 4px" }}>Your Standing — {activeCriteria.label}</h3>
              <p style={{ color: "#6B6F7B", fontSize: 12, margin: 0 }}>{loading ? "Loading your rank..." : `Rank #${youInRanked?.rank || "-"} out of ${rankedBoard.length} coders`}</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["Rank", `#${youInRanked?.rank || "-"}`, C.amber], ["XP", (user?.points || userRank?.pts || totalXP).toLocaleString(), C.indigo], ["Integrity", `${userRank?.avgIntegrity || 0}%`, C.green], ["Score", `${userRank?.avgScore || 0}%`, C.orange], ["Combined", `${userRank?.combined || 0}%`, "#A79CEE"]].map(([l, v, col]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: col }}>{v}</div>
                  <div style={{ fontSize: 10, color: "#4A4E5A" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


export default LeaderboardPage;
