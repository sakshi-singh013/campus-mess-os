import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

const API_BASE = "http://localhost:5000/api";

const STATUS_META = {
  OPEN: { label: "Open", cls: "bg-rose/15 text-rose" },
  IN_PROGRESS: { label: "In progress", cls: "bg-amber/15 text-amber" },
  RESOLVED: { label: "Resolved", cls: "bg-sage/15 text-sage" },
};

export default function Complaints() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/complaints/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setComplaints(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setToast("Fill in both a subject and a message.");
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/complaints/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Couldn't submit.");
      } else {
        setToast("Report sent to the mess admin.");
        setSubject("");
        setMessage("");
        load();
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
      active="complaints"
      title="Report an issue"
      subtitle="Hygiene, quantity, timing — anything that needs the admin's attention, separate from a food rating."
      toast={toast}
    >
      <form onSubmit={submit} className="bg-panel/50 border border-line rounded-xl p-6 mb-10">
        <div className="mb-4">
          <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Long queue at dinner"
            className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/25 outline-none focus:border-amber/50"
          />
        </div>
        <div className="mb-5">
          <label className="text-xs font-mono uppercase tracking-wide text-cream/45 mb-1.5 block">Details</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Describe what happened, when, and where"
            className="w-full bg-base/60 border border-line rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/25 outline-none focus:border-amber/50 resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-amber text-base px-5 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Submit report"}
        </button>
      </form>

      <p className="text-xs font-mono uppercase tracking-wide text-cream/40 mb-3">Your reports</p>
      {complaints.length === 0 ? (
        <p className="text-sm text-cream/35">You haven't reported anything yet.</p>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const meta = STATUS_META[c.status] || STATUS_META.OPEN;
            return (
              <div key={c.id} className="bg-panel/40 border border-line rounded-lg px-5 py-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium">{c.subject}</p>
                  <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${meta.cls}`}>{meta.label}</span>
                </div>
                <p className="text-xs text-cream/50 leading-relaxed">{c.message}</p>
                {c.adminReply && (
                  <div className="mt-3 pt-3 border-t border-line/60">
                    <p className="text-[10px] font-mono uppercase tracking-wide text-amber/70 mb-1">Admin reply</p>
                    <p className="text-xs text-cream/60">{c.adminReply}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
