import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";
const MEAL_ORDER = ["breakfast", "lunch", "snacks", "dinner"];

export default function MealHistory() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/meals/history?days=${days}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, [days]);

  const dates = data?.byDate ? Object.keys(data.byDate).sort().reverse() : [];

  return (
    <PageShell
      role="student"
      active="history"
      title="Meal history"
      subtitle="Your confirmed attendance — useful for tracking your own habits or reconciling mess fees."
    >
      <div className="flex gap-2 mb-8">
        {[7, 30, 90].map((d) => (
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

      {data && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-panel/50 border border-line rounded-xl px-5 py-5">
            <p className="font-mono text-2xl text-amber tabular-nums">{data.totalResponded}</p>
            <p className="text-xs text-cream/45 mt-1">Meals responded to</p>
          </div>
          <div className="bg-panel/50 border border-line rounded-xl px-5 py-5">
            <p className="font-mono text-2xl text-sage tabular-nums">{data.yes}</p>
            <p className="text-xs text-cream/45 mt-1">Yes (eating)</p>
          </div>
          <div className="bg-panel/50 border border-line rounded-xl px-5 py-5">
            <p className="font-mono text-2xl text-rose tabular-nums">{data.no}</p>
            <p className="text-xs text-cream/45 mt-1">No (skipped)</p>
          </div>
        </div>
      )}

      <p className="text-xs font-mono uppercase tracking-wide text-cream/40 mb-3">Day by day</p>
      {dates.length === 0 ? (
        <p className="text-sm text-cream/35">No responses recorded in this range yet.</p>
      ) : (
        <div className="space-y-2">
          {dates.map((date) => {
            const day = data.byDate[date];
            const label = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            return (
              <div key={date} className="flex items-center justify-between bg-panel/40 border border-line rounded-lg px-5 py-3">
                <span className="text-sm text-cream/70">{label}</span>
                <div className="flex gap-2">
                  {MEAL_ORDER.filter((m) => m in day).map((m) => (
                    <span
                      key={m}
                      className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${
                        day[m] ? "bg-sage/15 text-sage" : "bg-rose/15 text-rose"
                      }`}
                    >
                      {m.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
