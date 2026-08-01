import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";

export default function LeaveMode() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/leave/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setLeaves(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setToast("Pick both a start and end date.");
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/leave/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate, endDate, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Couldn't submit leave.");
      } else {
        setToast(`Leave saved — ${data.mealsMarkedNo} meals auto-marked No.`);
        setStartDate("");
        setEndDate("");
        setReason("");
        loadLeaves();
      }
    } catch {
      setToast("Couldn't reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelLeave = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/leave/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setToast("Leave cancelled.");
        loadLeaves();
      }
    } catch {
      setToast("Couldn't reach the server.");
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const isUpcoming = (l) => new Date(l.endDate) >= new Date(new Date().toISOString().split("T")[0]);

  return (
    <PageShell
      role="student"
      active="leave"
      title="Leave mode"
      subtitle="Going home or away? Set a date range and every meal in it is auto-marked No — no need to toggle each one by hand."
      toast={toast}
    >
      <form onSubmit={submit} className="bg-panel/50 border border-line rounded-xl p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream focus:border-amber/50 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream focus:border-amber/50 outline-none"
              required
            />
          </div>
        </div>
        <div className="mb-5">
          <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">Reason (optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Going home for the weekend"
            className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/25 focus:border-amber/50 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-amber text-base px-5 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Mark meals as No for this range"}
        </button>
      </form>

      <p className="text-xs font-mono uppercase tracking-wide text-cream/40 mb-3">Your leave history</p>
      {leaves.length === 0 ? (
        <p className="text-sm text-cream/35">No leave requests yet.</p>
      ) : (
        <div className="space-y-2">
          {leaves.map((l) => (
            <div key={l.id} className="flex items-center justify-between bg-panel/40 border border-line rounded-lg px-5 py-3.5">
              <div>
                <p className="text-sm">
                  {fmt(l.startDate)} → {fmt(l.endDate)}
                </p>
                {l.reason && <p className="text-xs text-cream/40 mt-0.5">{l.reason}</p>}
              </div>
              {isUpcoming(l) && (
                <button
                  onClick={() => cancelLeave(l.id)}
                  className="text-xs text-rose/80 hover:text-rose transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
