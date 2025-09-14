// src/hooks/useDarkMode.ts
import { useEffect, useState } from "react";

export function useDarkMode() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dark") === "true";
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (enabled) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("dark", String(enabled));
  }, [enabled]);

  return [enabled, setEnabled] as const;
}
