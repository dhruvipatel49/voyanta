const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

// GET /api/wishlist/:tripId — get wishlist entries with user info
router.get("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const { data: wishlist, error: wErr } = await supabase
      .from("wishlist")
      .select("place_id, added_by")
      .eq("trip_id", tripId);
    if (wErr) throw wErr;

    // Get unique user IDs
    const userIds = [...new Set((wishlist || []).map((w) => w.added_by))];

    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);

    // Group by place_id → list of users who wishlisted it
    const grouped = {};
    (wishlist || []).forEach((w) => {
      if (!grouped[w.place_id]) grouped[w.place_id] = [];
      const u = users?.find((u) => u.id === w.added_by);
      grouped[w.place_id].push({
        user_id: w.added_by,
        full_name: u?.full_name || null,
        email: u?.email || null,
        avatar_url: u?.avatar_url || null,
      });
    });

    res.json(grouped);
  } catch (err) {
    console.error("Wishlist users error:", err.message);
    res.status(500).json({ error: "Failed to fetch wishlist users" });
  }
});

module.exports = router;
