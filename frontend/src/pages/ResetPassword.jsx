import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import PasswordField from "../components/PasswordField";

const API_BASE = "http://localhost:5000/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
      setTimeout(() => navigate("/login"), 2000);
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

        {!done ? (
          <>
            <h2 className="font-display text-[1.9rem] font-medium mb-1.5 tracking-tight">
              Set a new password
            </h2>
            <p className="text-cream/45 text-sm mb-8">
              Choose something you haven't used before.
            </p>

            {!token && (
              <div className="mb-5 text-sm text-rose bg-rose/10 border border-rose/25 rounded-md px-4 py-3">
                No reset token found in this link. Request a new one from the{" "}
                <Link to="/forgot-password" className="underline">
                  forgot password
                </Link>{" "}
                page.
              </div>
            )}

            {error && (
              <div className="mb-5 text-sm text-rose bg-rose/10 border border-rose/25 rounded-md px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordField
                label="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber text-base font-medium text-sm rounded-md py-3 mt-2 hover:bg-amber/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />
                )}
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        ) : (
          <div>
            <h2 className="font-display text-[1.9rem] font-medium mb-1.5 tracking-tight">
              Password updated
            </h2>
            <p className="text-cream/45 text-sm">
              Taking you to sign in...
            </p>
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
