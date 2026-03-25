const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config(); // also check local .env in server/

// Log env status for debugging
console.log("🔑 ENV check:", {
  SUPABASE_URL: process.env.SUPABASE_URL ? "✅ set" : "❌ missing",
  OPENAI_KEY: process.env.OPENAI_KEY ? "✅ set" : "❌ missing",
  PORT: process.env.PORT || "3001 (default)",
});
const express = require("express");
const cors = require("cors");

const placesRoutes = require("./routes/places");
const itineraryRoutes = require("./routes/itinerary");
const votesRoutes = require("./routes/votes");
const expensesRoutes = require("./routes/expenses");
const membersRoutes = require("./routes/members");
const wishlistUsersRoutes = require("./routes/wishlistUsers");
const hotelsRoutes = require("./routes/hotels");
const tripsRoutes = require("./routes/trips");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json());

// ── Routes ───────────────────────────────────────────
app.use("/api/places", placesRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/votes", votesRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/wishlist", wishlistUsersRoutes);
app.use("/api/hotels", hotelsRoutes);
app.use("/api/trips", tripsRoutes);

// ── Health check ─────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Voyanta API" });
});

// ── Start ────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✈️  Voyanta API running on port ${PORT}`);
});
