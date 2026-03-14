import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { generateItinerary, editItinerary } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ItineraryPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [reasoning, setReasoning] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editInput, setEditInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [preferences, setPreferences] = useState("");

  const storageKey = `voyanta_itinerary_${tripId}`;

  useEffect(() => {
    loadSavedItinerary();
    supabase.from("trips").select("destination_city").eq("id", tripId).single()
      .then(({ data }) => setTrip(data));
  }, [tripId]);

  // Detect if user mentions a different city
  const commonCities = ["goa","mumbai","delhi","jaipur","udaipur","bangalore","hyderabad","chennai","kolkata","pune","agra","varanasi","shimla","manali","rishikesh","mysore","ooty","munnar","kochi","darjeeling","gangtok","leh","ladakh","amritsar","jodhpur","pushkar","srinagar","coorg","pondicherry","alleppey","kovalam"];
  function getCityWarning(text) {
    if (!trip?.destination_city || !text) return null;
    const tripCity = trip.destination_city.toLowerCase();
    const input = text.toLowerCase();
    const mentioned = commonCities.find(c => input.includes(c) && c !== tripCity && !tripCity.includes(c));
    if (mentioned) return `⚠️ This is a ${trip.destination_city} trip, not ${mentioned.charAt(0).toUpperCase() + mentioned.slice(1)}. The AI will only use ${trip.destination_city} places.`;
    return null;
  }
  const prefWarning = getCityWarning(preferences);
  const editWarning = getCityWarning(editInput);

  async function loadSavedItinerary() {
    setLoading(true);

    // 1. Try localStorage first (instant)
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setItinerary(parsed);
        setReasoning(parsed.reasoning || "");
        setLoading(false);
        return;
      }
    } catch { /* ignore parse errors */ }

    // 2. Fallback to Supabase
    const { data } = await supabase
      .from("itinerary")
      .select("*, places(name, category)")
      .eq("trip_id", tripId)
      .order("day_number")
      .order("order");

    if (data && data.length > 0) {
      const grouped = {};
      data.forEach((item) => {
        const key = `day${item.day_number}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          place: item.places?.name || `Place #${item.place_id}`,
          place_id: item.place_id,
          time_of_day: item.time_of_day,
          notes: item.notes || "",
        });
      });
      const restored = { itinerary: grouped };
      setItinerary(restored);
      // Cache it for next time
      localStorage.setItem(storageKey, JSON.stringify(restored));
    }
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateItinerary({
        trip_id: tripId,
        preferences: preferences || undefined,
      });
      setItinerary(result);
      setReasoning(result.reasoning || "");
      // Save to both localStorage and Supabase
      localStorage.setItem(storageKey, JSON.stringify(result));
      await saveToSupabase(result.itinerary);
    } catch (err) {
      alert("Failed to generate itinerary: " + (err.response?.data?.detail || err.response?.data?.error || err.message));
    }
    setGenerating(false);
  }

  async function handleEdit() {
    if (!editInput.trim()) return;
    setEditing(true);
    try {
      const result = await editItinerary({
        trip_id: tripId,
        current_itinerary: itinerary.itinerary,
        edit_instruction: editInput,
      });
      setItinerary(result);
      setReasoning(result.reasoning || "");
      setEditInput("");
      // Save to both localStorage and Supabase
      localStorage.setItem(storageKey, JSON.stringify(result));
      await saveToSupabase(result.itinerary);
    } catch (err) {
      alert("Failed to edit itinerary: " + (err.response?.data?.detail || err.response?.data?.error || err.message));
    }
    setEditing(false);
  }

  async function saveToSupabase(itineraryData) {
    try {
      await supabase.from("itinerary").delete().eq("trip_id", tripId);
      const rows = [];
      Object.entries(itineraryData).forEach(([dayKey, places]) => {
        const dayNum = parseInt(dayKey.replace("day", ""));
        places.forEach((p, idx) => {
          rows.push({
            trip_id: tripId,
            day_number: dayNum,
            place_id: p.place_id,
            time_of_day: p.time_of_day,
            order: idx + 1,
            notes: p.notes || null,
          });
        });
      });
      if (rows.length > 0) {
        const { error } = await supabase.from("itinerary").insert(rows);
        if (error) console.warn("Supabase save failed (RLS?):", error.message);
      }
    } catch (err) {
      console.warn("Supabase save error:", err.message);
    }
  }

  const timeOrder = { morning: 0, afternoon: 1, evening: 2, night: 3 };

  if (loading) return <LoadingSpinner message="Loading itinerary..." />;

  return (
    <>
      {/* AI Banner */}
      <div className="ai-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
          </svg>
          <h2>AI-Generated Itinerary</h2>
        </div>
        <p>
          {trip?.destination_city && <><strong>📍 {trip.destination_city}</strong> · </>}
          Powered by <strong>OpenAI GPT</strong> — optimized using group preferences, travel distance, and activity balance.
        </p>
      </div>

      {/* Generate Controls */}
      {!itinerary && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--primary)" }}>
              <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
            </svg>
            <h3>Generate with OpenAI</h3>
          </div>
          <div className="form-group">
            <label>Preferences (optional)</label>
            <input
              className="form-input"
              placeholder="e.g. more beaches, avoid crowded spots, include nightlife"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>
          {prefWarning && (
            <div className="day-alert orange" style={{ marginBottom: "0.75rem" }}>{prefWarning}</div>
          )}
          <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}>
            {generating ? "⏳ OpenAI is planning..." : "✨ Generate Itinerary with AI"}
          </button>
          {generating && (
            <div style={{ marginTop: "1.25rem" }}>
              <LoadingSpinner message="AI is crafting your perfect itinerary..." />
            </div>
          )}
        </div>
      )}

      {/* Itinerary Display */}
      {itinerary?.itinerary && (
        <>
          {/* AI Edit Bar — Chat Style */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.5rem", display: "block", color: "var(--text-secondary)" }}>
              💬 Ask AI to modify the plan
            </label>
            <div className="ai-edit-bar">
              <input
                className="form-input"
                placeholder='e.g. "Make day 2 more relaxed" or "Add more food spots"'
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
              <button className="btn btn-primary" onClick={handleEdit} disabled={editing}>
                {editing ? "..." : "Send"}
              </button>
            </div>
            {editing && (
              <div style={{ marginTop: "0.75rem" }}>
                <LoadingSpinner message="AI is updating your plan..." />
              </div>
            )}
            {editWarning && (
              <div className="day-alert orange" style={{ marginTop: "0.5rem" }}>{editWarning}</div>
            )}
          </div>

          {/* Timeline */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            {Object.entries(itinerary.itinerary)
              .sort(([a], [b]) => parseInt(a.replace("day", "")) - parseInt(b.replace("day", "")))
              .map(([dayKey, places]) => {
              const placeCount = places.length;
              const alertClass = placeCount >= 5 ? "red" : placeCount === 4 ? "orange" : null;
              const alertText = placeCount >= 5
                ? `⚠️ Very packed — ${placeCount} places. Consider editing to reduce.`
                : placeCount === 4
                ? `⚡ Packed day — ${placeCount} places. It may be busy!`
                : null;
              return (
              <div key={dayKey} className="day-block">
                <div className="day-header">
                  📅 Day {dayKey.replace("day", "")}
                  <span className="day-count">
                    {placeCount} {placeCount === 1 ? "place" : "places"}
                  </span>
                </div>
                {alertText && (
                  <div className={`day-alert ${alertClass}`}>{alertText}</div>
                )}
                {places
                  .sort((a, b) => (timeOrder[a.time_of_day] || 0) - (timeOrder[b.time_of_day] || 0))
                  .map((p, idx) => (
                  <div key={idx} className={`itinerary-item${p.is_hidden_gem ? ' itinerary-item--gem' : ''}`}>
                    <span className="time-badge">{p.time_of_day}</span>
                    <div className="itinerary-details">
                      <h4>
                        {p.place}
                        {p.is_hidden_gem && <span className="gem-badge">💎 Hidden Gem</span>}
                      </h4>
                      {p.duration_hours && <p>⏱ {p.duration_hours} hours</p>}
                      {p.notes && <p>💡 {p.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            );
            })}
          </div>

          {/* AI Reasoning */}
          {reasoning && (
            <div className="card" style={{ marginBottom: "1.5rem", background: "var(--primary-bg)", border: "1px solid var(--primary-light)" }}>
              <strong style={{ fontSize: "0.85rem" }}>🤖 AI Reasoning</strong>
              <p style={{ marginTop: "0.4rem", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>{reasoning}</p>
            </div>
          )}

          {/* AI Hotel Recommendations */}
          {itinerary.hotel_recommendations && itinerary.hotel_recommendations.length > 0 && (
            <div className="section" style={{ marginBottom: "1.5rem" }}>
              <div className="section-header">
                <h2>🏨 AI-Recommended Hotels</h2>
              </div>
              <div className="hotel-grid">
                {itinerary.hotel_recommendations.map((h, idx) => (
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
                    {h.reason && (
                      <div className="ai-hotel-reason">
                        💡 {h.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate */}
          <button className="btn btn-secondary" onClick={handleGenerate} disabled={generating}>
            🔄 Regenerate from scratch
          </button>
        </>
      )}
    </>
  );
}
