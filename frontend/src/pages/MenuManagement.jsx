import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABEL = { MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday", THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday", SUNDAY: "Sunday" };
const MEALS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" },
];

export default function MenuManagement() {
  const [menu, setMenu] = useState({});
  const [activeDay, setActiveDay] = useState("MONDAY");
  const [draft, setDraft] = useState({ breakfast: "", lunch: "", snacks: "", dinner: "" });
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/menu/week`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setDraft({
      breakfast: menu[activeDay]?.breakfast || "",
      lunch: menu[activeDay]?.lunch || "",
      snacks: menu[activeDay]?.snacks || "",
      dinner: menu[activeDay]?.dinner || "",
    });
  }, [activeDay, menu]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const save = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/menu/${activeDay.toLowerCase()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast(data.error || "Couldn't save.");
      } else {
        setToast(`${DAY_LABEL[activeDay]}'s menu saved.`);
        load();
      }
    } catch {
      setToast("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      role="admin"
      active="menu"
      title="Menu management"
      subtitle="Set what's being served for each day and meal — students see this on their dashboard before confirming."
      toast={toast}
    >
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeDay === d ? "bg-amber text-base" : "bg-panel/50 border border-line text-cream/60 hover:text-cream"
            }`}
          >
            {DAY_LABEL[d]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {MEALS.map((m) => (
          <div key={m.key}>
            <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">{m.label}</label>
            <textarea
              value={draft[m.key]}
              onChange={(e) => setDraft((prev) => ({ ...prev, [m.key]: e.target.value }))}
              rows={2}
              placeholder="Comma-separated dishes"
              className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/25 outline-none focus:border-amber/50 resize-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 bg-amber text-base px-5 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
      >
        {saving ? "Saving…" : `Save ${DAY_LABEL[activeDay]}'s menu`}
      </button>
    </PageShell>
  );
}
