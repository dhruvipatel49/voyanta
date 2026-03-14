import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create form
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("");

  // Join form
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => { loadTrips(); }, []);

  async function loadTrips() {
    const { data: memberRows } = await supabase
      .from("trip_members")
      .select("trip_id")
      .eq("user_id", user.id);

    if (memberRows?.length > 0) {
      const tripIds = memberRows.map((m) => m.trip_id);
      const { data } = await supabase
        .from("trips")
        .select("*")
        .in("id", tripIds)
        .order("created_at", { ascending: false });
      setTrips(data || []);
    }
    setLoading(false);
  }

  async function createTrip(e) {
    e.preventDefault();
    const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        title,
        destination_city: city,
        days: Number(days),
        budget: budget ? Number(budget) : null,
        created_by: user.id,
        invite_code,
      })
      .select()
      .single();
    if (error) { alert(error.message); return; }

    await supabase.from("trip_members").insert({
      trip_id: trip.id,
      user_id: user.id,
      role: "admin",
    });

    setShowCreate(false);
    setTitle(""); setCity(""); setDays(3); setBudget("");
    navigate(`/trip/${trip.id}`);
  }

  async function joinTrip(e) {
    e.preventDefault();
    setJoinError("");
    const { data: trip } = await supabase
      .from("trips")
      .select("id")
      .eq("invite_code", joinCode.trim().toUpperCase())
      .single();

    if (!trip) { setJoinError("Invalid invite code"); return; }

    await supabase.from("trip_members").insert({
      trip_id: trip.id,
      user_id: user.id,
      role: "member",
    });

    setShowJoin(false);
    setJoinCode("");
    navigate(`/trip/${trip.id}`);
  }

  if (loading) return <LoadingSpinner message="Loading your trips..." />;

  // City photo mapping — local images
  const cityImages = {
    udaipur: new URL("../images/udaipur.jpeg", import.meta.url).href,
    jaipur: new URL("../images/jaipur.jpeg", import.meta.url).href,
    goa: new URL("../images/goa.jpeg", import.meta.url).href,
    manali: new URL("../images/manali.jpeg", import.meta.url).href,
    kerala: new URL("../images/kerela.jpeg", import.meta.url).href,
    kerela: new URL("../images/kerela.jpeg", import.meta.url).href,
  };
  const defaultImage = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80";

  function getCityImage(city) {
    if (!city) return defaultImage;
    const key = city.toLowerCase().trim();
    return cityImages[key] || defaultImage;
  }

  return (
    <>
      {/* AI Hero Card */}
      <div className="hero-card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: 600 }}>
            Powered by OpenAI
          </span>
        </div>
        <h1>🧠 Plan your trip with AI</h1>
        <p>Describe your dream trip and Voyanta will generate the perfect itinerary using OpenAI GPT — optimized for your group's votes, preferences, and travel distance.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn btn-white btn-lg" onClick={() => setShowCreate(true)}>
            ✨ Create a New Trip
          </button>
          <button className="btn btn-lg" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
            onClick={() => setShowJoin(true)}>
            🔗 Join with Code
          </button>
        </div>
      </div>

      {/* Trip Grid */}
      <div className="section">
        <div className="section-header">
          <h2>Your Trips</h2>
        </div>

        {trips.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🗺️</div>
            <p>No trips yet. Create your first trip to get started!</p>
          </div>
        ) : (
          <div className="card-grid">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="trip-card-photo"
                onClick={() => navigate(`/trip/${trip.id}`)}
                style={{ backgroundImage: `url(${getCityImage(trip.destination_city)})` }}
              >
                <div className="trip-card-overlay">
                  <div className="trip-card-content">
                    <span className="trip-card-city">📍 {trip.destination_city}</span>
                    <h3 className="trip-card-title">{trip.title}</h3>
                    <div className="trip-card-tags">
                      <span>📅 {trip.days} days</span>
                      {trip.budget && <span>💰 ₹{trip.budget}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.25rem" }}>Create a Trip</h2>
            <form onSubmit={createTrip}>
              <div className="form-group">
                <label>Trip Name</label>
                <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Weekend in Udaipur" required />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <select className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required>
                  <option value="">Select a destination</option>
                  <option value="Udaipur">Udaipur</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Goa">Goa</option>
                  <option value="Manali">Manali</option>
                  <option value="Kerala">Kerala</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Days</label>
                  <input className="form-input" type="number" min={1} max={14} value={days}
                    onChange={(e) => setDays(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Budget (₹)</label>
                  <input className="form-input" type="number" value={budget}
                    onChange={(e) => setBudget(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary">Create Trip</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div className="modal-overlay" onClick={() => setShowJoin(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.25rem" }}>Join a Trip</h2>
            <form onSubmit={joinTrip}>
              <div className="form-group">
                <label>Invite Code</label>
                <input className="form-input" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. KI4XZW" required style={{ letterSpacing: "0.15em", fontWeight: 700, textTransform: "uppercase" }} />
              </div>
              {joinError && <p style={{ color: "var(--danger)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>{joinError}</p>}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary">Join Trip</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
