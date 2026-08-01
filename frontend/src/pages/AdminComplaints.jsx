import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"];
const STATUS_META = {
  OPEN: { label: "Open", cls: "bg-rose/15 text-rose" },
  IN_PROGRESS: { label: "In progress", cls: "bg-amber/15 text-amber" },
  RESOLVED: { label: "Resolved", cls: "bg-sage/15 text-sage" },
};

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("");
  const [drafts, setDrafts] = useState({});
  const [toast, setToast] = useState("");

  const load = () => {
    const token = localStorage.getItem("token");
    const q = filter ? `?status=${filter}` : "";
    fetch(`${API_BASE}/complaints/all${q}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setComplaints(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [filter]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const updateComplaint = async (id, patch) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setToast("Updated.");
        load();
      }
    } catch {
      setToast("Couldn't reach the server.");
    }
  };

  return (
    <PageShell
      role="admin"
      active="complaints"
      title="Complaints inbox"
      subtitle="Issues reported by students — hygiene, quantity, timing — that need a direct response."
      toast={toast}
    >
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "" ? "bg-amber text-base" : "bg-panel/50 border border-line text-cream/60 hover:text-cream"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? "bg-amber text-base" : "bg-panel/50 border border-line text-cream/60 hover:text-cream"
            }`}
          >
            {STATUS_META[s].label}
          </button>
        ))}
      </div>

      {complaints.length === 0 ? (
        <p className="text-sm text-cream/35">Nothing here.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const meta = STATUS_META[c.status] || STATUS_META.OPEN;
            const draft = drafts[c.id] ?? c.adminReply ?? "";
            return (
              <div key={c.id} className="bg-panel/50 border border-line rounded-xl px-6 py-5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[15px] font-medium">{c.subject}</p>
                  <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${meta.cls}`}>{meta.label}</span>
                </div>
                <p className="text-xs text-cream/40 mb-2">{c.user?.name} · {c.user?.email}</p>
                <p className="text-sm text-cream/60 mb-4">{c.message}</p>

                <textarea
                  value={draft}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  rows={2}
                  placeholder="Write a reply…"
                  className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/25 outline-none focus:border-amber/50 resize-none mb-3"
                />

                <div className="flex items-center justify-between">
                  <select
                    value={c.status}
                    onChange={(e) => updateComplaint(c.id, { status: e.target.value })}
                    className="bg-base/60 border border-line rounded-lg px-3 py-1.5 text-xs text-cream outline-none focus:border-amber/50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_META[s].label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => updateComplaint(c.id, { adminReply: draft })}
                    className="bg-amber text-base px-4 py-1.5 rounded-lg text-xs font-medium hover:brightness-110 transition"
                  >
                    Send reply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
