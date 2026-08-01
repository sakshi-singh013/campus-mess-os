import { useState, useEffect } from "react";
import MealIcon from "../components/MealIcon";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const API_BASE = "http://localhost:5000/api";

const MEAL_DEFS = [
  { key: "breakfast", label: "Breakfast", time: "7:30 – 9:00 AM" },
  { key: "lunch", label: "Lunch", time: "12:30 – 2:00 PM" },
  { key: "snacks", label: "Snacks", time: "5:00 – 6:30 PM" },
  { key: "dinner", label: "Dinner", time: "7:30 – 9:00 PM" },
];

const WASTE_WEEK = [
  { day: "Mon", value: 22 },
  { day: "Tue", value: 18 },
  { day: "Wed", value: 15 },
  { day: "Thu", value: 20 },
  { day: "Fri", value: 12 },
  { day: "Sat", value: 9 },
  { day: "Sun", value: 11 },
];

function ConfidenceRing({ pct, size = 76, stroke = 6, color = "#E8A33D" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2A2620" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        style={{ "--ring-circumference": circumference, "--ring-offset": offset }}
        className="animate-ringDraw"
      />
    </svg>
  );
}

const MEAL_ACCENT = {
  breakfast: { border: "border-amber/30", text: "text-amber", bg: "bg-amber/10", hex: "#E8A33D" },
  lunch: { border: "border-teal/30", text: "text-teal", bg: "bg-teal/10", hex: "#4FA89B" },
  snacks: { border: "border-coral/30", text: "text-coral", bg: "bg-coral/10", hex: "#E0785A" },
  dinner: { border: "border-violet/30", text: "text-violet", bg: "bg-violet/10", hex: "#8E7FD1" },
};

export default function AdminDashboard() {
  const [range, setRange] = useState("week");
  const [summary, setSummary] = useState({});

  const displayName = localStorage.getItem("userName") || "Mess Admin";
  const firstName = displayName.split(" ")[0];

  const todayKey = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/meals/summary?date=${todayKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(() => {});
  }, [todayKey]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const maxWaste = Math.max(...WASTE_WEEK.map((d) => d.value));
  const totalConfirmedToday = Object.values(summary).reduce((sum, c) => sum + (c?.yes || 0), 0);
  const totalResponded = Object.values(summary).reduce((sum, c) => sum + (c?.yes || 0) + (c?.no || 0), 0);
  const overallPct = totalResponded > 0 ? Math.round((totalConfirmedToday / totalResponded) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-base text-cream relative flex">
      <div className="grain-overlay" />

      <Sidebar role="admin" active="dashboard" displayName={displayName} />

      {/* Main */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* ===== Header — Obsidian & Rose Gold vessel design (unchanged) ===== */}
        <div
          className="relative px-12 py-14 border-b border-line overflow-hidden"
          style={{ background: "linear-gradient(120deg, #141212 0%, #0A0909 60%)" }}
        >
          <svg
            className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none"
            width="230" height="230" viewBox="0 0 220 220" style={{ opacity: 0.85 }}
          >
            <path d="M50,150 Q50,190 110,190 Q170,190 170,150 L165,110 L55,110 Z" stroke="#D9A0A0" strokeWidth="1.6" fill="none" />
            <ellipse cx="110" cy="110" rx="58" ry="14" stroke="#D9A0A0" strokeWidth="1.6" fill="none" />
            <path d="M40,110 L20,105 M180,110 L200,105" stroke="#D9A0A0" strokeWidth="1.6" strokeLinecap="round" />
            <path
              d="M90,95 C84,78 96,68 90,50 M110,95 C104,78 116,68 110,50 M130,95 C124,78 136,68 130,50"
              stroke="#E8E4E4" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.4"
            />
          </svg>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 700px 500px at 80% 50%, rgba(180,140,140,0.12), transparent 70%)" }}
          />

          <div className="relative z-10 max-w-[640px]">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-3" style={{ color: "#D9A0A0" }}>
              {today}
            </p>
            <h1 className="font-display text-[34px] leading-[1.1] font-medium mb-1" style={{ color: "#F3F1F0" }}>
              Welcome back, {firstName}.
            </h1>
            <p className="text-lg" style={{ color: "#A8A2A2" }}>
              Here's today's forecast.
            </p>
            <div
              className="inline-flex items-baseline gap-2 mt-5 px-4 py-2 rounded-full text-xs"
              style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.08)", color: "#B9B2A2" }}
            >
              <span className="font-mono text-sm" style={{ color: "#D9A0A0" }}>{overallPct}%</span>
              overall confirmation rate today
            </div>
          </div>
        </div>

        {/* ===== Content — Editorial Ghost Type, full width, no empty right space ===== */}
        <main className="relative flex-1 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(180deg, #17120F 0%, #100D0B 45%, #0B0908 100%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 900px 600px at 80% 0%, rgba(180,140,140,0.12), transparent 70%)" }}
          />
          <p
            className="absolute pointer-events-none select-none"
            style={{
              left: -10, top: 10, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 90,
              color: "rgba(217,160,160,0.18)", transform: "rotate(-6deg)", whiteSpace: "nowrap", margin: 0,
            }}
          >
            SERVE FRESH
          </p>
          <p
            className="absolute pointer-events-none select-none"
            style={{
              right: -30, bottom: 0, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 70,
              color: "rgba(232,169,58,0.2)", transform: "rotate(4deg)", whiteSpace: "nowrap", margin: 0,
            }}
          >
            TODAY'S MESS
          </p>

          <div className="relative z-10 px-12 py-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
              {MEAL_DEFS.map((meal, i) => {
                const counts = summary[meal.key] || { yes: 0, no: 0 };
                const total = counts.yes + counts.no;
                const pct = total > 0 ? Math.round((counts.yes / total) * 100) : 0;
                return (
                  <div
                    key={meal.key}
                    className="relative overflow-hidden bg-panel/50 border border-line rounded-xl px-6 py-6 hover:border-line-soft transition-colors duration-300 animate-fadeUp"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div
                      className="absolute top-1/2 left-0 -translate-y-1/2 w-[260px] h-[260px] rounded-full blur-[50px] opacity-[0.16] pointer-events-none"
                      style={{ background: MEAL_ACCENT[meal.key].hex }}
                    />
                    <div className="relative flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${MEAL_ACCENT[meal.key].border} ${MEAL_ACCENT[meal.key].text} ${MEAL_ACCENT[meal.key].bg}`}>
                        <MealIcon type={meal.key} className="w-4.5 h-4.5" />
                      </div>
                      <div className="relative shrink-0">
                        <ConfidenceRing pct={pct} color={MEAL_ACCENT[meal.key].hex} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-mono text-sm text-cream tabular-nums">{pct}%</span>
                        </div>
                      </div>
                    </div>
                    <p className="relative text-base font-medium mb-0.5">{meal.label}</p>
                    <p className="relative text-xs text-cream/40 mb-4">{meal.time}</p>
                    <p className={`relative font-mono text-2xl tabular-nums leading-none ${MEAL_ACCENT[meal.key].text}`}>{counts.yes}</p>
                    <p className="relative text-xs text-cream/45 mt-1">confirmed of {total} responded</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-panel/50 border border-line rounded-xl px-6 py-6 mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-lg font-medium">Food waste trend</p>
                  <p className="text-sm text-cream/40">Kilograms wasted per day</p>
                </div>
                <div className="flex gap-2 p-1 bg-base/60 border border-line rounded-md">
                  <button
                    onClick={() => setRange("week")}
                    className={`text-xs px-3 py-1.5 rounded transition-colors ${
                      range === "week" ? "bg-amber text-base font-medium" : "text-cream/50 hover:text-cream"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setRange("month")}
                    className={`text-xs px-3 py-1.5 rounded transition-colors ${
                      range === "month" ? "bg-amber text-base font-medium" : "text-cream/50 hover:text-cream"
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3 h-40">
                {WASTE_WEEK.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center h-32">
                      <div
                        className="w-full max-w-[36px] bg-amber/60 group-hover:bg-amber rounded-t-md transition-all duration-300"
                        style={{ height: `${(d.value / maxWaste) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-cream/40 font-mono">{d.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-cream/30 mt-4">
                (Waste tracking isn't wired to real data yet — this chart is still illustrative.)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-line pt-6">
              <div>
                <p className="font-mono text-2xl text-amber tabular-nums">{totalConfirmedToday}</p>
                <p className="text-xs text-cream/45 mt-1">Meals confirmed today</p>
              </div>
              <div>
                <p className="font-mono text-2xl text-sage tabular-nums">-18%</p>
                <p className="text-xs text-cream/45 mt-1">Waste this week</p>
              </div>
              <div>
                <p className="font-mono text-2xl text-cream tabular-nums">96%</p>
                <p className="text-xs text-cream/45 mt-1">Forecast accuracy</p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}