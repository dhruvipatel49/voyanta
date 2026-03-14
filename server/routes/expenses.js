const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

// GET /api/expenses/split/:tripId — calculate per-person split
router.get("/split/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    // 1. Fetch all expenses for the trip
    const { data: expenses, error: expErr } = await supabase
      .from("expenses")
      .select("*")
      .eq("trip_id", tripId);
    if (expErr) throw expErr;

    // 2. Fetch trip members
    const { data: members, error: memErr } = await supabase
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", tripId);
    if (memErr) throw memErr;

    const memberIds = [...new Set(members.map((m) => m.user_id))];
    const memberCount = memberIds.length || 1;

    // 2b. Fetch user names
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", memberIds);
    const nameMap = {};
    (users || []).forEach((u) => {
      nameMap[u.id] = u.full_name || u.email || u.id.slice(0, 8);
    });

    // 3. Calculate totals
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 4. Calculate who paid what
    const paidBy = {};
    memberIds.forEach((id) => (paidBy[id] = 0));
    expenses.forEach((e) => {
      paidBy[e.paid_by] = (paidBy[e.paid_by] || 0) + Number(e.amount);
    });

    // 5. Per-person share
    const perPerson = Math.round((total / memberCount) * 100) / 100;

    // 6. Calculate balances (positive = is owed, negative = owes)
    const balances = {};
    memberIds.forEach((id) => {
      balances[id] = Math.round(((paidBy[id] || 0) - perPerson) * 100) / 100;
    });

    // 7. Greedy settlements
    const debtors = [];
    const creditors = [];
    Object.entries(balances).forEach(([id, bal]) => {
      if (bal < -0.01) debtors.push({ id, amount: -bal });
      if (bal > 0.01) creditors.push({ id, amount: bal });
    });
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      // Skip self-settlements
      if (debtors[i].id === creditors[j].id) {
        i++;
        continue;
      }
      const transfer = Math.min(debtors[i].amount, creditors[j].amount);
      settlements.push({
        from: debtors[i].id,
        from_name: nameMap[debtors[i].id] || debtors[i].id,
        to: creditors[j].id,
        to_name: nameMap[creditors[j].id] || creditors[j].id,
        amount: Math.round(transfer * 100) / 100,
      });
      debtors[i].amount -= transfer;
      creditors[j].amount -= transfer;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    res.json({
      total,
      per_person: perPerson,
      member_count: memberCount,
      paid_by: paidBy,
      balances,
      settlements,
    });
  } catch (err) {
    console.error("Expense split error:", err.message);
    res.status(500).json({ error: "Failed to calculate split" });
  }
});

module.exports = router;
