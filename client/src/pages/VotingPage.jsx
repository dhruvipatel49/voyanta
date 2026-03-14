import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { fetchVoteResults } from "../services/api";
import PlaceCard from "../components/PlaceCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function VotingPage() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const [wishlistedPlaces, setWishlistedPlaces] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [voteResults, setVoteResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tripId]);

  async function loadData() {
    const { data: wishlist } = await supabase
      .from("wishlist")
      .select("place_id")
      .eq("trip_id", tripId);

    if (wishlist?.length > 0) {
      const placeIds = [...new Set(wishlist.map((w) => w.place_id))];
      const { data: places } = await supabase
        .from("places")
        .select("*")
        .in("id", placeIds);
      setWishlistedPlaces(places || []);
    }

    const { data: votes } = await supabase
      .from("votes")
      .select("place_id, vote")
      .eq("trip_id", tripId)
      .eq("user_id", user.id);

    const voteMap = {};
    (votes || []).forEach((v) => (voteMap[v.place_id] = v.vote));
    setUserVotes(voteMap);

    try {
      const results = await fetchVoteResults(tripId);
      setVoteResults(results);
    } catch { /* no votes yet */ }

    setLoading(false);
  }

  async function castVote(placeId, voteValue) {
    const currentVote = userVotes[placeId];

    if (voteValue === -1) {
      // Downvote = remove your vote entirely (no negative votes allowed)
      if (currentVote) {
        await supabase
          .from("votes")
          .delete()
          .eq("trip_id", tripId)
          .eq("place_id", placeId)
          .eq("user_id", user.id);
      }
    } else if (currentVote === voteValue) {
      // Clicking upvote again = toggle off (remove vote)
      await supabase
        .from("votes")
        .delete()
        .eq("trip_id", tripId)
        .eq("place_id", placeId)
        .eq("user_id", user.id);
    } else {
      // Upvote: insert/update with vote = 1
      await supabase.from("votes").upsert(
        { trip_id: tripId, place_id: placeId, user_id: user.id, vote: 1 },
        { onConflict: "trip_id,place_id,user_id" }
      );
    }
    loadData();
  }

  function getVoteCount(placeId) {
    const result = voteResults.find((r) => r.place_id === placeId);
    return Math.max(result?.total_votes || 0, 0);
  }

  function getVoters(placeId) {
    const result = voteResults.find((r) => r.place_id === placeId);
    return result?.voters || [];
  }

  if (loading) return <LoadingSpinner message="Loading votes..." />;

  // Get top 3 for leaderboard
  const sorted = [...wishlistedPlaces].sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id));
  const top3 = sorted.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];
  const styles = ["gold", "silver", "bronze"];

  return (
    <>
      <div className="page-header">
        <h1>🗳️ Collaborative Voting</h1>
        <p>Vote on places your group should visit — top picks shape the AI itinerary</p>
      </div>

      {/* Leaderboard */}
      {top3.length > 0 && (
        <div className="leaderboard">
          {top3.map((place, i) => (
            <div key={place.id} className={`leaderboard-item ${styles[i]}`}>
              <div className="leaderboard-rank">{medals[i]}</div>
              <div className="leaderboard-name">{place.name}</div>
              <div className="leaderboard-votes">{getVoteCount(place.id)} votes</div>
            </div>
          ))}
        </div>
      )}

      {/* Voting Cards */}
      {wishlistedPlaces.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🗳️</div>
          <p>No places in the wishlist yet. Add some first!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {sorted.map((place) => {
            const voters = getVoters(place.id);
            return (
              <PlaceCard
                key={place.id}
                place={place}
                action={
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div className="vote-actions">
                      <button
                        className={`vote-btn ${userVotes[place.id] === 1 ? "active-up" : ""}`}
                        onClick={() => castVote(place.id, 1)}
                      >
                        ▲
                      </button>
                      <span className="vote-count">{getVoteCount(place.id)}</span>
                      <button
                        className={`vote-btn ${userVotes[place.id] === -1 ? "active-down" : ""}`}
                        onClick={() => castVote(place.id, -1)}
                      >
                        ▼
                      </button>
                    </div>
                    {voters.length > 0 && (
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.5, maxWidth: 140 }}>
                        {voters.map((v, i) => (
                          <span key={i} style={{ color: v.vote === "up" ? "var(--success)" : "var(--danger)", marginRight: "0.35rem", whiteSpace: "nowrap" }}>
                            {v.vote === "up" ? "👍" : "👎"} {v.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </>
  );
}
