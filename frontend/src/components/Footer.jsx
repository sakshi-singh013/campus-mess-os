import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Product",
    links: ["Dashboard", "Meal Forecasts", "Waste Reports", "Admin Tools"],
  },
  {
    title: "Support",
    links: ["Help Center", "Contact Us", "Report an Issue", "Status"],
  },
  {
    title: "Company",
    links: ["About", "Campus Partners", "Careers", "Privacy Policy"],
  },
];

const SOCIALS = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2H22l-7.4 8.5L23 22h-6.8l-5.3-6.9L4.8 22H1.6l7.9-9.1L1 2h7l4.8 6.3L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2 3.77-2 4.03 0 4.78 2.65 4.78 6.1V21H18.4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H10V9z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto">
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #E8A33D 20%, #4FA89B 45%, #E0785A 70%, #8E7FD1 90%, transparent 100%)",
          opacity: 0.5,
        }}
      />
      <div className="bg-elevated border-t border-line shadow-[0_-24px_48px_-24px_rgba(0,0,0,0.6)]">
        <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Logo className="w-6 h-6" />
              <span className="font-mono text-[11px] tracking-[0.2em] text-amber uppercase">
                Campus Mess OS
              </span>
            </div>
            <p className="text-xs text-cream/40 leading-relaxed max-w-[220px]">
              Forecasting and waste reduction for campus dining teams.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium text-cream/70 mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-cream/40 hover:text-amber transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-[11px] text-cream/30">
            © {new Date().getFullYear()} Campus Mess OS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                className="text-cream/35 hover:text-amber transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
