import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MealIcon from "../components/MealIcon";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const API_BASE = "http://localhost:5000/api";

const MENU_DATA = {
  Monday: {
    breakfast: "Idli / Vada, Mix Veg-Sambar, Peanut Chutney, Banana, Bread Butter Jam, Boiled Egg",
    lunch: "Butter/Plain Roti, Toor Dal, Rice, Veg Kofta, Surokai Kootu, Tomato Rasam, Curd, Drumstick Sambar, Beetroot Cucumber Carrot Salad",
    snacks: "Veg Cutlet (2 pcs), Green Chutney, Tea/Coffee/Milk",
    dinner: "Phulka Roti, Aloo Soya Gravy, Rice, Egg Chop Masala, Masala Dal, Khichdi, Pepper Rasam, Pickle",
  },
  Tuesday: {
    breakfast: "Aloo Paratha with Curd, Rava Khichdi, Coconut Chutney, Fruits-Papaya, Bread Butter Jam",
    lunch: "Chapati, Chole Masala, Rice, Daal Tadka, Poondu Kuzhambu, Aviyal, Rasam, Butter Milk, Papad",
    snacks: "Vada Pav, Tea/Coffee/Milk",
    dinner: "Coriander Chapati, Sev Tamatar, Rice, Sambhar, Dal Fry, Aloo Long Beans Bhaja, Sooji Halwa, Pickle",
  },
  Wednesday: {
    breakfast: "Poha, Jalebi, Fruits-Mix Fruit, Sprouts, Bread Butter Jam",
    lunch: "Plain Roti, Besan Gatte, Rice, Chana Dal, Rice (South & North), Curd Rice, Potato Podimas, Rasam, Fryums, Pickle",
    snacks: "Appe, Red Chilli Chutney, Tea/Coffee/Milk",
    dinner: "Roti Plain, Dal Tadka, White Rice, Matar Paneer Gravy, Butter Chicken, Rasam, Pickle",
  },
  Thursday: {
    breakfast: "Pav Bhaji / Missal Pav, Rava Upma, Chutney, Banana",
    lunch: "Roti-Butter Plain, Kaala Chana (Kadhai), Jeera Rice, Dal Tadka, Bottle Gourd Kootu, White Rice, Curd Rice, Rasam, Khichdi, Ennai Katrakai, Jeera Rasam",
    snacks: "Chana Papdi Chaat / Paani Puri, Tea/Coffee/Milk",
    dinner: "Plain Roti, Kadhai Mix Veg, Green Moong Dal, White Rice, Egg Bhurji, Rasam, Daliya",
  },
  Friday: {
    breakfast: "Varieties of Uttapam, Sambhar, Karam Chutney, Sprouts, Mix Fruits, Bread Butter Jam",
    lunch: "Plain Roti, Rajma Masala, Plain Rice, Dal Tadka, Aloo 65, Tomato Rice, Rice Kheer/Sevaiya Kheer, Boondi Raita",
    snacks: "Masala Sandwich, Sauce, Tea/Coffee/Milk",
    dinner: "Roti, Dal Fry, Plain Rice, Paneer Lababdar / Kadhai Paneer, Varieties of Chicken, Lemon Rasam, Pickle",
  },
  Saturday: {
    breakfast: "Bhatura / Poori (Deep Fried), Chole Masala / Sabji, Vermicelli Kichdi, Fruits-Banana, Boiled Egg",
    lunch: "Phulka Roti, Rajma Masala, White Rice, Baigan Bharta, Raw Banana Chops, Sambhar Rice, Paruppu Rasam, Khichdi",
    snacks: "Dahi Vada (2 pcs), Tea/Coffee/Milk",
    dinner: "Jeera Chapati, Lauki Chana Dal, Jeera Rice, Sev Bhaji, Rice (South & North), Rasam, Daliya",
  },
  Sunday: {
    breakfast: "Dosa (Plain/Masala), Sambhar, Chutney, Fruits, Bread Butter Jam",
    lunch: "Roti, Veg Biryani, Chicken Dum Biryani (Limited Spices), Masala Dal, Onion-Cucumber Raita, Paneer Butter Masala (Sweet), White Rice, Rasam, Pickle",
    snacks: "Samosa / Dal Kachodi, Chutney, Tea/Coffee/Milk",
    dinner: "Roti, Dal Makhani, Ghugni, White Rice, Gulab Jamun (Deep Fried), Khichdi, Rasam, Pickle",
  },
};

// Must stay in sync with backend/src/routes/meals.js MEAL_START_HOURS.
const MEALS = [
  { key: "breakfast", label: "Breakfast", time: "7:30 – 9:30 AM", startHour: 7.5, endHour: 9.5 },
  { key: "lunch", label: "Lunch", time: "12:15 – 2:30 PM", startHour: 12.25, endHour: 14.5 },
  { key: "snacks", label: "Snacks", time: "5:00 – 6:30 PM", startHour: 17, endHour: 18.5 },
  { key: "dinner", label: "Dinner", time: "7:15 – 9:15 PM", startHour: 19.25, endHour: 21.25 },
];
const CUTOFF_HOURS_BEFORE = 2;

function getMealStatus(meal, nowHour) {
  const cutoffHour = meal.startHour - CUTOFF_HOURS_BEFORE;
  if (nowHour >= cutoffHour && nowHour < meal.startHour) return "locked";
  if (nowHour >= meal.startHour && nowHour <= meal.endHour) return "now";
  if (nowHour < cutoffHour) return "upcoming";
  return "closed";
}

const STATUS_META = {
  now: { dot: "bg-amber", label: "Serving now", labelClass: "text-amber" },
  upcoming: { dot: "bg-sage", label: "Upcoming", labelClass: "text-sage" },
  locked: { dot: "bg-rose", label: "Locked", labelClass: "text-rose" },
  closed: { dot: "bg-cream/20", label: "Closed", labelClass: "text-cream/35" },
};

// Each meal gets its own accent so the page isn't monochrome amber.
const MEAL_ACCENT = {
  breakfast: { border: "border-amber/30", text: "text-amber", bg: "bg-amber/10" },
  lunch: { border: "border-teal/30", text: "text-teal", bg: "bg-teal/10" },
  snacks: { border: "border-coral/30", text: "text-coral", bg: "bg-coral/10" },
  dinner: { border: "border-violet/30", text: "text-violet", bg: "bg-violet/10" },
};

const BENTO_MEAL_ART = {
  breakfast: { image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=900&auto=format&fit=crop", glow: "#E8A33D" },
  lunch: { image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=900&auto=format&fit=crop", glow: "#4FA89B" },
  snacks: { image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop", glow: "#E0785A" },
  dinner: { image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=900&auto=format&fit=crop", glow: "#8E7FD1" },
};

function getFeaturedMeal(nowHour) {
  const serving = MEALS.find((m) => getMealStatus(m, nowHour) === "now");
  if (serving) return serving;
  const next = MEALS.find((m) => ["upcoming", "locked"].includes(getMealStatus(m, nowHour)));
  if (next) return next;
  return MEALS[MEALS.length - 1];
}

function formatCountdown(meal, status, nowHour) {
  if (status === "now") return "Serving now";
  if (status === "closed") return "Closed for today";
  const diff = meal.startHour - nowHour;
  const h = Math.floor(diff);
  const m = Math.round((diff - h) * 60);
  if (h <= 0) return `Starts in ${m}m`;
  return `Starts in ${h}h ${m}m`;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const displayName = localStorage.getItem("userName") || "Alex Rivera";
  const firstName = displayName.split(" ")[0];
  const [responses, setResponses] = useState({
    breakfast: null,
    lunch: null,
    snacks: null,
    dinner: null,
  });
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const todayKey = now.toISOString().split("T")[0];
  const nowHour = now.getHours() + now.getMinutes() / 60;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/meals/mine?date=${todayKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setResponses((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, [todayKey]);

  const setResponse = async (meal, value) => {
    const status = getMealStatus(meal, nowHour);
    if (status === "locked" || status === "closed") {
      setToast(`Too late to change ${meal.label.toLowerCase()} — the cutoff has passed.`);
      return;
    }

    setResponses((prev) => ({ ...prev, [meal.key]: value }));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/meals/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: todayKey, mealKey: meal.key, response: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast(data.error || "Couldn't save your response.");
        setResponses((prev) => ({ ...prev, [meal.key]: prev[meal.key] === value ? null : prev[meal.key] }));
      }
    } catch (err) {
      setToast("Couldn't reach the server — check your connection.");
    }
  };

  const todayLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const todayMenu = MENU_DATA[now.toLocaleDateString("en-US", { weekday: "long" })];
  const answeredCount = Object.values(responses).filter((v) => v !== null).length;

  const greeting =
    nowHour < 11 ? "Good morning" : nowHour < 16 ? "Good afternoon" : "Good evening";

  // ---- Bento data ----
  const featuredMeal = getFeaturedMeal(nowHour);
  const featuredStatus = getMealStatus(featuredMeal, nowHour);
  const featuredArt = BENTO_MEAL_ART[featuredMeal.key];
  const featuredDish = todayMenu?.[featuredMeal.key];
  const servingNowMeal = MEALS.find((m) => getMealStatus(m, nowHour) === "now");

  return (
    <div className="min-h-screen w-full bg-base text-cream relative flex">
      <div className="grain-overlay" />

      <Sidebar role="student" active="dashboard" displayName={displayName} />

      {/* Main */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Hero — unchanged */}
        <div className="relative px-12 pt-14 pb-10 border-b border-line overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-55"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1613946069412-38f7f1ff0b65?q=80&w=1600&auto=format&fit=crop')" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(11,10,8,0.75) 0%, rgba(11,10,8,0.35) 55%, rgba(11,10,8,0.15) 100%), linear-gradient(180deg, rgba(11,10,8,0.1) 0%, rgba(11,10,8,0.3) 70%, #0B0A08 100%)",
            }}
          />
          <div
            className="absolute w-[480px] h-[480px] rounded-full blur-[70px] opacity-[0.35] -top-[220px] -left-20 animate-[drift1_16s_ease-in-out_infinite_alternate]"
            style={{ background: "radial-gradient(circle, #D9A9A3 0%, transparent 70%)" }}
          />
          <div
            className="absolute w-[420px] h-[420px] rounded-full blur-[70px] opacity-[0.35] -top-40 -right-24 animate-[drift2_20s_ease-in-out_infinite_alternate]"
            style={{ background: "radial-gradient(circle, #4FA89B 0%, transparent 70%)" }}
          />
          <div
            className="absolute w-[380px] h-[380px] rounded-full blur-[70px] opacity-[0.35] -bottom-[260px] left-[30%] animate-[drift1_24s_ease-in-out_infinite_alternate-reverse]"
            style={{ background: "radial-gradient(circle, #8E7FD1 0%, transparent 70%)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(243,238,227,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(243,238,227,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 90%)",
              WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 90%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 900px 500px at 20% -10%, transparent 40%, rgba(11,10,8,0.35) 100%)" }}
          />
          <div className="absolute left-0 right-0 bottom-0 h-[90px]" style={{ background: "linear-gradient(180deg, transparent, #0B0A08)" }} />

          <div className="relative z-10 max-w-[640px]">
            <p className="font-mono text-[11px] tracking-[0.2em] text-amber/80 uppercase mb-3">
              {todayLabel}
            </p>
            <h1 className="font-display text-[42px] leading-[1.08] font-medium mb-5 animate-fadeUp">
              {greeting}, {firstName}.
              <br />
              <span className="text-cream/55">Will you eat with us today?</span>
            </h1>
            <div className="flex items-center gap-3 animate-fadeUp" style={{ animationDelay: "0.1s" }}>
              <div className="w-[280px] h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber rounded-full transition-all duration-500"
                  style={{ width: `${(answeredCount / MEALS.length) * 100}%` }}
                />
              </div>
              <p className="font-mono text-xs text-cream/45 shrink-0">
                {answeredCount} / {MEALS.length} answered
              </p>
            </div>
          </div>
        </div>

        {/* ===== Content — "Harvest Ember" background, header/footer untouched ===== */}
        <div className="relative px-12 py-10 w-full overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(180deg, #251A12 0%, #1E140F 40%, #180F0B 75%, #130C09 100%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 1000px 800px at 80% 0%, rgba(140,90,60,0.28), transparent 70%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 800px 600px at 15% 100%, rgba(120,70,60,0.22), transparent 70%)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
          <svg className="absolute top-4 right-8 pointer-events-none" width="90" height="76" viewBox="0 0 120 100" style={{ opacity: 0.3 }}>
            <rect x="30" y="45" width="55" height="35" rx="4" stroke="#E0785A" strokeWidth="2" fill="none" />
            <path d="M85,52 Q100,55 100,65 Q100,75 85,73" stroke="#E0785A" strokeWidth="2" fill="none" />
            <path d="M45,45 C42,35 50,30 46,20 M60,45 C57,35 65,30 61,20" stroke="#F3EEE3" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8" />
          </svg>
          <p
            className="absolute bottom-6 right-10 pointer-events-none"
            style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: "rgba(224,120,90,0.32)" }}
          >
            — still fresh all the way down ✎
          </p>

          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-10 items-start max-w-[1180px]">
            <div>
              {/* ---------- Bento row ---------- */}
              <p className="font-mono text-[11px] tracking-[0.2em] text-cream/40 uppercase mb-3">
                Today at a glance
              </p>
              <div className="grid grid-cols-3 grid-rows-2 gap-3 mb-10" style={{ minHeight: 200 }}>
                {/* Hero: featured/up-next meal, spans both rows */}
                <div className="col-span-2 row-span-2 relative rounded-2xl border border-line overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url('${featuredArt.image}')` }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(120deg, rgba(20,18,16,0.92) 20%, rgba(20,18,16,0.55) 70%, rgba(20,18,16,0.3) 100%)",
                    }}
                  />
                  <div
                    className="absolute w-[260px] h-[260px] rounded-full blur-[60px] opacity-[0.28] -bottom-20 -right-16"
                    style={{ background: featuredArt.glow }}
                  />
                  <div className="relative p-6 flex flex-col h-full justify-end">
                    <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase mb-2" style={{ color: featuredArt.glow }}>
                      {featuredStatus === "now" ? "Serving now" : "Up next"} · {featuredMeal.label}
                    </p>
                    <h3 className="font-display text-[22px] leading-tight font-medium mb-2 max-w-[380px]">
                      {featuredDish?.split(",")[0] || featuredMeal.label}
                    </h3>
                    <p className="text-xs text-cream/50 leading-relaxed max-w-[420px] mb-4 line-clamp-2">
                      {featuredDish}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs font-mono"
                      style={{ background: "rgba(0,0,0,0.35)", color: "#F3EEE3" }}
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                      {formatCountdown(featuredMeal, featuredStatus, nowHour)}
                    </div>
                  </div>
                </div>

                {/* Stat tile: confirmed today */}
                <div className="rounded-2xl border border-line bg-panel/50 p-5 flex flex-col justify-center">
                  <p className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-sage mb-2">
                    Confirmed today
                  </p>
                  <p className="font-display text-[28px] font-medium leading-none">
                    {answeredCount}
                    <span className="text-sm text-cream/40 font-sans font-normal"> / {MEALS.length} meals</span>
                  </p>
                </div>

                {/* Stat tile: now serving */}
                <div className="rounded-2xl border border-line bg-panel/50 p-5 flex flex-col justify-center">
                  <p className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-amber mb-2">
                    Now serving
                  </p>
                  <p className="font-display text-[19px] font-medium leading-tight">
                    {servingNowMeal ? servingNowMeal.label : "—"}
                  </p>
                  <p className="text-xs text-cream/40 mt-0.5">
                    {servingNowMeal ? servingNowMeal.time : "No meal being served"}
                  </p>
                </div>
              </div>

              {/* ---------- Existing Yes/No meal list (unchanged) ---------- */}
              <p className="font-mono text-[11px] tracking-[0.2em] text-cream/40 uppercase mb-3">
                Confirm each meal
              </p>
              <div className="space-y-3">
                {MEALS.map((meal, i) => {
                  const value = responses[meal.key];
                  const status = getMealStatus(meal, nowHour);
                  const meta = STATUS_META[status];
                  const disabled = status === "locked" || status === "closed";
                  const accent = MEAL_ACCENT[meal.key];
                  const glowColor = { breakfast: "#E8A33D", lunch: "#4FA89B", snacks: "#E0785A", dinner: "#8E7FD1" }[meal.key];

                  return (
                    <div
                      key={meal.key}
                      className={`relative flex items-center gap-5 bg-panel/50 border rounded-xl px-6 py-5 overflow-hidden transition-all duration-300 animate-fadeUp ${
                        disabled ? "border-line/60 opacity-70" : "border-line hover:border-line-soft hover:bg-panel/70"
                      }`}
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div
                        className="absolute top-1/2 left-0 -translate-y-1/2 w-[260px] h-[260px] rounded-full blur-[50px] opacity-[0.16] pointer-events-none"
                        style={{ background: glowColor }}
                      />

                      <div
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                          disabled ? "border-line text-cream/25" : `${accent.border} ${accent.text} ${accent.bg}`
                        }`}
                      >
                        <MealIcon type={meal.key} />
                      </div>

                      <div className="relative flex-1 min-w-0 pr-4">
                        <div className="flex items-baseline gap-2.5 mb-0.5">
                          <p className="text-[17px] font-medium">{meal.label}</p>
                          <span className={`flex items-center gap-[5px] text-[10px] font-mono uppercase tracking-wide ${meta.labelClass}`}>
                            <span className={`w-[5px] h-[5px] rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-cream/40 mb-1.5 font-mono">{meal.time}</p>
                        <p className="text-xs text-cream/50 leading-relaxed line-clamp-2">
                          {todayMenu?.[meal.key]}
                        </p>
                      </div>

                      <div className="relative flex gap-2 shrink-0">
                        <button
                          onClick={() => setResponse(meal, true)}
                          disabled={disabled}
                          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                            value === true
                              ? "bg-sage text-base"
                              : disabled
                              ? "bg-base/60 border border-line text-cream/25 cursor-not-allowed"
                              : "bg-base/60 border border-line text-cream/60 hover:text-cream hover:border-sage/40"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setResponse(meal, false)}
                          disabled={disabled}
                          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                            value === false
                              ? "bg-rose/80 text-cream"
                              : disabled
                              ? "bg-base/60 border border-line text-cream/25 cursor-not-allowed"
                              : "bg-base/60 border border-line text-cream/60 hover:text-cream hover:border-rose/40"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-cream/30 mt-8">
                You can change your response until 2 hours before each meal starts. After that, it locks automatically.
              </p>
            </div>

            {/* Right rail — fills the empty space on wide screens */}
            <aside className="hidden xl:flex flex-col gap-4">
              <div className="rounded-2xl border border-line bg-panel/50 p-5">
                <p className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-violet mb-3">This week</p>
                <div className="space-y-2.5">
                  {Object.entries(MENU_DATA).slice(0, 5).map(([day, meals]) => (
                    <div key={day} className="flex items-center justify-between gap-3 pb-2.5 border-b border-line/60 last:border-0 last:pb-0">
                      <span className="text-xs text-cream/60 shrink-0">{day.slice(0, 3)}</span>
                      <span className="text-[11px] text-cream/35 truncate text-right">{meals.lunch.split(",")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-panel/50 p-5">
                <p className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-coral mb-3">Quick actions</p>
                <div className="flex flex-col">
                  <button
                    onClick={() => navigate("/leave")}
                    className="text-left text-xs text-cream/60 hover:text-cream py-1.5 transition-colors"
                  >
                    → Set leave mode
                  </button>
                  <button
                    onClick={() => navigate("/feedback")}
                    className="text-left text-xs text-cream/60 hover:text-cream py-1.5 transition-colors"
                  >
                    → Rate last meal
                  </button>
                  <button
                    onClick={() => navigate("/history")}
                    className="text-left text-xs text-cream/60 hover:text-cream py-1.5 transition-colors"
                  >
                    → View meal history
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <Footer />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-panel border border-line rounded-lg px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-fadeUp text-sm text-cream/80 max-w-sm text-center">
          {toast}
        </div>
      )}
    </div>
  );
}