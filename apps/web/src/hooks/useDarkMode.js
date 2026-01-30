import { useState, useEffect, useCallback } from "react";

/**
 * Persists dark mode preference and supports "system", "light", "dark" modes.
 */
export function useDarkMode(settingsMode) {
  const [darkMode, setDarkMode] = useState(false);

  const canUseDom = typeof document !== "undefined";
  const canUseStorage = typeof window !== "undefined" && "localStorage" in window;

  const applyClass = useCallback((isDark) => {
    if (canUseDom) {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [canUseDom]);

  // Resolve the effective dark mode based on settings
  useEffect(() => {
    const mode = settingsMode || "system";

    if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e) => {
        setDarkMode(e.matches);
        applyClass(e.matches);
      };
      setDarkMode(mq.matches);
      applyClass(mq.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }

    const isDark = mode === "dark";
    setDarkMode(isDark);
    applyClass(isDark);
  }, [settingsMode, applyClass]);

  /** Manual toggle (cycles: current → opposite). Also persists to localStorage for legacy compat. */
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      applyClass(next);
      if (canUseStorage) {
        try { localStorage.setItem("darkMode", next.toString()); } catch {}
      }
      return next;
    });
  }, [applyClass, canUseStorage]);

  return { darkMode, toggleDarkMode };
}
