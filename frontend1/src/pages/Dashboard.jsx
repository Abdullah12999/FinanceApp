import React, { useEffect, useMemo, useState } from "react";
import { Section, Card, Input, Select, Label, Button } from "../components/ui";
import { formatPKR } from "../utils/number";
import { monthISO, todayISO } from "../utils/dates";
import IncomeVsExpenseBar from "../components/charts/IncomeVsExpenseBar";
import ExpenseByCategoryPie from "../components/charts/ExpenseByCategoryPie";
import ExpenseByDayLine from "../components/charts/ExpenseByDayLine";
import cx from "../utils/cx";

export default function Dashboard({ apiBase, token, setSuccessMsg, setErrorMsg }) {
  const [month, setMonth] = useState(monthISO());
  const [tracker, setTracker] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ amount: "", month: monthISO() });
  const [entryForm, setEntryForm] = useState({
    amount: "", type: "expense", category: "Food", description: "", date: todayISO(),
  });
  const [refreshKey, setRefreshKey] = useState(0);

  async function refetch() {
    const base = apiBase || "";
    const [tRes, cRes] = await Promise.all([
      fetch(`${base}/api/dashboard/tracker?month=${month}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${base}/api/dashboard/category-totals?month=${month}`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (!tRes.ok) throw new Error(`Tracker error ${tRes.status}`);
    if (!cRes.ok) throw new Error(`Category totals error ${cRes.status}`);
    const tData = await tRes.json();
    const cData = await cRes.json();
    setTracker(tData);
    setCategoryTotals(cData);
    setIncomeForm((f) => ({ ...f, month }));
  }

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true); setErrorMsg("");
      try { await refetch(); } catch (e) { setErrorMsg(e.message || "Failed to load data"); }
      finally { setLoading(false); }
    })();
  }, [token, month, apiBase, refreshKey]);

  const expenseByDay = useMemo(() => {
    if (!tracker?.entries) return [];
    const map = new Map();
    for (const e of tracker.entries) {
      if (e.type !== "expense") continue;
      map.set(e.date, (map.get(e.date) || 0) + Number(e.amount || 0));
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, total]) => ({ date, total: Number(total.toFixed(2)) }));
  }, [tracker]);

  const incomeVsExpense = useMemo(() => {
    if (!tracker) return [];
    return [{
      name: month,
      Income: Number((tracker.total_income || 0).toFixed(2)),
      Expense: Number((tracker.total_expense || 0).toFixed(2)),
      Savings: Number((tracker.net_savings || 0).toFixed(2)),
    }];
  }, [tracker, month]);

  const expenseTotalsForPie = useMemo(
    () => categoryTotals.map((t) => ({ name: t.category, value: Number((t.total || 0).toFixed(2)) })),
    [categoryTotals]
  );

  async function handleSetIncome(e) {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    try {
      const base = apiBase || "";
      const res = await fetch(`${base}/api/dashboard/tracker/income`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(incomeForm.amount), month: incomeForm.month }),
      });
      if (!res.ok) throw new Error("Failed to set income");
      setMonth(incomeForm.month);
      setSuccessMsg("✅ Monthly income saved.");
      setRefreshKey((k) => k + 1);
    } catch (e) { setErrorMsg(e.message); }
  }

  async function handleAddEntry(e) {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    try {
      const base = apiBase || "";
      const payload = {
        amount: Number(entryForm.amount),
        type: entryForm.type,
        category: entryForm.category,
        description: entryForm.description,
        date: entryForm.date || undefined,
      };
      const res = await fetch(`${base}/api/dashboard/tracker/entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add entry");
      setEntryForm((f) => ({ ...f, amount: "", description: "" }));
      setSuccessMsg("✅ Entry added.");
      setRefreshKey((k) => k + 1);
    } catch (e) { setErrorMsg(e.message); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Left column */}
      <div className="lg:col-span-1 space-y-6">
        <Section
          title="Overview"
          right={<Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" />}
        >
          <div className="grid grid-cols-2 gap-3">
            <Card title="Monthly Income" value={formatPKR(tracker?.monthly_income)} />
            <Card title="Side Income" value={formatPKR(tracker?.side_income)} />
            <Card title="Total Expense" value={formatPKR(tracker?.total_expense)} />
            <Card
              title="Net Savings"
              value={formatPKR(tracker?.net_savings)}
              subtitle={tracker?.net_savings >= 0 ? "On track" : "Over budget"}
            />
          </div>
        </Section>

        <Section title="Set Monthly Income">
          <form onSubmit={handleSetIncome} className="grid gap-3">
            <div>
              <Label>Month</Label>
              <Input type="month" value={incomeForm.month} onChange={(e) => setIncomeForm({ ...incomeForm, month: e.target.value })} />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" min="0" value={incomeForm.amount}
                     onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                     placeholder="e.g. 120000" />
            </div>
            <Button>Save</Button>
          </form>
        </Section>

        <Section title="Add Entry">
          <form onSubmit={handleAddEntry} className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={entryForm.type} onChange={(e) => setEntryForm({ ...entryForm, type: e.target.value })}>
                  <option value="expense">Expense</option>
                  <option value="side-income">Side Income</option>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" step="0.01" min="0" value={entryForm.amount}
                       onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                       placeholder="e.g. 1500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input value={entryForm.category}
                       onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                       placeholder="Food, Transport, Utilities..." />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={entryForm.date}
                       onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={entryForm.description}
                     onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                     placeholder="Optional notes" />
            </div>
            <Button>Add</Button>
          </form>
        </Section>

        {loading && <div className="text-sm text-slate-500">Loading…</div>}
      </div>

      {/* Right column */}
      <div className="lg:col-span-2 space-y-6">
        <Section title="Income vs Expense (this month)">
          <IncomeVsExpenseBar data={incomeVsExpense} />
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="Expense by Category">
            <ExpenseByCategoryPie data={expenseTotalsForPie} />
          </Section>
          <Section title="Expense by Day">
            <ExpenseByDayLine data={expenseByDay} />
          </Section>
        </div>

        <Section title="Entries">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="text-left text-slate-600">
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
              {tracker?.entries?.length ? (
                tracker.entries.map((e, i) => (
                  <tr key={e._id ?? `${e.date}-${e.description}-${e.amount}-${i}`}
                      className={cx("border-t border-slate-200", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                    <td className="p-3 whitespace-nowrap text-slate-800">{e.date}</td>
                    <td className="p-3">
                      <span className={cx(
                        "rounded-full px-2 py-0.5 text-xs",
                        e.type === "expense"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      )}>{e.type}</span>
                    </td>
                    <td className="p-3 text-slate-800">{e.category}</td>
                    <td className="p-3 text-slate-700">{e.description}</td>
                    <td className="p-3 text-right font-medium text-slate-900">{formatPKR(e.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No entries yet. Add your first one on the left.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}
