import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";
import MealIcon from "../components/MealIcon";

const API_BASE = "http://localhost:5000/api";
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABEL = { MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday", THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday", SUNDAY: "Sunday" };
const MEALS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" },
];
const MEAL_ACCENT = {
  breakfast: { border: "border-amber/30", text: "text-amber", bg: "bg-amber/10" },
  lunch: { border: "border-teal/30", text: "text-teal", bg: "bg-teal/10" },
  snacks: { border: "border-coral/30", text: "text-coral", bg: "bg-coral/10" },
  dinner: { border: "border-violet/30", text: "text-violet", bg: "bg-violet/10" },
};

export default function MealMenu() {
  const [menu, setMenu] = useState({});
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const [activeDay, setActiveDay] = useState(todayName);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/menu/week`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dayMenu = menu[activeDay] || {};

  return (
    <PageShell
      role="student"
      active="menu"
      title="This week's menu"
      subtitle="See what's being served before you confirm — set by the mess admin."
    >
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeDay === d
                ? "bg-amber text-base"
                : "bg-panel/50 border border-line text-cream/60 hover:text-cream hover:border-line-soft"
            } ${d === todayName ? "ring-1 ring-amber/40" : ""}`}
          >
            {DAY_LABEL[d]}
            {d === todayName && <span className="ml-1.5 text-[10px] opacity-70">• today</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-cream/40 text-sm">Loading menu…</p>
      ) : (
        <div className="space-y-3">
          {MEALS.map((meal) => {
            const accent = MEAL_ACCENT[meal.key];
            const items = dayMenu[meal.key];
            return (
              <div
                key={meal.key}
                className="flex items-start gap-5 bg-panel/50 border border-line rounded-xl px-6 py-5"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${accent.border} ${accent.text} ${accent.bg}`}>
                  <MealIcon type={meal.key} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-medium mb-1">{meal.label}</p>
                  <p className="text-sm text-cream/55 leading-relaxed">
                    {items && items.trim() ? items : <span className="text-cream/30 italic">Menu not set yet for this day.</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
