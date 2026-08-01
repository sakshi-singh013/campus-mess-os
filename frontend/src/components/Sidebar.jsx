import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

const ICONS = {
  dashboard: (
    <path d="M3 12l9-9 9 9M5 10v10h14V10" />
  ),
  menu: (
    <>
      <path d="M4 19V5a2 2 0 0 1 2-2h5l7 7v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M8 12h8M8 16h5" />
    </>
  ),
  leave: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M9 15l2 2 4-4" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  feedback: (
    <path d="M12 17.3l-5.4 3 1.4-6-4.6-4 6.1-.5L12 4l2.5 5.8 6.1.5-4.6 4 1.4 6z" />
  ),
  complaints: (
    <>
      <path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M12 8v5M12 16.5v.01" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  trends: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  reports: (
    <path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
  ),
  diet: (
    <>
      <path d="M12 3c-4 3-4 7-4 9a4 4 0 0 0 8 0c0-2 0-6-4-9z" />
      <path d="M12 12v9" />
    </>
  ),
};

const ACCENT = {
  dashboard: { bg: "bg-amber/[0.16]", text: "text-amber", active: "bg-amber/[0.14]" },
  menu: { bg: "bg-teal/[0.16]", text: "text-teal", active: "bg-teal/[0.14]" },
  leave: { bg: "bg-sage/[0.16]", text: "text-sage", active: "bg-sage/[0.14]" },
  history: { bg: "bg-violet/[0.16]", text: "text-violet", active: "bg-violet/[0.14]" },
  feedback: { bg: "bg-coral/[0.16]", text: "text-coral", active: "bg-coral/[0.14]" },
  complaints: { bg: "bg-rose/[0.16]", text: "text-rose", active: "bg-rose/[0.14]" },
  profile: { bg: "bg-amber-dim/[0.16]", text: "text-amber-dim", active: "bg-amber-dim/[0.14]" },
  diet: { bg: "bg-sage/[0.16]", text: "text-sage", active: "bg-sage/[0.14]" },
};

const STUDENT_NAV = [
  { key: "dashboard", short: "Dashboard", label: "Dashboard — today's Yes/No", path: "/dashboard" },
  { key: "menu", short: "Menu", label: "Menu — see what's being served", path: "/menu" },
  { key: "leave", short: "Leave mode", label: "Leave mode — auto-mark meals No while away", path: "/leave" },
  { key: "history", short: "History", label: "History — your meal stats", path: "/history" },
  { key: "feedback", short: "Feedback", label: "Feedback — rate a meal", path: "/feedback" },
  { key: "complaints", short: "Complaints", label: "Complaints — report an issue", path: "/complaints" },
  { key: "profile", short: "Profile", label: "Profile — diet tag & reminders", path: "/profile" },
];

const ADMIN_NAV = [
  { key: "dashboard", short: "Dashboard", label: "Dashboard — live confirmed counts & waste trend", path: "/admin" },
  { key: "menu", short: "Menu management", label: "Menu management — edit the weekly menu", path: "/admin/menu" },
  { key: "feedback", short: "Feedback", label: "Feedback — ratings & comments", path: "/admin/feedback" },
  { key: "complaints", short: "Complaints inbox", label: "Complaints inbox — respond to reports", path: "/admin/complaints" },
  { key: "diet", short: "Diet breakdown", label: "Diet breakdown — dietary headcounts", path: "/admin/diet" },
];

const COLLAPSE_KEY = "sidebarCollapsed";

export default function Sidebar({ role = "student", active, displayName = "" }) {
  const navigate = useNavigate();
  const items = role === "admin" ? ADMIN_NAV : STUDENT_NAV;
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "1");

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, prev ? "0" : "1");
      return !prev;
    });
  };

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside
      className={`shrink-0 bg-elevated border-r border-line flex flex-col gap-1 py-5 relative z-20 transition-[width] duration-200 ${
        collapsed ? "w-[72px] px-2.5" : "w-[216px] px-3.5"
      }`}
    >
      {/* Brand + collapse toggle */}
      <div className={`flex items-center pb-4 ${collapsed ? "justify-center px-0" : "justify-between px-1.5"}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <Logo className="w-[26px] h-[26px] shrink-0" />
          {!collapsed && (
            <span className="text-[13px] font-medium text-cream tracking-wide truncate">Campus Mess OS</span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="w-6 h-6 rounded-md flex items-center justify-center text-cream/35 hover:text-cream hover:bg-panel/60 shrink-0 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={toggleCollapsed}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="w-7 h-7 mx-auto mb-2 rounded-md flex items-center justify-center text-cream/35 hover:text-cream hover:bg-panel/60 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const isActive = item.key === active;
          const accent = ACCENT[item.key] || ACCENT.dashboard;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              title={item.label}
              aria-label={item.label}
              className={`w-full flex items-center gap-3 py-[9px] rounded-lg transition-colors ${
                collapsed ? "justify-center px-0" : "px-2.5"
              } ${isActive ? accent.active : "hover:bg-panel/60"}`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accent.bg} ${accent.text}`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  {ICONS[item.key]}
                </svg>
              </span>
              {!collapsed && (
                <span
                  className={`text-[13px] truncate ${isActive ? "text-cream font-medium" : "text-cream/60"}`}
                >
                  {item.short}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: avatar + name + logout */}
      <div
        className={`flex items-center gap-2.5 pt-3 mt-1 border-t border-line ${
          collapsed ? "flex-col px-0" : "px-1"
        }`}
      >
        <div
          className="w-[26px] h-[26px] rounded-full bg-amber/[0.18] border border-amber/30 flex items-center justify-center text-[11px] font-medium text-amber shrink-0"
          title={displayName}
        >
          {initials}
        </div>
        {!collapsed && <span className="text-xs text-cream/45 truncate flex-1">{displayName}</span>}
        <button
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out"
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-cream/35 hover:text-rose hover:bg-rose/[0.1] transition-colors shrink-0 ${
            collapsed ? "mt-1" : ""
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}