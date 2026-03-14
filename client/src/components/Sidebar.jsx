import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.email || "Traveler";
  const initial = (displayName)[0].toUpperCase();

  // Detect if inside a trip
  const tripMatch = location.pathname.match(/^\/trip\/([^/]+)/);
  const tripId = tripMatch ? tripMatch[1] : null;

  const mainLinks = [
    { path: "/", label: "Dashboard", icon: "📊" },
  ];

  const tripLinks = tripId
    ? [
        { path: `/trip/${tripId}`, label: "Home", icon: "🏠" },
        { path: `/trip/${tripId}/wishlist`, label: "Wishlist", icon: "💜" },
        { path: `/trip/${tripId}/voting`, label: "Voting", icon: "🗳️" },
        { path: `/trip/${tripId}/itinerary`, label: "AI Itinerary", icon: "🤖" },
        { path: `/trip/${tripId}/expenses`, label: "Expenses", icon: "💰" },
      ]
    : [];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sidebar-mobile-btn"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle menu"
      >
        {collapsed ? "✕" : "☰"}
      </button>

      {/* Backdrop for mobile */}
      {collapsed && (
        <div className="sidebar-backdrop" onClick={() => setCollapsed(false)} />
      )}

      <aside className={`sidebar${collapsed ? " sidebar--open" : ""}`}>
        {/* Brand */}
        <Link to="/" className="sidebar-brand" onClick={() => setCollapsed(false)}>
          ✈️ Voyanta
        </Link>

        {/* Profile */}
        <div className="sidebar-profile">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="sidebar-avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="sidebar-avatar sidebar-avatar--fallback">
              {initial}
            </div>
          )}
          <div className="sidebar-profile-info">
            <div className="sidebar-name">{displayName}</div>
            <div className="sidebar-role">Traveler</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-label">Menu</div>
          {mainLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`sidebar-item${isActive(l.path) ? " sidebar-item--active" : ""}`}
              onClick={() => setCollapsed(false)}
            >
              <span className="sidebar-icon">{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}

          {tripId && (
            <>
              <div className="sidebar-label" style={{ marginTop: "1.25rem" }}>
                Trip
              </div>
              {tripLinks.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`sidebar-item${isActive(l.path) ? " sidebar-item--active" : ""}`}
                  onClick={() => setCollapsed(false)}
                >
                  <span className="sidebar-icon">{l.icon}</span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={signOut}>
            <span className="sidebar-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
