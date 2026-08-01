import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE = "http://localhost:5000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      setDevResetUrl(data.devResetUrl || "");
      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError("Could not reach the server. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base text-cream relative px-4">
      <div className="grain-overlay" />

      <div className="w-full max-w-sm bg-panel/70 backdrop-blur-md border border-line/80 rounded-xl px-8 py-10 shadow-[0_24px_70px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] animate-fadeUp relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <Logo className="w-6 h-6" />
          <span className="font-mono text-xs tracking-widest text-amber uppercase">
            Campus Mess OS
          </span>
        </div>

        {!submitted ? (
          <>
            <h2 className="font-display text-[1.9rem] font-medium mb-1.5 tracking-tight">
              Reset your password
            </h2>
            <p className="text-cream/45 text-sm mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="mb-5 text-sm text-rose bg-rose/10 border border-rose/25 rounded-md px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-cream/60 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@campus.edu"
                  autoComplete="email"
                  className="w-full bg-base/60 border border-line rounded-md px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(232,163,61,0.15)] transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber text-base font-medium text-sm rounded-md py-3 mt-2 hover:bg-amber/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />
                )}
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        ) : (
          <div>
            <h2 className="font-display text-[1.9rem] font-medium mb-1.5 tracking-tight">
              Check your email
            </h2>
            <p className="text-cream/45 text-sm">
              If an account exists for <span className="text-cream/70">{email}</span>, we've sent a password reset link. It expires in 30 minutes.
            </p>

            {devResetUrl && (
              <div className="mt-6 border border-line rounded-md px-4 py-3 bg-base/40">
                <p className="text-[11px] font-mono tracking-wide text-amber/80 uppercase mb-2">
                  Dev mode — no email server configured yet
                </p>
                <p className="text-xs text-cream/50 mb-2">
                  Since this project isn't connected to a real email provider yet, here's the link directly:
                </p>
                <a
                  href={devResetUrl}
                  className="text-xs text-amber hover:underline break-all"
                >
                  {devResetUrl}
                </a>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-sm text-cream/45 mt-8">
          <Link to="/login" className="text-amber hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
