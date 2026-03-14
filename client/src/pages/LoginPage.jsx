import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const TRAVEL_PHRASES = [
  "Plan your dream trip with AI ✨",
  "Vote on destinations together 🗳️",
  "Split expenses effortlessly 💰",
  "Explore hidden gems worldwide 🌍",
  "Create memories, not spreadsheets 📸",
];

export default function LoginPage() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("login-phrase-in");

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass("login-phrase-out");
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % TRAVEL_PHRASES.length);
        setFadeClass("login-phrase-in");
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await signUpWithEmail(email, password, fullName);
        if (error) throw error;
        if (data?.user && !data.session) {
          setSuccess("✅ Account created! Check your email to confirm, then sign in.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      }
    } catch (err) {
      const msg = err.message || "Authentication failed";
      if (msg.includes("uppercase")) setError("Password must include at least one uppercase letter (A-Z)");
      else if (msg.includes("lowercase")) setError("Password must include at least one lowercase letter (a-z)");
      else if (msg.includes("symbol") || msg.includes("special")) setError("Password must include at least one symbol (!@#$%^&*)");
      else if (msg.includes("digit") || msg.includes("number")) setError("Password must include at least one number (0-9)");
      else if (msg.includes("least") && msg.includes("character")) setError("Password must be at least 8 characters long");
      else if (msg.includes("rate limit")) setError("Too many attempts. Please wait a minute and try again.");
      else if (msg.includes("already registered")) setError("This email is already registered. Try signing in instead.");
      else if (msg.includes("Invalid login")) setError("Incorrect email or password. Please try again.");
      else setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left: Form Card */}
      <div className="login-left">
        <div className="login-card">
          <img src="/voyanta-logo.png" alt="Voyanta" style={{ height: "48px", marginBottom: "0.25rem" }} />
          <p className="subtitle">AI-powered collaborative travel planner</p>

          <button className="btn btn-google" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "0.75rem" }} onClick={signInWithGoogle}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" type="text" placeholder="John Doe" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && <p style={{ color: "var(--danger)", fontSize: "0.82rem", marginBottom: "0.75rem", background: "var(--danger-bg)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)" }}>{error}</p>}
            {success && <p style={{ color: "var(--success)", fontSize: "0.82rem", marginBottom: "0.75rem", background: "var(--success-bg)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)" }}>{success}</p>}

            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p style={{ marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>

      {/* Right: Animated text panel */}
      <div className="login-right">
        <div className="login-anim-panel">
          <div className="login-anim-badge"><img src="/voyanta-logo.png" alt="Voyanta" style={{ height: "28px", filter: "brightness(0) invert(1)" }} /></div>
          <h2 className="login-anim-headline">
            Your Next Adventure <span className="login-anim-gradient">Starts Here.</span>
          </h2>
          <div className={`login-anim-phrase ${fadeClass}`}>
            {TRAVEL_PHRASES[phraseIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}
