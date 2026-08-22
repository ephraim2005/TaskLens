import { useNavigate } from "react-router-dom";
import { ScanLine, ListChecks, FolderKanban, Moon, Sun } from "lucide-react";
import { useTheme } from "../theme.jsx";
import Logo from "../components/Logo.jsx";

const STEPS = [
  {
    icon: ScanLine,
    title: "Point it at the source",
    body: "Drop in a screenshot of a syllabus, a Canvas page, an email, or just paste in a block of text.",
  },
  {
    icon: ListChecks,
    title: "It comes back a task",
    body: "TaskLens reads the source and pulls out the title, a short description, and the due date for each task it finds.",
  },
  {
    icon: FolderKanban,
    title: "Sort it into a list",
    body: "Choose which list a task belongs to as you save it — separate lists for separate classes, projects, or clients.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, dark, toggleDark } = useTheme();

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        color: theme.ink,
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 32px",
          maxWidth: 1040,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <Logo />
        <button
          onClick={toggleDark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: theme.panelBg,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: "6px 12px 6px 6px",
            cursor: "pointer",
            color: theme.ink,
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: dark ? theme.tealBg : theme.amberBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: dark ? theme.teal : theme.amber,
            }}
          >
            {dark ? <Moon size={12} /> : <Sun size={12} />}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500 }}>{dark ? "Dark" : "Light"}</span>
        </button>
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: 1040,
          width: "100%",
          margin: "0 auto",
          padding: "48px 32px 80px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 620 }}>
          <span
            className="tl-mono"
            style={{ fontSize: 11.5, textTransform: "uppercase", color: theme.teal, letterSpacing: "0.06em" }}
          >
            Screenshots in, tasks out
          </span>
          <h1
            className="tl-display"
            style={{ fontSize: 44, lineHeight: 1.1, margin: "12px 0 18px", letterSpacing: "-0.02em" }}
          >
            Turn any wall of text into a task you can actually act on.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: theme.sub, margin: "0 0 32px" }}>
            Syllabi, Canvas announcements, group chats, and forwarded emails all bury the actual
            to-do inside paragraphs you have to reread. TaskLens reads the source for you and hands
            back a clean task — title, short description, and due date — filed into whichever list
            you're keeping it in.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/app")}
              style={{
                background: theme.ink,
                color: theme.invert,
                border: "none",
                borderRadius: 4,
                padding: "12px 22px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Open TaskLens
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginTop: 64,
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: "22px 20px",
                background: theme.panelBg,
              }}
            >
              <span
                className="tl-mono"
                style={{ fontSize: 11, color: theme.faint, display: "block", marginBottom: 14 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <step.icon size={20} color={theme.amber} style={{ marginBottom: 12 }} />
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{step.title}</h2>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: theme.sub, margin: 0 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${theme.border}`,
          padding: "20px 32px",
          maxWidth: 1040,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
          fontSize: 12,
          color: theme.faint,
        }}
      >
        TaskLens — a small tool for turning what you were sent into what you need to do.
      </footer>
    </div>
  );
}
