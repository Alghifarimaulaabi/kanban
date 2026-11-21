"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "tb-theme";
const THEME_EVENT = "tb-theme-change";

function resolvePreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Ignore storage errors
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function syncDocumentTheme(next: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = next;
  root.classList.toggle("dark", next === "dark");
  root.style.colorScheme = next;
}

function getClientTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.dataset.theme;
  if (attr === "dark" || attr === "light") return attr;
  return resolvePreferredTheme();
}

function getServerTheme(): Theme {
  return "light";
}

function subscribeTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue === "dark" || event.newValue === "light") {
      syncDocumentTheme(event.newValue);
      onStoreChange();
    }
  };

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = (event: MediaQueryListEvent) => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") return;
    } catch {
      // Ignore storage access errors
    }
    syncDocumentTheme(event.matches ? "dark" : "light");
    onStoreChange();
  };

  window.addEventListener(THEME_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  mediaQuery.addEventListener("change", handleMediaChange);

  return () => {
    window.removeEventListener(THEME_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
    mediaQuery.removeEventListener("change", handleMediaChange);
  };
}

function applyTheme(next: Theme) {
  syncDocumentTheme(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage access errors
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      <rect x="6.5" y="6.5" width="7" height="7" />
      <path d="M10 1.75V4M10 16V18.25M1.75 10H4M16 10H18.25M4.15 4.15L5.7 5.7M14.3 14.3L15.85 15.85M15.85 4.15L14.3 5.7M5.7 14.3L4.15 15.85" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      <path d="M15.75 12.6A6.75 6.75 0 0 1 7.4 4.25A6.75 6.75 0 1 0 15.75 12.6Z" />
    </svg>
  );
}

interface ThemeToggleProps {
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function ThemeToggle({
  compact = false,
  fullWidth = false,
  className = "",
}: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getClientTheme,
    getServerTheme,
  );
  const isDark = theme === "dark";

  // Keep DOM attributes synchronized after hydration & route transitions
  useEffect(() => {
    const preferred = resolvePreferredTheme();
    syncDocumentTheme(preferred);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        applyTheme(isDark ? "light" : "dark");
      }}
      aria-label={isDark ? "Disable dark mode (switch to light)" : "Enable dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Dark mode: ON — click for Light mode" : "Dark mode: OFF — click for Dark mode"}
      className={[
        "tb-tactile-motion inline-flex min-h-[42px] min-w-[42px] shrink-0 cursor-pointer items-center gap-2.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-2.5 text-[12px] font-bold tracking-[0.06em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--tb-bg)] hover:shadow-[var(--tb-shadow-sm)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[var(--tb-shadow-pressed)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
        fullWidth && !compact ? "w-full justify-between px-3" : "justify-center",
        !fullWidth && !compact ? "sm:min-h-[44px] sm:px-3" : "",
        className,
      ].join(" ")}
    >
      <span className="inline-flex items-center gap-2">
        {isDark ? (
          <SunIcon className="h-4 w-4 shrink-0" />
        ) : (
          <MoonIcon className="h-4 w-4 shrink-0" />
        )}
        {!compact ? (
          <span className={fullWidth ? "uppercase" : "hidden uppercase sm:inline"}>
            {fullWidth ? "Dark Mode" : isDark ? "Light Mode" : "Dark Mode"}
          </span>
        ) : null}
      </span>
      {fullWidth && !compact ? (
        <span
          className={[
            "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase",
            isDark
              ? "bg-[var(--tb-primary)] text-[var(--tb-on-accent)]"
              : "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
          ].join(" ")}
        >
          {isDark ? "ON" : "OFF"}
        </span>
      ) : null}
    </button>
  );
}
