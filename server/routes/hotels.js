const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { recommendHotels } = require("../services/aiService");

// GET /api/hotels?city=Goa&budget=luxury
router.get("/", async (req, res) => {
  try {
    const { city, budget, limit = 20 } = req.query;

    let query = supabase
      .from("hotels")
      .select("*")
      .order("rating", { ascending: false })
      .limit(Number(limit));

    if (city) query = query.eq("city", city);
    if (budget) query = query.eq("price_category", budget);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Hotels fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// POST /api/hotels/recommend — AI chat-based hotel recommendations
router.post("/recommend", async (req, res) => {
  try {
    const { trip_id, message } = req.body;
    if (!trip_id || !message) {
      return res.status(400).json({ error: "trip_id and message are required" });
    }

    // Get trip info
    const { data: trips, error: tripErr } = await supabase
      .from("trips")
      .select("destination_city, days, budget")
      .eq("id", trip_id);
    if (tripErr) throw tripErr;
    if (!trips || trips.length === 0) throw new Error("Trip not found");
    const trip = trips[0];

    // Get all hotels for this city
    const { data: hotels, error: hotelErr } = await supabase
      .from("hotels")
      .select("*")
      .eq("city", trip.destination_city)
      .order("rating", { ascending: false });
    if (hotelErr) throw hotelErr;

    // Call AI
    const result = await recommendHotels({
      city: trip.destination_city,
      hotels: hotels || [],
      userMessage: message,
      budget: trip.budget,
      days: trip.days,
    });

    res.json(result);
  } catch (err) {
    console.error("Hotel recommendation error:", err);
    res.status(500).json({ error: "Failed to get recommendations", detail: err.message });
  }
});

module.exports = router;
