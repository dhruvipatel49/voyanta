import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: API_URL });

/* ── Places ─────────────────────────────────── */
export const fetchPlaces = (city, category) =>
  api.get("/places", { params: { city, category } }).then((r) => r.data);

/* ── Itinerary (AI) ─────────────────────────── */
export const generateItinerary = (payload) =>
  api.post("/itinerary/generate", payload).then((r) => r.data);

export const editItinerary = (payload) =>
  api.post("/itinerary/edit", payload).then((r) => r.data);

/* ── Votes ──────────────────────────────────── */
export const fetchVoteResults = (tripId) =>
  api.get(`/votes/${tripId}`).then((r) => r.data);

/* ── Expenses ───────────────────────────────── */
export const fetchExpenseSplit = (tripId) =>
  api.get(`/expenses/split/${tripId}`).then((r) => r.data);

/* ── Members ────────────────────────────────── */
export const fetchMembers = (tripId) =>
  api.get(`/members/${tripId}`).then((r) => r.data);

/* ── Wishlist Users ────────────────────────── */
export const fetchWishlistUsers = (tripId) =>
  api.get(`/wishlist/${tripId}`).then((r) => r.data);

/* ── Hotels ─────────────────────────────────── */
export const fetchHotels = (city, budget) =>
  api.get("/hotels", { params: { city, budget } }).then((r) => r.data);

export const getHotelRecommendations = (tripId, message) =>
  api.post("/hotels/recommend", { trip_id: tripId, message }).then((r) => r.data);
