import { useEffect, useState } from "react";

const STORAGE_KEY = "sils-course-favorites-2026-spring";
const STORAGE_META_KEY = "sils-course-favorites-2026-spring-meta";

function safeGetLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [savePulse, setSavePulse] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storage = safeGetLocalStorage();
    if (!storage) return;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed);
      }
      const rawMeta = storage.getItem(STORAGE_META_KEY);
      if (rawMeta) {
        const parsedMeta = JSON.parse(rawMeta);
        if (parsedMeta && typeof parsedMeta.lastSavedAt === "number") {
          setLastSavedAt(parsedMeta.lastSavedAt);
        }
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const storage = safeGetLocalStorage();
    if (!storage) return;
    const now = Date.now();
    storage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    storage.setItem(STORAGE_META_KEY, JSON.stringify({ lastSavedAt: now }));
    setLastSavedAt(now);
    setSavePulse(true);
    const timer = window.setTimeout(() => setSavePulse(false), 1400);
    return () => window.clearTimeout(timer);
  }, [favoriteIds, hydrated]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  return { favoriteIds, toggleFavorite, isFavorite, lastSavedAt, savePulse };
}
