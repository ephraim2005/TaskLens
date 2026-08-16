import React, { useState, useRef, useCallback } from "react";
import { Aperture, Upload, Image as ImageIcon, Type, X, Pencil, Trash2, Plus, Loader2, Calendar, Check, ScanLine, AlertCircle, Sun, Moon } from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`;

const uid = () => Math.random().toString(36).slice(2, 10);

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EXTRACTION_INSTRUCTIONS = `You extract academic tasks (assignments, readings, exams, deadlines) from a screenshot or pasted text of a syllabus, Canvas page, email, or group chat.

Respond ONLY with raw JSON, no markdown fences, no commentary, in this exact shape:
{"tasks":[{"title":"string","description":"string","dueDate":"string"}]}

Rules:
- Extract every distinct task you can find (usually 1-5).
- "title" is short and actionable (e.g. "Submit Lab Report 3").
- "description" is one brief sentence of context, or "" if none is evident.
- "dueDate" is formatted like "Oct 14, 2026" if a year is inferable, otherwise "Oct 14". Use "" if no date is present in the source.
- If truly nothing task-like is present, return {"tasks":[]}.`;
const THEMES = {
  light: {
    bg: "#FAF9F6",
    ink: "#1B1F1D",
    sub: "#6B7570",
    faint: "#A9A499",
    panelBg: "#FFFFFF",
    border: "#E4E1D8",
    borderHover: "#C9C3B2",
    dashedBg: "#FFFFFF",
    dashedBgActive: "#FBF3E4",
    amber: "#E1A339",
    teal: "#2C6E76",
    tealBg: "#EAF3F3",
    error: "#A14E1F",
    invert: "#FAF9F6",
    overlay: "rgba(27,31,29,0.75)",
  },
  dark: {
    bg: "#15181A",
    ink: "#F2F1EC",
    sub: "#9AA39D",
    faint: "#5F6864",
    panelBg: "#1E2224",
    border: "#333A38",
    borderHover: "#4A524E",
    dashedBg: "#1E2224",
    dashedBgActive: "#2B2617",
    amber: "#E9B355",
    teal: "#5FA9B0",
    tealBg: "#1D2E2F",
    error: "#E08B5B",
    invert: "#15181A",
    overlay: "rgba(0,0,0,0.75)",
  },
};


export default function TaskLens() {
  const [dark, setDark] = useState(false);
  const theme = dark ? THEMES.dark : THEMES.light;
  const [tasks, setTasks] = useState([]);
  const [mode, setMode] = useState("image"); // 'image' | 'text'
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMediaType, setImageMediaType] = useState("image/png");
  const [textSnippet, setTextSnippet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: "", description: "", dueDate: "" });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const resetCapture = () => {
    setImagePreview(null);
    setImageBase64(null);
    setTextSnippet("");
    setError(null);
  };

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG or JPG).");
      return;
    }
    setError(null);
    const b64 = await fileToBase64(file);
    setImageBase64(b64);
    setImageMediaType(file.type || "image/png");
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onPaste = (e) => {
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        return;
      }
    }
  };

  const extractTasks = async () => {
    setError(null);
    if (mode === "image" && !imageBase64) {
      setError("Add a screenshot first.");
      return;
    }
    if (mode === "text" && !textSnippet.trim()) {
      setError("Paste some text first.");
      return;
    }
    setLoading(true);
    try {
      const content =
        mode === "image"
          ? [
              { type: "image", source: { type: "base64", media_type: imageMediaType, data: imageBase64 } },
              { type: "text", text: EXTRACTION_INSTRUCTIONS },
            ]
          : [{ type: "text", text: `${EXTRACTION_INSTRUCTIONS}\n\nSOURCE TEXT:\n"""${textSnippet}"""` }];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content }],
        }),
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = await response.json();
      const raw = data.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
      const cleaned = raw.replace(/^```json\s*|^```\s*|```$/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const found = Array.isArray(parsed.tasks) ? parsed.tasks : [];

      if (found.length === 0) {
        setError("Nothing task-like was found in that. Try a different screenshot or snippet.");
      } else {
        setTasks((prev) => [
          ...found.map((t) => ({
            id: uid(),
            title: t.title || "Untitled task",
            description: t.description || "",
            dueDate: t.dueDate || "",
          })),
          ...prev,
        ]);
        resetCapture();
      }
    } catch (err) {
      setError("Couldn't read that source. Try again, or add the task manually.");
    } finally {
      setLoading(false);
    }
  };

  const addManualTask = () => {
    const newTask = { id: uid(), title: "New task", description: "", dueDate: "" };
    setTasks((prev) => [newTask, ...prev]);
    setEditingId(newTask.id);
    setDraft(newTask);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setDraft({ title: task.title, description: task.description, dueDate: task.dueDate });
  };

  const saveEdit = () => {
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, ...draft, title: draft.title.trim() || "Untitled task" } : t))
    );
    setEditingId(null);
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  };
  
  const cardStyle = { border: `1px solid ${theme.border}`, background: theme.panelBg, borderRadius: 4, padding: "12px 14px" };
  const inputStyle = { width: "100%", boxSizing: "border-box", border: `1px solid ${theme.border}`, borderRadius: 3, padding: "7px 9px", fontSize: 13, outline: "none", background: theme.panelBg, color: theme.ink };
  const primaryBtnStyle = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: theme.ink, color: theme.invert, border: "none", borderRadius: 4, padding: "10px 16px", fontSize: 13, fontWeight: 600 };
  const smallBtnStyle = { display: "flex", alignItems: "center", gap: 5, background: theme.panelBg, color: theme.ink, border: `1px solid ${theme.border}`, borderRadius: 4, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer" };
  const ghostIconBtn = { background: "transparent", border: "none", color: theme.faint, cursor: "pointer", padding: 4, borderRadius: 3, display: "flex" };
  const iconBtnStyle = { position: "absolute", top: 6, right: 6, background: theme.overlay, border: "none", borderRadius: "50%", width: 22, height: 22, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: theme.bg,
        color: theme.ink,
        minHeight: "100%",
        padding: "32px 20px",
        boxSizing: "border-box",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <style>{`
        .tl-mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.02em; }
        .tl-display { font-family: 'Space Grotesk', sans-serif; }
        .tl-corner { position: absolute; width: 18px; height: 18px; border-color: ${theme.amber}; }
        .tl-btn { transition: transform 0.12s ease, box-shadow 0.12s ease; }
        .tl-btn:active { transform: scale(0.97); }
        .tl-card { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .tl-card:hover { border-color: ${theme.borderHover}; }
        input, textarea { font-family: 'Inter', sans-serif; }
        .tl-toggle:hover { border-color: ${theme.borderHover}; }
        ::placeholder { color: ${theme.faint}; }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `2px solid ${theme.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Aperture size={18} strokeWidth={2} />
            </div>
            <h1 className="tl-display" style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              TaskLens
            </h1>
          </div>

          <button
            className="tl-btn tl-toggle"
            onClick={() => setDark((d) => !d)}
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
                background: dark ? theme.tealBg : "#FBF3E4",
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
        </div>
        <p style={{ margin: "0 0 28px 48px", color: theme.sub, fontSize: 14 }}>
          Point it at a screenshot or a wall of text. It comes back a task.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: 24 }}>
          {/* Capture panel */}
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              <ModeTab active={mode === "image"} onClick={() => { setMode("image"); setError(null); }} icon={<ImageIcon size={14} />} label="Screenshot" />
              <ModeTab active={mode === "text"} onClick={() => { setMode("text"); setError(null); }} icon={<Type size={14} />} label="Text" />
            </div>

            {mode === "image" ? (
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onPaste={onPaste}
                tabIndex={0}
                style={{
                  position: "relative",
                  border: `1.5px dashed ${dragActive ? "#E1A339" : "#D8D3C6"}`,
                  borderRadius: 4,
                  background: dragActive ? "#FBF3E4" : "#FFFFFF",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                  outline: "none",
                  cursor: "pointer",
                }}
                onClick={() => !imagePreview && fileInputRef.current?.click()}
              >
                <span className="tl-corner" style={{ top: 8, left: 8, borderTop: "2px solid", borderLeft: "2px solid" }} />
                <span className="tl-corner" style={{ top: 8, right: 8, borderTop: "2px solid", borderRight: "2px solid" }} />
                <span className="tl-corner" style={{ bottom: 8, left: 8, borderBottom: "2px solid", borderLeft: "2px solid" }} />
                <span className="tl-corner" style={{ bottom: 8, right: 8, borderBottom: "2px solid", borderRight: "2px solid" }} />

                {imagePreview ? (
                  <div style={{ position: "relative", width: "100%" }}>
                    <img src={imagePreview} alt="Screenshot preview" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 2 }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); resetCapture(); }}
                      style={iconBtnStyle}
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <ScanLine size={26} color="#B8B2A2" strokeWidth={1.5} />
                    <p style={{ fontSize: 13, color: "#6B7570", textAlign: "center", margin: "12px 0 4px" }}>
                      Drop a screenshot, paste one (⌘V), or
                    </p>
                    <button
                      className="tl-btn"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      style={{ ...smallBtnStyle, marginTop: 2 }}
                    >
                      <Upload size={13} /> Choose file
                    </button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  style={{ display: "none" }}
                />
              </div>
            ) : (
              <textarea
                value={textSnippet}
                onChange={(e) => setTextSnippet(e.target.value)}
                placeholder="Paste a syllabus paragraph, Canvas announcement, or group chat message…"
                style={{
                  width: "100%",
                  minHeight: 220,
                  boxSizing: "border-box",
                  border: "1.5px solid #D8D3C6",
                  borderRadius: 4,
                  padding: 14,
                  fontSize: 13.5,
                  resize: "vertical",
                  background: "#FFFFFF",
                  outline: "none",
                }}
              />
            )}

            {error && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 10, fontSize: 12.5, color: "#A14E1F" }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              className="tl-btn"
              onClick={extractTasks}
              disabled={loading}
              style={{
                ...primaryBtnStyle,
                width: "100%",
                marginTop: 12,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Reading…
                </>
              ) : (
                <>
                  <Aperture size={14} /> Extract tasks
                </>
              )}
            </button>
          </div>

          {/* Task list */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="tl-mono" style={{ fontSize: 11.5, color: "#8B9A94", textTransform: "uppercase" }}>
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </span>
              <button className="tl-btn" onClick={addManualTask} style={smallBtnStyle}>
                <Plus size={13} /> Add manually
              </button>
            </div>

            {tasks.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #E4E1D8",
                  borderRadius: 4,
                  padding: "48px 20px",
                  textAlign: "center",
                  color: "#A9A499",
                }}
              >
                <Aperture size={22} style={{ marginBottom: 10, opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: 13.5 }}>No tasks yet.</p>
                <p style={{ margin: "2px 0 0", fontSize: 12.5 }}>Scan a screenshot to get started.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks.map((task) =>
                  editingId === task.id ? (
                    <div key={task.id} style={{ ...cardStyle, borderColor: "#2C6E76", background: "#FFFFFF" }}>
                      <input
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        placeholder="Task title"
                        style={{ ...inputStyle, fontWeight: 600, marginBottom: 6 }}
                        autoFocus
                      />
                      <input
                        value={draft.description}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        placeholder="Description (optional)"
                        style={{ ...inputStyle, marginBottom: 6 }}
                      />
                      <input
                        value={draft.dueDate}
                        onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                        placeholder="Due date, e.g. Oct 14"
                        className="tl-mono"
                        style={{ ...inputStyle, fontSize: 12.5, marginBottom: 10 }}
                      />
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="tl-btn" onClick={() => setEditingId(null)} style={smallBtnStyle}>
                          Cancel
                        </button>
                        <button className="tl-btn" onClick={saveEdit} style={{ ...smallBtnStyle, background: "#1B1F1D", color: "#FAF9F6", borderColor: "#1B1F1D" }}>
                          <Check size={13} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={task.id} className="tl-card" style={cardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 14.5, color: "#1B1F1D" }}>{task.title}</p>
                          {task.description && (
                            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#6B7570", lineHeight: 1.4 }}>{task.description}</p>
                          )}
                          {task.dueDate && (
                            <span
                              className="tl-mono"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                color: "#2C6E76",
                                background: "#EAF3F3",
                                padding: "3px 7px",
                                borderRadius: 3,
                                marginTop: 8,
                              }}
                            >
                              <Calendar size={11} /> {task.dueDate}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          <button onClick={() => startEdit(task)} style={ghostIconBtn} aria-label="Edit task">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteTask(task.id)} style={ghostIconBtn} aria-label="Delete task">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeTab({ theme, active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        fontSize: 12.5,
        fontWeight: 500,
        borderRadius: 4,
        border: `1px solid ${active ? theme.ink : theme.border}`,
        background: active ? theme.ink : "transparent",
        color: active ? theme.invert : theme.sub,
        cursor: "pointer",
      }}
    >
      {icon} {label}
    </button>
  );
}


