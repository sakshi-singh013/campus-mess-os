import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";

const DIET_OPTIONS = [
  { value: "NONE", label: "No preference" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "EGGETARIAN", label: "Eggetarian" },
  { value: "ALLERGY", label: "Allergy / restriction" },
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [dietTag, setDietTag] = useState("NONE");
  const [dietNote, setDietNote] = useState("");
  const [remindersOn, setRemindersOn] = useState(true);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => {
        setProfile(d);
        setDietTag(d.dietTag || "NONE");
        setDietNote(d.dietNote || "");
        setRemindersOn(d.remindersOn !== false);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const save = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/profile/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dietTag, dietNote, remindersOn }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Couldn't save.");
      } else {
        setToast("Profile updated.");
      }
    } catch {
      setToast("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      role="student"
      active="profile"
      title="Profile"
      subtitle="Set your dietary tag so admins get a real breakdown, and control whether you get cutoff reminder emails."
      toast={toast}
    >
      {profile && (
        <div className="bg-panel/50 border border-line rounded-xl p-6 mb-6">
          <p className="text-lg font-medium">{profile.name}</p>
          <p className="text-sm text-cream/40">{profile.email}</p>
        </div>
      )}

      <div className="bg-panel/50 border border-line rounded-xl p-6 space-y-6">
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-2 block">Diet tag</label>
          <div className="flex flex-wrap gap-2">
            {DIET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDietTag(opt.value)}
                className={`px-3.5 py-1.5 rounded-lg text-sm transition-colors ${
                  dietTag === opt.value
                    ? "bg-amber text-base font-medium"
                    : "bg-base/60 border border-line text-cream/60 hover:text-cream"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">
            Allergy / diet note (optional)
          </label>
          <input
            type="text"
            value={dietNote}
            onChange={(e) => setDietNote(e.target.value)}
            placeholder="e.g. No peanuts"
            className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/25 outline-none focus:border-amber/50"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={remindersOn}
            onChange={(e) => setRemindersOn(e.target.checked)}
            className="w-4 h-4 accent-amber"
          />
          <span className="text-sm text-cream/70">
            Email me a reminder shortly before a meal locks if I haven't responded
          </span>
        </label>

        <button
          onClick={save}
          disabled={saving}
          className="bg-amber text-base px-5 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </PageShell>
  );
}
