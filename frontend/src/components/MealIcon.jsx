export default function MealIcon({ type, className = "w-5 h-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "breakfast":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      );
    case "lunch":
      return (
        <svg {...common}>
          <path d="M7 2v7a2 2 0 0 0 2 2v11M7 2v7M9 2v7M11 2v7" />
          <path d="M17 2c-1.5 1.5-2 3-2 5s.5 4 2 5v10" />
        </svg>
      );
    case "snacks":
      return (
        <svg {...common}>
          <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
      );
    case "dinner":
      return (
        <svg {...common}>
          <path d="M20.5 12a8.5 8.5 0 1 1-8-8.48 7 7 0 0 0 8 8.48z" />
        </svg>
      );
    default:
      return null;
  }
}
