import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tasklens.lists";
const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_LISTS = [{ id: uid(), name: "My Tasks", tasks: [] }];

function loadInitialLists() {
  if (typeof window === "undefined") return DEFAULT_LISTS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_LISTS;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_LISTS;
  } catch {
    return DEFAULT_LISTS;
  }
}

const ListsContext = createContext(null);

export function ListsProvider({ children }) {
  const [lists, setLists] = useState(loadInitialLists);
  const [activeListId, setActiveListId] = useState(() => loadInitialLists()[0]?.id);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  const createList = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const newList = { id: uid(), name: trimmed, tasks: [] };
    setLists((prev) => [...prev, newList]);
    setActiveListId(newList.id);
    return newList.id;
  };

  const renameList = (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name: trimmed } : l)));
  };

  const deleteList = (id) => {
    setLists((prev) => {
      const next = prev.filter((l) => l.id !== id);
      return next.length > 0 ? next : [{ id: uid(), name: "My Tasks", tasks: [] }];
    });
    setActiveListId((current) => (current === id ? null : current));
  };

  const addTasks = (listId, newTasks) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, tasks: [...newTasks, ...l.tasks] } : l))
    );
  };

  const updateTask = (listId, taskId, patch) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) } : l
      )
    );
  };

  const deleteTask = (listId, taskId) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) } : l))
    );
  };

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];

  const value = useMemo(
    () => ({
      lists,
      activeList,
      activeListId: activeList?.id,
      setActiveListId,
      createList,
      renameList,
      deleteList,
      addTasks,
      updateTask,
      deleteTask,
    }),
    [lists, activeList]
  );

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error("useLists must be used within a ListsProvider");
  return ctx;
}

export { uid };
