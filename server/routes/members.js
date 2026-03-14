const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

// GET /api/members/:tripId — get trip members with names
router.get("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const { data: members, error: memErr } = await supabase
      .from("trip_members")
      .select("user_id, role, joined_at")
      .eq("trip_id", tripId);
    if (memErr) throw memErr;

    const userIds = [...new Set((members || []).map((m) => m.user_id))];

    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);

    const merged = (members || []).map((m) => {
      const u = users?.find((u) => u.id === m.user_id);
      return {
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        full_name: u?.full_name || null,
        email: u?.email || null,
        avatar_url: u?.avatar_url || null,
      };
    });

    res.json(merged);
  } catch (err) {
    console.error("Members error:", err.message);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

module.exports = router;
