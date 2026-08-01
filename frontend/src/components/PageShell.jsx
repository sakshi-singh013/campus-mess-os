import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function PageShell({ role, active, title, subtitle, children, toast }) {
  const displayName =
    localStorage.getItem("userName") || (role === "admin" ? "Mess Admin" : "Alex Rivera");
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen w-full bg-base text-cream relative flex">
      <div className="grain-overlay" />
      <Sidebar role={role} active={active} displayName={displayName} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {isAdmin ? (
          /* ===== Admin header — Obsidian & Rose Gold vessel design ===== */
          <div
            className="relative px-12 py-14 border-b border-line overflow-hidden"
            style={{ background: "linear-gradient(120deg, #141212 0%, #0A0909 60%)" }}
          >
            <svg
              className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none"
              width="200" height="200" viewBox="0 0 220 220" style={{ opacity: 0.7 }}
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
                Mess Admin
              </p>
              <h1 className="font-display text-[34px] leading-[1.1] font-medium mb-2" style={{ color: "#F3F1F0" }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm max-w-[560px]" style={{ color: "#A8A2A2" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ===== Student header — unchanged photo hero ===== */
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
              <p className="font-mono text-[11px] tracking-[0.2em] text-amber/80 uppercase mb-3">Student</p>
              <h1 className="font-display text-[42px] leading-[1.08] font-medium mb-3 animate-fadeUp">{title}</h1>
              {subtitle && (
                <p className="text-sm text-cream/55 animate-fadeUp" style={{ animationDelay: "0.1s" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===== Content ===== */}
        {isAdmin ? (
          /* Admin — Editorial Ghost Type, full width */
          <div className="relative flex-1 overflow-hidden">
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
            <div className="relative z-10 px-12 py-10 w-full">{children}</div>
          </div>
        ) : (
          /* Student — Harvest Ember, unchanged */
          <div className="relative flex-1 px-12 py-10 w-full overflow-hidden">
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
            <div className="relative z-10 max-w-[900px]">{children}</div>
          </div>
        )}

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