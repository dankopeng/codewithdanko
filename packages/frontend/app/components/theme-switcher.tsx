import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";

type Theme = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");

  // 初始化主題
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // 默認使用系統主題
      setTheme("system");
      applySystemTheme();
    }
  }, []);

  // 監聽系統主題變化
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applySystemTheme();
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // 應用系統主題
  const applySystemTheme = () => {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDarkMode);
  };

  // 應用指定主題
  const applyTheme = (newTheme: Theme) => {
    if (newTheme === "system") {
      applySystemTheme();
    } else {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  // 切換主題
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        className={`w-8 h-8 ${theme === "light" ? "bg-accent/50" : ""}`}
        onClick={() => handleThemeChange("light")}
        title="淺色模式"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`w-8 h-8 ${theme === "dark" ? "bg-accent/50" : ""}`}
        onClick={() => handleThemeChange("dark")}
        title="深色模式"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`w-8 h-8 ${theme === "system" ? "bg-accent/50" : ""}`}
        onClick={() => handleThemeChange("system")}
        title="跟隨系統"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <rect width="16" height="12" x="4" y="6" rx="2" />
          <path d="M14 2H10" />
          <path d="M12 22v-4" />
          <path d="M18 16v.01" />
        </svg>
      </Button>
    </div>
  );
}
