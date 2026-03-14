import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TripDashboardPage from "./pages/TripDashboardPage";
import WishlistPage from "./pages/WishlistPage";
import VotingPage from "./pages/VotingPage";
import ItineraryPage from "./pages/ItineraryPage";
import ExpensePage from "./pages/ExpensePage";
import LoadingSpinner from "./components/LoadingSpinner";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Loading..." />;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="dashboard-layout">
                <Sidebar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/trip/:tripId" element={<TripDashboardPage />} />
                    <Route path="/trip/:tripId/wishlist" element={<WishlistPage />} />
                    <Route path="/trip/:tripId/voting" element={<VotingPage />} />
                    <Route path="/trip/:tripId/itinerary" element={<ItineraryPage />} />
                    <Route path="/trip/:tripId/expenses" element={<ExpensePage />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
