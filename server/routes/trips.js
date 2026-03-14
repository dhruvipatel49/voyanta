const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

// PUT /api/trips/:id — update trip details
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, destination_city, days, budget } = req.body;

    const { data, error } = await supabase
      .from("trips")
      .update({
        title,
        destination_city,
        days: Number(days),
        budget: budget ? Number(budget) : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Trip update error:", err.message);
    res.status(500).json({ error: "Failed to update trip", detail: err.message });
  }
});

// DELETE /api/trips/:id — delete trip and all related data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related data first
    await supabase.from("itinerary").delete().eq("trip_id", id);
    await supabase.from("expenses").delete().eq("trip_id", id);
    await supabase.from("votes").delete().eq("trip_id", id);
    await supabase.from("wishlist").delete().eq("trip_id", id);
    await supabase.from("trip_members").delete().eq("trip_id", id);
    await supabase.from("trips").delete().eq("id", id);

    res.json({ success: true });
  } catch (err) {
    console.error("Trip delete error:", err.message);
    res.status(500).json({ error: "Failed to delete trip", detail: err.message });
  }
});

module.exports = router;
