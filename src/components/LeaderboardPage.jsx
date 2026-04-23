
import React, { useState, useEffect } from "react";
import { C, CHALLENGES } from "../data/constants/constants.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Card, SectionHeader, Pill, Avatar } from "./shared/Atoms.jsx";
import { supabase } from "../utils/supabase.js";

// ── Leaderboard Page (Real-time) ──────────────────────────────────────────────
function LeaderboardPage({ user, results }) {
  const { isMobile } = useBreakpoint();
  const [tab, setTab] = useState("global");
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
        // Fetch all user profiles with their stats
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, points, streak, role")
          .order("points", { ascending: false })
          .limit(100);

        if (error) throw error;

        // Fetch submission counts for each user
        const { data: submissions, error: subError } = await supabase
          .from("submissions")
          .select("user_id, challenge_id")
          .order("created_at", { ascending: false });

        if (subError) throw subError;

        // Calculate solved count per user
        const userSolvedCount = {};
        submissions?.forEach(sub => {
          if (!userSolvedCount[sub.user_id]) {
            userSolvedCount[sub.user_id] = new Set();
          }
          userSolvedCount[sub.user_id].add(sub.challenge_id);
        });

        // Combine and format leaderboard data
        const formattedLeaderboard = profiles?.map((profile, index) => ({
          rank: index + 1,
          id: profile.id,
          name: profile.full_name || "Anonymous",
          avatar: profile.avatar_url ? profile.avatar_url[0].toUpperCase() : "U",
          pts: profile.points || 0,
          solved: userSolvedCount[profile.id]?.size || 0,
          streak: profile.streak || 0,
          badge: index < 3 ? ["⭐", "✨", "🌟"][index] : "🔥",
          country: "🌍",
          isYou: profile.id === user?.id
        })) || [];

        setLeaderboard(formattedLeaderboard);

        // Find user's rank
        const userIndex = formattedLeaderboard.findIndex(p => p.isYou);
        if (userIndex !== -1) {
          setUserRank(formattedLeaderboard[userIndex]);
        } else {
          // Calculate rank for current user even if not in top 100
          const userSolved = results.length;
          const userPoints = user?.points || totalXP;
          
          // Count users with higher points
          const higherRanked = formattedLeaderboard.filter(p => p.pts > userPoints).length;
          
          setUserRank({
            rank: higherRanked + 1,
            name: user?.name || "You",
            avatar: user?.avatar || "U",
            pts: userPoints,
            solved: userSolved,
            streak: user?.streak || 5,
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
  const tabs = ["global", "weekly", "friends"];

  // Get top 10 for display (or show loading)
  const displayBoard = loading ? [] : (leaderboard.length > 0 ? leaderboard.slice(0, 10) : []);
  
  // Include current user in the display if not in top 10
  if (!loading && userRank && !displayBoard.find(p => p.isYou)) {
    displayBoard.push(userRank);
  }

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
                    <div style={{ fontWeight: 800, fontSize: isMobile ? 11 : 13, color: C.text, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p?.name?.split(" ")[0] || "-"}</div>
                    <div style={{ fontWeight: 900, fontSize: isMobile ? 13 : 15, color: podiumColors[i] }}>{(p?.pts || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ width: isMobile ? 60 : 80, background: podiumColors[i] + "33", border: `2px solid ${podiumColors[i]}`, borderRadius: "8px 8px 0 0", height: heights[i], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 900, fontSize: isMobile ? 22 : 28, color: podiumColors[i] }}>#{realRank + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {tabs.map(t => <Pill key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={tab === t} onClick={() => setTab(t)} />)}
        </div>

        {/* Full table - only show when not loading */}
        {!loading && displayBoard.length > 0 && (
        <Card>
          <SectionHeader title="Rankings" sub={tab === "global" ? "Top 10 coders worldwide" : tab === "weekly" ? "This week's top performers" : "Your friend group"} />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 70px 70px 60px", gap: 8, padding: "8px 12px", background: C.bg, borderRadius: 8, marginBottom: 8 }}>
              {["#", "Name", "Points", "Solved", "Streak", "Country"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: .5 }}>{h}</div>
              ))}
            </div>
            {displayBoard.map((p, i) => {
              const isYou = p.isYou;
              const displayRank = p.rank || (i + 1);
              return (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 70px 70px 60px", gap: 8, padding: "10px 12px", borderRadius: 10, background: isYou ? C.indigoLight : "transparent", border: isYou ? `1.5px solid ${C.indigo}33` : "1.5px solid transparent", marginBottom: 4, alignItems: "center", transition: "background .15s" }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: i < 3 ? rankColors[i] : C.muted, textAlign: "center" }}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : displayRank}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <Avatar initials={p.avatar} size={30} bg={i === 0 ? C.amber : i === 1 ? C.muted : i === 2 ? C.orange : C.indigo} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isYou ? C.indigo : C.text }}>{p.name}{isYou ? " (You)" : ""}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: i < 3 ? rankColors[i] : C.text }}>{p.pts.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.solved}/{CHALLENGES.length}</div>
                  <div style={{ fontSize: 12, color: C.amber }}>🔥 {p.streak}d</div>
                  <div style={{ fontSize: 16 }}>{p.country}</div>
                </div>
              );
            })}
          </div>
        </Card>
        )}

        {/* Your stats card - update with real rank */}
        <Card style={{ marginTop: 14, background: C.dark }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: "#fff", margin: "0 0 4px" }}>Your Standing</h3>
              <p style={{ color: "#666", fontSize: 12, margin: 0 }}>{loading ? "Loading your rank..." : `Rank #${userRank?.rank || "-"} out of ${leaderboard.length} coders`}</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["Rank", `#${userRank?.rank || "-"}`, C.amber], ["Points", (user?.points || userRank?.pts || totalXP).toLocaleString(), C.indigo], ["Solved", results.length, C.green], ["XP Earned", totalXP, C.orange]].map(([l, v, col]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: 18, color: col }}>{v}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>{l}</div>
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
