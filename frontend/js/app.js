const App = (() => {
  let currentTab = "bookings";

  const REFRESHERS = {
    bookings: () => TabBookings.loadAll(),
    systems: () => TabSystems.loadAll(),
    zerto: () => TabZerto.loadAll(),
    about: () => {},
  };

  function updateClock() {
    document.getElementById("liveClock").textContent = new Date().toLocaleTimeString();
  }

  function refreshCurrentTab() {
    REFRESHERS[currentTab]?.();
  }

  function init() {
    updateClock();
    setInterval(updateClock, 1000);

    document.addEventListener("tab:changed", (e) => {
      currentTab = e.detail.tab;
      refreshCurrentTab();
    });

    document.getElementById("refreshBtn").addEventListener("click", refreshCurrentTab);

    setInterval(refreshCurrentTab, window.APP_CONFIG.REFRESH_INTERVAL_MS);
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);
