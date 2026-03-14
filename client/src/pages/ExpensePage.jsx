import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchExpenseSplit } from "../services/api";

export default function ExpensePage() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [split, setSplit] = useState(null);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");

  useEffect(() => { loadData(); }, [tripId]);

  async function loadData() {
    const { data: expData } = await supabase
      .from("expenses")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });
    setExpenses(expData || []);

    const { data: memData } = await supabase
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", tripId);
    setMembers(memData || []);

    try {
      const splitData = await fetchExpenseSplit(tripId);
      setSplit(splitData);
    } catch { /* no expenses yet */ }

    setLoading(false);
  }

  async function addExpense(e) {
    e.preventDefault();
    const memberIds = members.map((m) => m.user_id);
    await supabase.from("expenses").insert({
      trip_id: tripId,
      paid_by: user.id,
      description,
      amount: Number(amount),
      category,
      split_among: memberIds,
    });
    setDescription("");
    setAmount("");
    setCategory("general");
    setShowForm(false);
    loadData();
  }

  const categoryIcons = {
    general: "📦", food: "🍕", transport: "🚗", stay: "🏨", activities: "🎯", shopping: "🛍️"
  };

  if (loading) return <LoadingSpinner message="Loading expenses..." />;

  return (
    <>
      <div className="page-header">
        <h1>💰 Smart Expense Split</h1>
        <p>Track spending and let Voyanta calculate fair settlements</p>
      </div>

      {/* Split Summary Cards */}
      {split && split.total > 0 && (
        <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="split-card">
            <div className="big-number primary">₹{split.total}</div>
            <div className="label">Total Trip Cost</div>
          </div>
          <div className="split-card">
            <div className="big-number success">₹{split.per_person}</div>
            <div className="label">Cost Per Person ({split.member_count} members)</div>
          </div>
        </div>
      )}

      {/* Settlements */}
      {split?.settlements?.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>💸 Settlements</h3>
          {split.settlements.map((s, i) => (
            <div key={i} className="settlement-card">
              <div className="settlement-names">
                <strong>{s.from_name}</strong>
                <span style={{ color: "var(--text-muted)", margin: "0 0.4rem" }}>owes</span>
                <strong>{s.to_name}</strong>
              </div>
              <div className="settlement-amount">₹{s.amount}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense */}
      <div className="section-header">
        <h2>All Expenses</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          + Add Expense
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <form onSubmit={addExpense}>
            <div className="form-group">
              <label>Description</label>
              <input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Dinner at restaurant" required />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Amount (₹)</label>
                <input className="form-input" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Category</label>
                <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="general">📦 General</option>
                  <option value="food">🍕 Food</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="stay">🏨 Stay</option>
                  <option value="activities">🎯 Activities</option>
                  <option value="shopping">🛍️ Shopping</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="btn btn-success btn-sm">Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">💰</div>
          <p>No expenses recorded yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="card">
          {expenses.map((exp) => (
            <div key={exp.id} className="expense-row">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.3rem" }}>{categoryIcons[exp.category] || "📦"}</span>
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>{exp.description}</strong>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {exp.category} · {new Date(exp.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className="expense-amount">₹{exp.amount}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
