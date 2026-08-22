import { useTheme } from "../theme.jsx";

/**
 * TaskLens mark: a short checklist with one item checked off.
 * Reads immediately as "task tool" rather than "camera / AI scanner",
 * while the checked item nods to the app turning raw text into a done-able task.
 */
export function LogoMark({ size = 36 }) {
  const { theme } = useTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="34" height="34" rx="9" stroke={theme.ink} strokeWidth="2" fill="none" />
      <path d="M11 13H25" stroke={theme.ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M11 18H25" stroke={theme.ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M11 23H19.5" stroke={theme.ink} strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="23.5" r="5.4" fill={theme.amber} />
      <path d="M22.7 23.6L24.3 25.2L27.3 21.9" stroke={theme.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ size = 36, wordmarkSize = 26 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <LogoMark size={size} />
      <span className="tl-display" style={{ fontSize: wordmarkSize, fontWeight: 700, letterSpacing: "-0.01em" }}>
        TaskLens
      </span>
    </div>
  );
}
