const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

// GET /api/places?city=Goa&category=beach
router.get("/", async (req, res) => {
  try {
    const { city, category, limit = 50 } = req.query;

    let query = supabase
      .from("places")
      .select("*")
      .order("rating", { ascending: false })
      .limit(Number(limit));

    if (city) query = query.eq("city", city);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Places fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

module.exports = router;
