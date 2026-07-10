const Sidebar = (() => {
  const STORAGE_KEY = "obs_console_sidebar_collapsed";
  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("collapseBtn");
  const pageTitle = document.getElementById("pageTitle");

  const TAB_TITLE_KEYS = {
    bookings: "nav.bookings",
    systems: "nav.systems",
    zerto: "nav.zerto",
    about: "nav.about",
  };

  function activateTab(tabName) {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("nav-item--active", btn.dataset.tab === tabName);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("tab-panel--active", panel.id === `tab-${tabName}`);
    });
    pageTitle.textContent = I18n.t(TAB_TITLE_KEYS[tabName]);
    document.dispatchEvent(new CustomEvent("tab:changed", { detail: { tab: tabName } }));
  }

  function toggleCollapse() {
    const collapsed = sidebar.classList.toggle("is-collapsed");
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }

  function init() {
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      sidebar.classList.add("is-collapsed");
    }
    collapseBtn.addEventListener("click", toggleCollapse);

    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => activateTab(btn.dataset.tab));
    });

    document.addEventListener("i18n:changed", () => {
      const activeBtn = document.querySelector(".nav-item--active");
      if (activeBtn) pageTitle.textContent = I18n.t(TAB_TITLE_KEYS[activeBtn.dataset.tab]);
    });
  }

  return { init, activateTab };
})();

document.addEventListener("DOMContentLoaded", Sidebar.init);
