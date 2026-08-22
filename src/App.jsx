import { Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./theme.jsx";
import { ListsProvider } from "./lists.jsx";
import Landing from "./pages/Landing.jsx";
import TaskLensApp from "./pages/TaskLensApp.jsx";

function ThemedShell({ children }) {
  const { theme } = useTheme();
  // A full-viewport wrapper so the active theme's background covers the
  // whole screen on every route, not just the panel that renders content.
  return (
    <div style={{ minHeight: "100vh", width: "100%", background: theme.bg, color: theme.ink }}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ListsProvider>
        <ThemedShell>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<TaskLensApp />} />
          </Routes>
        </ThemedShell>
      </ListsProvider>
    </ThemeProvider>
  );
}
