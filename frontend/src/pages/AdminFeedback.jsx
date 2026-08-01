import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";
const MEAL_ORDER = ["breakfast", "lunch", "snacks", "dinner"];

export default function AdminFeedback() {
  const [data, setData] = useState({ averages: {}, comments: [] });
  const [days, setDays] = useState(7);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/feedback/summary?days=${days}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, [days]);

  return (
    <PageShell
      role="admin"
      active="feedback"
      title="Feedback & ratings"
      subtitle="Real signal from students on food quality, not just headcount."
    >
      <div className="flex gap-2 mb-8">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              days === d ? "bg-amber text-base" : "bg-panel/50 border border-line text-cream/60 hover:text-cream"
            }`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {MEAL_ORDER.map((m) => {
          const stat = data.averages[m];
          return (
            <div key={m} className="bg-panel/50 border border-line rounded-xl px-5 py-5 text-center">
              <p className="font-mono text-2xl text-amber tabular-nums">{stat ? stat.average.toFixed(1) : "—"}</p>
              <p className="text-xs text-cream/45 mt-1 capitalize">{m}</p>
              {stat && <p className="text-[10px] text-cream/30 mt-0.5">{stat.count} rating{stat.count === 1 ? "" : "s"}</p>}
            </div>
          );
        })}
      </div>

      <p className="text-xs font-mono uppercase tracking-wide text-cream/40 mb-3">Recent comments</p>
      {data.comments.length === 0 ? (
        <p className="text-sm text-cream/35">No comments left in this range.</p>
      ) : (
        <div className="space-y-2">
          {data.comments.map((c) => (
            <div key={c.id} className="bg-panel/40 border border-line rounded-lg px-5 py-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-cream/70">
                  {c.studentName} · <span className="capitalize">{c.mealType}</span>
                </span>
                <span className="text-amber text-xs">{"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}</span>
              </div>
              <p className="text-xs text-cream/50">{c.comment}</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
