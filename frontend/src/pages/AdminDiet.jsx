import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";
const DIET_LABEL = {
  NONE: "No preference",
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  EGGETARIAN: "Eggetarian",
  ALLERGY: "Allergy / restriction",
};
const DIET_COLOR = {
  NONE: "bg-cream/30",
  VEGETARIAN: "bg-sage",
  VEGAN: "bg-teal",
  EGGETARIAN: "bg-amber",
  ALLERGY: "bg-rose",
};

export default function AdminDiet() {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/profile/diet-summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setSummary(d))
      .catch(() => {});
  }, []);

  const total = Object.values(summary).reduce((a, b) => a + b, 0) || 1;

  return (
    <PageShell
      role="admin"
      active="diet"
      title="Dietary breakdown"
      subtitle="Headcount by diet tag across all students — useful for planning quantities beyond just Yes/No."
    >
      <div className="space-y-4">
        {Object.keys(DIET_LABEL).map((key) => {
          const count = summary[key] || 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-cream/70">{DIET_LABEL[key]}</span>
                <span className="text-xs font-mono text-cream/45">{count} student{count === 1 ? "" : "s"}</span>
              </div>
              <div className="w-full h-2 bg-base/60 border border-line rounded-full overflow-hidden">
                <div className={`h-full ${DIET_COLOR[key]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
