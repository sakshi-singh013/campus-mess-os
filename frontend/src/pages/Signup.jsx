import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import PasswordField from "../components/PasswordField";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, accessCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userRole", data.role);
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError("Could not reach the server. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-base text-cream relative">
      <div className="grain-overlay" />

      <div className="flex flex-1 min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl animate-[slowZoom_18s_ease-in-out_infinite_alternate]"
          style={{ background: "radial-gradient(circle, #8FA876 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl animate-[slowZoom_22s_ease-in-out_infinite_alternate]"
          style={{ background: "radial-gradient(circle, #E8A33D 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #F3EEE3 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(11,10,8,0.7)_100%)]" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center gap-2.5 animate-fadeIn">
            <Logo />
            <span className="font-mono text-[11px] tracking-[0.2em] text-amber uppercase">
              Campus Mess OS
            </span>
          </div>

          <div className="max-w-md animate-fadeUp" style={{ animationDelay: "0.1s" }}>
            <p className="font-mono text-[11px] tracking-[0.2em] text-amber/70 uppercase mb-5">
              For students and mess staff
            </p>
            <h1 className="font-display text-[3.4rem] leading-[1.05] tracking-tight font-medium text-cream mb-6">
              Confirm today.
              <br />
              Skip the guesswork
              <br />
              at dinner.
            </h1>
            <p className="text-cream/55 text-[15px] leading-relaxed font-light">
              A quick yes or no per meal helps your mess team
              cook the right amount — every single day.
            </p>
          </div>

          <div
            className="grid grid-cols-3 gap-6 border-t border-line pt-6 animate-fadeUp"
            style={{ animationDelay: "0.2s" }}
          >
            <div>
              <p className="font-mono text-2xl text-amber tabular-nums">412</p>
              <p className="text-xs text-cream/40 mt-1">Dinner forecast</p>
            </div>
            <div>
              <p className="font-mono text-2xl text-sage tabular-nums">-18%</p>
              <p className="text-xs text-cream/40 mt-1">Waste this week</p>
            </div>
            <div>
              <p className="font-mono text-2xl text-cream tabular-nums">96%</p>
              <p className="text-xs text-cream/40 mt-1">Forecast accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm bg-panel/70 backdrop-blur-md border border-line/80 rounded-xl px-8 py-10 shadow-[0_24px_70px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] animate-fadeUp relative z-10">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Logo className="w-6 h-6" />
            <span className="font-mono text-xs tracking-widest text-amber uppercase">
              Campus Mess OS
            </span>
          </div>

          <h2 className="font-display text-[1.9rem] font-medium mb-1.5 tracking-tight">
            Create your account
          </h2>
          <p className="text-cream/45 text-sm mb-6">
            Join your campus mess dashboard.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-base/60 border border-line rounded-md">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`text-sm py-2 rounded transition-colors ${
                role === "student"
                  ? "bg-amber text-base font-medium"
                  : "text-cream/50 hover:text-cream"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`text-sm py-2 rounded transition-colors ${
                role === "admin"
                  ? "bg-amber text-base font-medium"
                  : "text-cream/50 hover:text-cream"
              }`}
            >
              Mess Admin
            </button>
          </div>

          {error && (
            <div className="mb-5 text-sm text-rose bg-rose/10 border border-rose/25 rounded-md px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-cream/60 mb-2">
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                autoComplete="name"
                className="w-full bg-base/60 border border-line rounded-md px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(232,163,61,0.15)] transition-all duration-200"
              />
            </div>

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

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            {role === "admin" && (
              <div>
                <label className="block text-xs font-medium text-cream/60 mb-2">
                  Admin access code
                </label>
                <input
                  type="text"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Provided by your mess office"
                  className="w-full bg-base/60 border border-line rounded-md px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(232,163,61,0.15)] transition-all duration-200"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber text-base font-medium text-sm rounded-md py-3 mt-2 shadow-[0_4px_20px_rgba(232,163,61,0.15)] hover:shadow-[0_6px_28px_rgba(232,163,61,0.35)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] transition-all duration-200 ease-out disabled:opacity-60"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />
              )}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-cream/45 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-amber hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      </div>

      <Footer />
    </div>
  );
}
