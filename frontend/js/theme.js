const Theme = (() => {
  const STORAGE_KEY = "obs_console_theme";
  const toggleBtn = document.getElementById("themeToggle");

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (toggleBtn) toggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    apply(current === "dark" ? "light" : "dark");
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    apply(saved || (prefersDark ? "dark" : "light"));

    if (toggleBtn) toggleBtn.addEventListener("click", toggle);
  }

  return { init, toggle, apply };
})();

document.addEventListener("DOMContentLoaded", Theme.init);
