// Cliente API de la Observability Console. Todas las llamadas van al
// mismo origen (NGINX local), que las reenvía al servicio correcto.
const Api = (() => {
  const C = window.APP_CONFIG;

  async function getJson(url, { timeoutMs = 6000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // Ping "crudo": solo mide estado HTTP y latencia, sin parsear el
  // cuerpo (útil para el frontend, que responde HTML, no JSON).
  async function pingRaw(url, { method = "GET", timeoutMs = 4000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const started = performance.now();
    try {
      const response = await fetch(url, { method, signal: controller.signal });
      const latencyMs = Math.round(performance.now() - started);
      return { ok: response.ok, status: response.status, latencyMs };
    } catch (err) {
      return { ok: false, status: 0, latencyMs: Math.round(performance.now() - started), error: err.message };
    } finally {
      clearTimeout(timer);
    }
  }

  // ---- Backend de negocio (KPIs de reservas) ----
  const business = {
    health: () => getJson(`${C.BUSINESS_API}/health`),
    ping: () => getJson(`${C.BUSINESS_API}/ping`),
    system: () => getJson(`${C.BUSINESS_API}/system`),
    kpiSummary: (from, to) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      return getJson(`${C.BUSINESS_API}/kpis/summary${qs ? `?${qs}` : ""}`);
    },
    kpiTimeseries: (from, to) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      return getJson(`${C.BUSINESS_API}/kpis/timeseries${qs ? `?${qs}` : ""}`);
    },
  };

  // ---- Probes de sistema (Frontend / Database) ----
  const probes = {
    frontendPing: () => pingRaw(`${C.CHECK_FRONTEND}/`),
    frontendCssPing: () => pingRaw(`${C.CHECK_FRONTEND}/css/style.css`, { method: "HEAD" }),
    frontendSysMetrics: () => getJson(`${C.CHECK_FRONTEND_SYS}/metrics`),
    dbPing: () => getJson(`${C.CHECK_DB}/ping`),
    dbMetrics: () => getJson(`${C.CHECK_DB}/metrics`),
    dbSysMetrics: () => getJson(`${C.CHECK_DB_SYS}/metrics`),
  };

  // ---- Zerto ----
  const zerto = {
    data: () => getJson(`${C.ZERTO}/data`),
  };

  return { business, probes, zerto, pingRaw };
})();
