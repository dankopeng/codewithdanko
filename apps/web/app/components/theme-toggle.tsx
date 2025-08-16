import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "~/components/ui/button";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ iconsOnly = false }: { iconsOnly?: boolean }) {
  const [theme, setTheme] = React.useState<"light" | "dark" | "system" | null>(null);

  // Apply theme to document
  const applyTheme = React.useCallback((mode: "light" | "dark" | "system") => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = mode === "dark" || (mode === "system" && prefersDark);
    const root = document.documentElement.classList;
    if (isDark) root.add("dark");
    else root.remove("dark");
  }, []);

  React.useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark" | "system" | null) ?? null;
    const init = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(init);
    applyTheme(init === "system" ? "system" : init);
  }, [applyTheme]);

  // React to system theme changes when in 'system' mode
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  React.useEffect(() => {
    if (!theme) return;
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme, applyTheme]);

  if (!theme) return null;

  const itemCls = (active: boolean) =>
    "inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors " +
    (active
      ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800");

  return (
    <div className="flex items-center gap-1" aria-label="Theme switcher">
      <button className={itemCls(theme === "light")} onClick={() => setTheme("light")} aria-label="Light">
        <Sun className="h-4 w-4" />{iconsOnly ? null : <span className="ml-2">Light</span>}
      </button>
      <button className={itemCls(theme === "dark")} onClick={() => setTheme("dark")} aria-label="Dark">
        <Moon className="h-4 w-4" />{iconsOnly ? null : <span className="ml-2">Dark</span>}
      </button>
      <button className={itemCls(theme === "system")} onClick={() => setTheme("system")} aria-label="System">
        <Monitor className="h-4 w-4" />{iconsOnly ? null : <span className="ml-2">System</span>}
      </button>
    </div>
  );
}
