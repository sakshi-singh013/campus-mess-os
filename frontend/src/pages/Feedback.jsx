import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";
const MEALS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" },
];

function lastNDates(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-lg leading-none transition-colors ${n <= value ? "text-amber" : "text-cream/20 hover:text-cream/40"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const [mine, setMine] = useState([]);
  const [selectedDate, setSelectedDate] = useState(lastNDates(1)[0]);
  const [selectedMeal, setSelectedMeal] = useState("dinner");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dates = lastNDates(7);

  const loadMine = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/feedback/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setMine(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadMine();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setToast("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/feedback/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate, mealKey: selectedMeal, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Couldn't submit feedback.");
      } else {
        setToast("Thanks — feedback saved.");
        setRating(0);
        setComment("");
        loadMine();
      }
    } catch {
      setToast("Couldn't reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      role="student"
      active="feedback"
      title="Rate a meal"
      subtitle="Quick feedback on food quality gives admins real signal — not just headcount."
      toast={toast}
    >
      <form onSubmit={submit} className="bg-panel/50 border border-line rounded-xl p-6 mb-10">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream outline-none focus:border-amber/50"
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">Meal</label>
            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream outline-none focus:border-amber/50"
            >
              {MEALS.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-2 block">Rating</label>
          <Stars value={rating} onChange={setRating} />
        </div>

        <div className="mb-5">
          <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="What stood out — good or bad?"
            className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/25 outline-none focus:border-amber/50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-amber text-base px-5 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Submit feedback"}
        </button>
      </form>

      <p className="text-xs font-mono uppercase tracking-wide text-cream/40 mb-3">Your recent feedback</p>
      {mine.length === 0 ? (
        <p className="text-sm text-cream/35">You haven't rated any meals yet.</p>
      ) : (
        <div className="space-y-2">
          {mine.map((f) => (
            <div key={f.id} className="bg-panel/40 border border-line rounded-lg px-5 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-cream/70">
                  {new Date(f.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {f.mealType.charAt(0) + f.mealType.slice(1).toLowerCase()}
                </span>
                <span className="text-amber text-sm">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
              </div>
              {f.comment && <p className="text-xs text-cream/45 mt-1.5">{f.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
