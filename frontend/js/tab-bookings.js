const TabBookings = (() => {
  const RANGE_OPTIONS = [
    { key: "last15m", minutes: 15 },
    { key: "last30m", minutes: 30 },
    { key: "last1h", minutes: 60 },
    { key: "last3h", minutes: 180 },
    { key: "last6h", minutes: 360 },
    { key: "last12h", minutes: 720 },
    { key: "last24h", minutes: 1440 },
    { key: "last2d", minutes: 2880 },
    { key: "last5d", minutes: 7200 },
    { key: "lastWeek", minutes: 10080 },
    { key: "last10d", minutes: 14400 },
    { key: "last15d", minutes: 21600 },
    { key: "last30d", minutes: 43200 },
    { key: "allData", minutes: null },
  ];

  let selectedRange = RANGE_OPTIONS.find((r) => r.key === "last24h");
  let timelineChart = null;
  let cumulativeChart = null;
  let hourlyChart = null;
  let freshness = null;

  function chartColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue("--primary").trim(),
      green: styles.getPropertyValue("--accent-green").trim(),
      text: styles.getPropertyValue("--text-muted").trim(),
      grid: styles.getPropertyValue("--chart-grid").trim(),
    };
  }

  function buildRangeMenu() {
    const picker = document.getElementById("rangePicker");
    const trigger = document.getElementById("rangeTrigger");

    const menu = document.createElement("div");
    menu.className = "range-picker__menu";
    menu.id = "rangeMenu";

    RANGE_OPTIONS.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "range-picker__option" + (opt.key === selectedRange.key ? " range-picker__option--active" : "");
      btn.dataset.rangeKey = opt.key;
      btn.textContent = I18n.t(`range.${opt.key}`);
      btn.addEventListener("click", () => {
        selectedRange = opt;
        document.getElementById("rangeLabel").textContent = I18n.t(`range.${opt.key}`);
        menu.classList.remove("range-picker__menu--open");
        menu.querySelectorAll(".range-picker__option").forEach((o) =>
          o.classList.toggle("range-picker__option--active", o.dataset.rangeKey === opt.key)
        );
        loadAll();
      });
      menu.appendChild(btn);
    });

    picker.appendChild(menu);

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("range-picker__menu--open");
    });
    document.addEventListener("click", () => menu.classList.remove("range-picker__menu--open"));

    document.addEventListener("i18n:changed", () => {
      document.getElementById("rangeLabel").textContent = I18n.t(`range.${selectedRange.key}`);
      menu.querySelectorAll(".range-picker__option").forEach((btn) => {
        btn.textContent = I18n.t(`range.${btn.dataset.rangeKey}`);
      });
    });
  }

  function humanMinutesAgo(minutes) {
    if (minutes === null || minutes === undefined) return "—";
    if (minutes < 1) return "<1 min";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    return `${Math.floor(hours / 24)} d`;
  }

  async function loadKpis() {
    try {
      const summary = await Api.business.kpiSummary();
      document.getElementById("kpiTotalBookings").textContent = summary.total_bookings.toLocaleString();
      document.getElementById("kpiTotalRevenue").textContent =
        `€${summary.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      document.getElementById("kpiLastBooking").textContent = humanMinutesAgo(summary.minutes_since_last_booking);
      document.getElementById("kpiAvgPerDay").textContent = Math.round(summary.avg_bookings_per_day).toLocaleString();
      return true;
    } catch (err) {
      // No se sobrescriben los valores anteriores: se quedan en pantalla
      // los últimos datos buenos, y el freshness badge pasa a "cached".
      console.error("Error cargando KPIs:", err);
      return false;
    }
  }

  async function loadCharts() {
    let points = [];
    try {
      const fromIso = selectedRange.minutes
        ? new Date(Date.now() - selectedRange.minutes * 60000).toISOString()
        : new Date(0).toISOString();
      points = await Api.business.kpiTimeseries(fromIso);
    } catch (err) {
      console.error("Error cargando serie temporal:", err);
      return false;
    }

    const colors = chartColors();
    const labels = points.map((p) => new Date(p.minute));
    const bookingCounts = points.map((p) => p.bookings_count);
    const revenues = points.map((p) => p.revenue);

    // ---- Timeline (reservas + ingresos por minuto) ----
    const timelineCtx = document.getElementById("timelineChart");
    if (timelineChart) timelineChart.destroy();
    timelineChart = new Chart(timelineCtx, {
      data: {
        labels,
        datasets: [
          {
            type: "bar",
            label: I18n.t("chart.bookings"),
            data: bookingCounts,
            backgroundColor: colors.primary,
            yAxisID: "y",
          },
          {
            type: "line",
            label: I18n.t("chart.revenue"),
            data: revenues,
            borderColor: colors.green,
            backgroundColor: "transparent",
            yAxisID: "y1",
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: chartOptions(colors, true),
    });

    // ---- Ingresos acumulados ----
    let cumulative = 0;
    const cumulativeData = revenues.map((r) => (cumulative += r));

    const cumulativeCtx = document.getElementById("cumulativeChart");
    if (cumulativeChart) cumulativeChart.destroy();
    cumulativeChart = new Chart(cumulativeCtx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: I18n.t("chart.revenue"),
          data: cumulativeData,
          borderColor: colors.primary,
          backgroundColor: `color-mix(in srgb, ${colors.primary} 15%, transparent)`,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
        }],
      },
      options: chartOptions(colors, false),
    });

    // ---- Distribución por hora del día ----
    const hourlyBookings = new Array(24).fill(0);
    const hourlyRevenue = new Array(24).fill(0);
    points.forEach((p) => {
      const h = new Date(p.minute).getHours();
      hourlyBookings[h] += p.bookings_count;
      hourlyRevenue[h] += p.revenue;
    });

    const hourlyCtx = document.getElementById("hourlyChart");
    if (hourlyChart) hourlyChart.destroy();
    hourlyChart = new Chart(hourlyCtx, {
      data: {
        labels: Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}h`),
        datasets: [
          {
            type: "bar",
            label: I18n.t("chart.bookings"),
            data: hourlyBookings,
            backgroundColor: colors.primary,
            yAxisID: "y",
          },
          {
            type: "line",
            label: I18n.t("chart.revenue"),
            data: hourlyRevenue,
            borderColor: colors.green,
            backgroundColor: "transparent",
            yAxisID: "y1",
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: chartOptions(colors, true),
    });

    return true;
  }

  function chartOptions(colors, dualAxis) {
    const scales = {
      x: { grid: { color: colors.grid }, ticks: { color: colors.text, maxTicksLimit: 10 } },
      y: { grid: { color: colors.grid }, ticks: { color: colors.text }, position: "left" },
    };
    if (dualAxis) {
      scales.y1 = { position: "right", grid: { display: false }, ticks: { color: colors.text } };
    }
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { labels: { color: colors.text } } },
      scales,
    };
  }

  async function loadAll() {
    const [kpisOk, chartsOk] = await Promise.all([loadKpis(), loadCharts()]);
    if (kpisOk && chartsOk) {
      freshness?.markSuccess();
    } else {
      freshness?.markFailure();
    }
  }

  function init() {
    freshness = createFreshnessBadge(document.getElementById("bookingsFreshness"));
    buildRangeMenu();
    loadAll();
    document.addEventListener("i18n:changed", loadAll);
  }

  return { init, loadAll };
})();

document.addEventListener("DOMContentLoaded", TabBookings.init);
