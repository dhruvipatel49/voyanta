import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { fetchPlaces, fetchWishlistUsers } from "../services/api";
import PlaceCard from "../components/PlaceCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function WishlistPage() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [places, setPlaces] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistUsers, setWishlistUsers] = useState({}); // { placeId: [{ full_name, avatar_url }] }
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: "", label: "All" },
    { value: "hidden_gem", label: "💎 Hidden Gems" },
    { value: "historical", label: "🏛️ Historical" },
    { value: "nature", label: "🌿 Nature" },
    { value: "food", label: "🍕 Food" },
    { value: "adventure", label: "🏔️ Adventure" },
    { value: "shopping", label: "🛍️ Shopping" },
    { value: "religious", label: "🛕 Religious" },
    { value: "beach", label: "🏖️ Beach" },
    { value: "nightlife", label: "🎉 Nightlife" },
    { value: "cultural", label: "🎭 Cultural" },
    { value: "restaurant", label: "🍽️ Restaurant" },
  ];

  useEffect(() => { loadTrip(); }, [tripId]);
  useEffect(() => { if (trip) loadPlaces(); }, [trip, category]);
  useEffect(() => { loadWishlist(); }, [tripId]);

  async function loadTrip() {
    const { data } = await supabase.from("trips").select("*").eq("id", tripId).single();
    setTrip(data);
  }

  async function loadPlaces() {
    // Hidden gem is a flag, not a category — fetch all then filter client-side
    const apiCategory = category === "hidden_gem" ? undefined : (category || undefined);
    const data = await fetchPlaces(trip.destination_city, apiCategory);
    if (category === "hidden_gem") {
      setPlaces((data || []).filter(p => p.is_hidden_gem));
    } else {
      setPlaces(data);
    }
    setLoading(false);
  }

  async function loadWishlist() {
    const { data } = await supabase
      .from("wishlist")
      .select("place_id")
      .eq("trip_id", tripId);
    setWishlist((data || []).map((w) => w.place_id));

    // Fetch who wishlisted each place
    try {
      const usersData = await fetchWishlistUsers(tripId);
      setWishlistUsers(usersData || {});
    } catch { /* ignore */ }
  }

  async function toggleWishlist(placeId) {
    const isWishlisted = wishlist.includes(placeId);
    if (isWishlisted) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("trip_id", tripId)
        .eq("place_id", placeId)
        .eq("added_by", user.id);
    } else {
      await supabase.from("wishlist").insert({
        trip_id: tripId,
        place_id: placeId,
        added_by: user.id,
      });
    }
    loadWishlist();
  }

  // Render user avatar (photo or initial)
  function UserAvatar({ u, size = 24 }) {
    const name = u.full_name || u.email || "?";
    if (u.avatar_url) {
      return (
        <img
          src={u.avatar_url}
          alt={name}
          referrerPolicy="no-referrer"
          title={name}
          style={{
            width: size, height: size, borderRadius: "50%",
            objectFit: "cover", border: "2px solid var(--card-bg)",
            marginLeft: -6,
          }}
        />
      );
    }
    return (
      <div
        title={name}
        style={{
          width: size, height: size, borderRadius: "50%",
          background: "var(--gradient-primary)", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "white", fontSize: size * 0.4, fontWeight: 700,
          border: "2px solid var(--card-bg)", marginLeft: -6,
          flexShrink: 0,
        }}
      >
        {name[0].toUpperCase()}
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>💜 Wishlist</h1>
        <p>Browse and add places for {trip?.destination_city}</p>
      </div>

      {/* Category Filter Buttons */}
      <div className="category-filter">
        {categories.map((c) => (
          <button
            key={c.value}
            className={`category-btn ${category === c.value ? "active" : ""}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading places..." />
      ) : places.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🔍</div>
          <p>No places found for this category.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {places.map((place) => {
            const users = wishlistUsers[place.id] || [];
            return (
              <PlaceCard
                key={place.id}
                place={place}
                action={
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {/* User avatars who wishlisted this */}
                    {users.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", paddingLeft: 6 }} title={users.map(u => u.full_name || u.email).join(", ")}>
                        {users.slice(0, 4).map((u, i) => (
                          <UserAvatar key={i} u={u} size={26} />
                        ))}
                        {users.length > 4 && (
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "0.3rem" }}>
                            +{users.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                    <button
                      className={`btn btn-sm ${wishlist.includes(place.id) ? "btn-danger" : "btn-primary"}`}
                      onClick={() => toggleWishlist(place.id)}
                    >
                      {wishlist.includes(place.id) ? "✕ Remove" : "♡ Add"}
                    </button>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </>
  );
}
