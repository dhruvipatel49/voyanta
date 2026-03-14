import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.email;
  const initial = (displayName || "?")[0].toUpperCase();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ✈️ Voyanta
      </Link>
      <div className="navbar-right">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              objectFit: "cover", border: "2px solid var(--border)",
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--gradient-primary)", display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "0.75rem", fontWeight: 700,
          }}>
            {initial}
          </div>
        )}
        <span className="navbar-user">{displayName}</span>
        <button className="btn btn-ghost btn-sm" onClick={signOut}>
          Logout
        </button>
      </div>
    </nav>
  );
}
