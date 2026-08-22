import { useState } from "react";
import { ListPlus, ChevronDown } from "lucide-react";
import { useTheme } from "../theme.jsx";
import { useLists } from "../lists.jsx";

const NEW_LIST_VALUE = "__new_list__";

export default function ListPicker({ label = "Save to" }) {
  const { theme } = useTheme();
  const { lists, activeListId, setActiveListId, createList } = useLists();
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === NEW_LIST_VALUE) {
      setCreating(true);
      return;
    }
    setActiveListId(val);
  };

  const confirmCreate = () => {
    const id = createList(draftName || "New list");
    setDraftName("");
    setCreating(false);
    if (!id) setCreating(false);
  };

  if (creating) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmCreate();
            if (e.key === "Escape") setCreating(false);
          }}
          placeholder="New list name"
          style={{
            border: `1px solid ${theme.border}`,
            borderRadius: 4,
            padding: "6px 9px",
            fontSize: 12.5,
            background: theme.panelBg,
            color: theme.ink,
            outline: "none",
            width: 140,
          }}
        />
        <button
          onClick={confirmCreate}
          style={{
            border: "none",
            borderRadius: 4,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 600,
            background: theme.ink,
            color: theme.invert,
            cursor: "pointer",
          }}
        >
          Add
        </button>
        <button
          onClick={() => setCreating(false)}
          style={{ border: "none", background: "transparent", color: theme.sub, fontSize: 12, cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: theme.sub }}>
      {label}
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <select
          value={activeListId || ""}
          onChange={handleChange}
          style={{
            appearance: "none",
            border: `1px solid ${theme.border}`,
            borderRadius: 4,
            padding: "6px 28px 6px 10px",
            fontSize: 12.5,
            fontWeight: 600,
            background: theme.panelBg,
            color: theme.ink,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.tasks.length})
            </option>
          ))}
          <option value={NEW_LIST_VALUE}>+ New list…</option>
        </select>
        <ChevronDown
          size={13}
          style={{ position: "absolute", right: 8, pointerEvents: "none", color: theme.faint }}
        />
      </span>
    </label>
  );
}

export function NewListButton() {
  const { theme } = useTheme();
  const { createList } = useLists();
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");

  if (creating) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              createList(draftName || "New list");
              setDraftName("");
              setCreating(false);
            }
            if (e.key === "Escape") setCreating(false);
          }}
          placeholder="List name"
          style={{
            border: `1px solid ${theme.border}`,
            borderRadius: 4,
            padding: "5px 8px",
            fontSize: 12,
            background: theme.panelBg,
            color: theme.ink,
            outline: "none",
            width: 110,
          }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setCreating(true)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: "transparent",
        border: `1px dashed ${theme.border}`,
        color: theme.sub,
        borderRadius: 4,
        padding: "5px 9px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      <ListPlus size={13} /> New list
    </button>
  );
}
