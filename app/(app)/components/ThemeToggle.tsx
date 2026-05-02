"use client";

import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") ?? "light") as "light" | "dark";
    setTheme(stored);
  }, []);

  function toggle() {
    const next: "light" | "dark" = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      className="icon-btn"
      onClick={toggle}
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
      aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
    </button>
  );
}
