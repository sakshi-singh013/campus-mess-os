export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="#E8A33D" strokeWidth="2" />
      <path
        d="M16 8c-3 3-4 6-4 9a4 4 0 0 0 8 0c0-3-1-6-4-9z"
        fill="#E8A33D"
      />
    </svg>
  );
}
