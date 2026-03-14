import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { fetchMembers, fetchHotels, getHotelRecommendations, updateTrip, deleteTrip } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const DESTINATIONS = ["Udaipur", "Jaipur", "Goa", "Manali", "Kerala"];

export default function TripDashboardPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [stats, setStats] = useState({ wishlist: 0, votes: 0, expenses: 0 });
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editDays, setEditDays] = useState(3);
  const [editBudget, setEditBudget] = useState("");
  const [hotelQuery, setHotelQuery] = useState("");
  const [hotelLoading, setHotelLoading] = useState(false);
  const [aiHotels, setAiHotels] = useState([]);
  const [hotelSummary, setHotelSummary] = useState("");

  useEffect(() => { loadTripData(); }, [tripId]);

  // Load hotels only once when trip is available
  useEffect(() => {
    if (trip?.destination_city && hotels.length === 0) {
      fetchHotels(trip.destination_city)
        .then((data) => setHotels(data || []))
        .catch(() => setHotels([]));
    }
  }, [trip?.destination_city]);

  async function loadTripData() {
    const { data: tripData } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();
    setTrip(tripData);

    try {
      const memberData = await fetchMembers(tripId);
      setMembers(memberData || []);
    } catch {
      setMembers([]);
    }

    const { count: wishCount } = await supabase
      .from("wishlist")
      .select("*", { count: "exact", head: true })
      .eq("trip_id", tripId);

    const { count: voteCount } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("trip_id", tripId);

    const { data: expenseData } = await supabase
      .from("expenses")
      .select("amount")
      .eq("trip_id", tripId);

    const totalExpenses = (expenseData || []).reduce((s, e) => s + Number(e.amount), 0);

    setStats({
      wishlist: wishCount || 0,
      votes: voteCount || 0,
      expenses: totalExpenses,
    });
  }

  function openEditModal() {
    setEditTitle(trip.title);
    setEditCity(trip.destination_city);
    setEditDays(trip.days);
    setEditBudget(trip.budget || "");
    setShowEdit(true);
  }

  async function handleEditTrip(e) {
    e.preventDefault();
    try {
      await updateTrip(tripId, {
        title: editTitle,
        destination_city: editCity,
        days: Number(editDays),
        budget: editBudget ? Number(editBudget) : null,
      });
      setShowEdit(false);
      loadTripData();
    } catch (err) {
      alert("Failed to update trip: " + (err.response?.data?.detail || err.message));
    }
  }

  async function handleDeleteTrip() {
    if (!window.confirm("Are you sure you want to delete this trip? This cannot be undone.")) return;
    try {
      await deleteTrip(tripId);
      navigate("/");
    } catch (err) {
      alert("Failed to delete trip: " + (err.response?.data?.detail || err.message));
    }
  }

  if (!trip) return <LoadingSpinner message="Loading trip..." />;

  async function handleHotelAsk() {
    if (!hotelQuery.trim()) return;
    setHotelLoading(true);
    try {
      const result = await getHotelRecommendations(tripId, hotelQuery);
      setAiHotels(result.recommendations || []);
      setHotelSummary(result.summary || "");
    } catch (err) {
      alert("Failed to get recommendations: " + (err.response?.data?.detail || err.message));
    }
    setHotelLoading(false);
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>{trip.title}</h1>
            <p>📍 {trip.destination_city} · 📅 {trip.days} days {trip.budget ? `· 💰 ₹${trip.budget}` : ""}</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={openEditModal}>
              ✏️ Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteTrip}>
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Invite Code Bar */}
      <div className="invite-bar">
        <div>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Share invite code:</span>
          <span className="invite-code" style={{ marginLeft: "0.75rem" }}>{trip.invite_code}</span>
        </div>
        <button className="btn btn-sm btn-secondary" onClick={() => navigator.clipboard.writeText(trip.invite_code)}>
          📋 Copy
        </button>
      </div>

      {/* Feature Cards — Trip Control Center */}
      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        <Link to={`/trip/${tripId}/itinerary`} className="feature-card" style={{ textDecoration: "none" }}>
          <div className="feature-icon ai">🤖</div>
          <div className="feature-card-text">
            <div className="feature-card-stat primary">{stats.wishlist > 0 ? "Ready" : "—"}</div>
            <h3>AI Itinerary</h3>
            <p>AI-optimized schedule based on group votes</p>
          </div>
        </Link>
        <Link to={`/trip/${tripId}/voting`} className="feature-card" style={{ textDecoration: "none" }}>
          <div className="feature-icon vote">🗳️</div>
          <div className="feature-card-text">
            <div className="feature-card-stat secondary">{stats.votes}</div>
            <h3>Voting Activity</h3>
            <p>Group votes on wishlisted destinations</p>
          </div>
        </Link>
        <Link to={`/trip/${tripId}/expenses`} className="feature-card" style={{ textDecoration: "none" }}>
          <div className="feature-icon expense">💰</div>
          <div className="feature-card-text">
            <div className="feature-card-stat success">₹{stats.expenses}</div>
            <h3>Expense Summary</h3>
            <p>Smart split among all trip members</p>
          </div>
        </Link>
      </div>

      {/* AI Hotel Recommendations — Chat Style */}
      <div className="section">
        <div className="section-header">
          <h2>🏨 Hotel Recommendations</h2>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🤖</span>
            <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Ask AI for hotel recommendations in {trip.destination_city}
            </span>
          </div>
          <div className="ai-edit-bar" style={{ marginBottom: "0.75rem" }}>
            <input
              className="form-input"
              placeholder='e.g. "My budget is ₹10000 for 3 days" or "hotels near the lake with pool"'
              value={hotelQuery}
              onChange={(e) => setHotelQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleHotelAsk()}
            />
            <button className="btn btn-primary" onClick={handleHotelAsk} disabled={hotelLoading}>
              {hotelLoading ? "..." : "Ask"}
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
            {["Budget hotels under ₹2000/night", "Luxury hotels with spa", "Hotels near the lake", "Best value for money"].map((q) => (
              <button
                key={q}
                className="btn btn-sm"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.72rem" }}
                onClick={() => { setHotelQuery(q); }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Hotel AI Loading */}
          {hotelLoading && (
            <div style={{ marginBottom: "1rem" }}>
              <LoadingSpinner message="Finding the best hotels for you..." />
            </div>
          )}

          {/* AI Summary */}
          {hotelSummary && (
            <div style={{ background: "var(--primary-bg)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              🤖 {hotelSummary}
            </div>
          )}

          {/* AI-recommended hotel cards */}
          {aiHotels.length > 0 && (
            <div className="hotel-grid">
              {aiHotels.map((h, idx) => (
                <div key={idx} className="ai-hotel-card">
                  <div className="hotel-card-header">
                    <h3 className="hotel-name">{h.name}</h3>
                    <span className={`hotel-price-badge hotel-price-${h.price_category}`}>
                      {h.price_category}
                    </span>
                  </div>
                  <div className="hotel-area">📍 {h.area}</div>
                  <div className="hotel-meta">
                    <span className="hotel-rating">
                      {"⭐".repeat(Math.round(h.rating))} {h.rating}/5
                    </span>
                    <span className="hotel-price">₹{h.price_per_night?.toLocaleString()}/night</span>
                  </div>
                  {h.amenities && h.amenities.length > 0 && (
                    <div className="hotel-amenities">
                      {h.amenities.map((a) => (
                        <span key={a} className="hotel-amenity">{a}</span>
                      ))}
                    </div>
                  )}
                  {h.reason && (
                    <div className="ai-hotel-reason">💡 {h.reason}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Fallback: show static hotels if no AI query yet */}
          {aiHotels.length === 0 && !hotelSummary && hotels.length > 0 && (
            <div className="hotel-grid">
              {hotels.slice(0, 3).map((h) => (
                <div key={h.id} className="hotel-card">
                  <div className="hotel-card-header">
                    <h3 className="hotel-name">{h.name}</h3>
                    <span className={`hotel-price-badge hotel-price-${h.price_category}`}>
                      {h.price_category}
                    </span>
                  </div>
                  <div className="hotel-area">📍 {h.area}</div>
                  <div className="hotel-meta">
                    <span className="hotel-rating">{"⭐".repeat(Math.round(h.rating))} {h.rating}/5</span>
                    <span className="hotel-price">₹{h.price_per_night?.toLocaleString()}/night</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Members Avatar Stack */}
      <div className="section">
        <div className="section-header">
          <h2>Members ({members.length})</h2>
        </div>
        <div className="avatar-stack-container">
          <div className="avatar-stack">
            {members.slice(0, 5).map((m, i) => (
              <div key={m.user_id} className="avatar-stack-item" style={{ zIndex: members.length - i }} title={m.full_name || m.email || "Member"}>
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.full_name || ""} referrerPolicy="no-referrer" />
                ) : (
                  <div className="avatar-stack-fallback">
                    {(m.full_name || m.email || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {members.length > 5 && (
              <div className="avatar-stack-item avatar-stack-overflow" style={{ zIndex: 0 }}>
                <div className="avatar-stack-fallback">+{members.length - 5}</div>
              </div>
            )}
          </div>
          <div className="avatar-stack-names">
            {members.map((m, i) => (
              <span key={m.user_id}>
                <strong>{m.full_name || m.email || m.user_id.slice(0, 8)}</strong>
                {m.role === "admin" && <span className="badge badge-historical" style={{ marginLeft: "0.3rem", fontSize: "0.6rem" }}>Admin</span>}
                {i < members.length - 1 && ", "}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Trip Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.25rem" }}>Edit Trip Details</h2>
            <form onSubmit={handleEditTrip}>
              <div className="form-group">
                <label>Trip Name</label>
                <input className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Weekend in Udaipur" required />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <select className="form-input" value={editCity} onChange={(e) => setEditCity(e.target.value)} required>
                  <option value="">Select a destination</option>
                  {DESTINATIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Days</label>
                  <input className="form-input" type="number" min={1} max={14} value={editDays}
                    onChange={(e) => setEditDays(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Budget (₹)</label>
                  <input className="form-input" type="number" value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
