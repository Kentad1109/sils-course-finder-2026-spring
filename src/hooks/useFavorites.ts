import { useEffect, useState } from "react";

const STORAGE_KEY = "sils-course-favorites-2026-spring";

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
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const storage = safeGetLocalStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  return { favoriteIds, toggleFavorite, isFavorite };
}

