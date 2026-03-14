const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

// GET /api/votes/:tripId — aggregate vote results
router.get("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    // Fetch all votes for this trip (with user_id)
    const { data: votes, error } = await supabase
      .from("votes")
      .select("place_id, vote, user_id")
      .eq("trip_id", tripId);
    if (error) throw error;

    // Get unique user IDs and fetch names
    const userIds = [...new Set(votes.map((v) => v.user_id))];
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", userIds);
    const nameMap = {};
    (users || []).forEach((u) => {
      nameMap[u.id] = u.full_name || u.email || u.id.slice(0, 8);
    });

    // Aggregate
    const tally = {};
    votes.forEach((v) => {
      if (!tally[v.place_id]) {
        tally[v.place_id] = { place_id: v.place_id, total_votes: 0, voter_count: 0, voters: [] };
      }
      tally[v.place_id].total_votes += v.vote;
      tally[v.place_id].voter_count += 1;
      tally[v.place_id].voters.push({
        name: nameMap[v.user_id] || v.user_id.slice(0, 8),
        vote: v.vote > 0 ? "up" : "down",
      });
    });

    // Fetch place names
    const placeIds = Object.keys(tally).map(Number);
    if (placeIds.length === 0) {
      return res.json([]);
    }

    const { data: places, error: placesErr } = await supabase
      .from("places")
      .select("id, name, category, rating")
      .in("id", placeIds);
    if (placesErr) throw placesErr;

    // Merge and sort
    const results = places
      .map((p) => ({
        ...p,
        ...tally[p.id],
      }))
      .sort((a, b) => b.total_votes - a.total_votes);

    res.json(results);
  } catch (err) {
    console.error("Vote aggregation error:", err.message);
    res.status(500).json({ error: "Failed to aggregate votes" });
  }
});

module.exports = router;
