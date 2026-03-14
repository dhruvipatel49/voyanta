const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { generateItinerary, editItinerary } = require("../services/aiService");

// POST /api/itinerary/generate
router.post("/generate", async (req, res) => {
  try {
    const { trip_id, preferences, hotel_location } = req.body;
    console.log("📥 Generate request for trip_id:", trip_id);

    // 1. Fetch the trip (avoid .single() to prevent coercion error)
    const { data: trips, error: tripErr } = await supabase
      .from("trips")
      .select("*")
      .eq("id", trip_id);
    console.log("📋 Trip query result:", { trips, tripErr });
    if (tripErr) throw tripErr;
    if (!trips || trips.length === 0) throw new Error("Trip not found: " + trip_id);
    const trip = trips[0];

    // 2. Get ALL places for this city
    const { data: allPlaces, error: placesErr } = await supabase
      .from("places")
      .select("*")
      .eq("city", trip.destination_city);
    if (placesErr) throw placesErr;
    if (!allPlaces || allPlaces.length === 0) throw new Error("No places found for " + trip.destination_city);

    // 3. Get vote scores
    const { data: votes } = await supabase
      .from("votes")
      .select("place_id, vote")
      .eq("trip_id", trip_id);

    const voteTally = {};
    (votes || []).forEach((v) => {
      voteTally[v.place_id] = (voteTally[v.place_id] || 0) + v.vote;
    });

    // 4. Get wishlisted place IDs
    const { data: wishlist } = await supabase
      .from("wishlist")
      .select("place_id")
      .eq("trip_id", trip_id);

    const wishlistedIds = new Set((wishlist || []).map((w) => w.place_id));

    // 5. Tag each place with priority info
    const places = allPlaces.map((p) => ({
      ...p,
      vote_score: voteTally[p.id] || 0,
      is_wishlisted: wishlistedIds.has(p.id),
      priority: wishlistedIds.has(p.id) || (voteTally[p.id] || 0) > 0 ? "HIGH" : "NORMAL",
    }));

    // 6. Fetch hotels for this city
    const { data: hotels } = await supabase
      .from("hotels")
      .select("*")
      .eq("city", trip.destination_city)
      .order("rating", { ascending: false });

    // 7. Call OpenAI
    const result = await generateItinerary({
      city: trip.destination_city,
      days: trip.days,
      places,
      preferences,
      hotelLocation: hotel_location,
      hotels: hotels || [],
      budget: req.body.budget,
    });

    // 5. Return the itinerary (frontend saves to Supabase)
    res.json({
      trip_id,
      destination: trip.destination_city,
      days: trip.days,
      ...result,
    });
  } catch (err) {
    console.error("Itinerary generation error:", err);
    res.status(500).json({ error: "Failed to generate itinerary", detail: err.message });
  }
});

// POST /api/itinerary/edit
router.post("/edit", async (req, res) => {
  try {
    const { trip_id, current_itinerary, edit_instruction } = req.body;

    // Fetch trip for city
    const { data: trips, error: tripErr } = await supabase
      .from("trips")
      .select("destination_city")
      .eq("id", trip_id);
    if (tripErr) throw tripErr;
    if (!trips || trips.length === 0) throw new Error("Trip not found");
    const trip = trips[0];

    // Fetch all places for the city (so AI can swap in new ones)
    const { data: places, error: placesErr } = await supabase
      .from("places")
      .select("*")
      .eq("city", trip.destination_city);
    if (placesErr) throw placesErr;

    const result = await editItinerary({
      city: trip.destination_city,
      currentItinerary: current_itinerary,
      editInstruction: edit_instruction,
      places,
    });

    res.json({ trip_id, ...result });
  } catch (err) {
    console.error("Itinerary edit error:", err);
    res.status(500).json({ error: "Failed to edit itinerary", detail: err.message });
  }
});

module.exports = router;
