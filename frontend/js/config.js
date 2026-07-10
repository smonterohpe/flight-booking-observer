// Todas las rutas son relativas al propio origen: el NGINX de esta VM
// (observability-console) hace de proxy hacia el resto de servicios.
// Ver nginx/observability-console.conf para el mapeo completo.
window.APP_CONFIG = {
  BUSINESS_API: "/api",              // -> flight-booking-backend (:8000)
  CHECK_FRONTEND: "/check/frontend",       // -> frontend nginx (:80)
  CHECK_FRONTEND_SYS: "/check/frontend-sys", // -> sys-probe en VM frontend (:5001)
  CHECK_DB: "/check/db",              // -> db-probe en VM database (:5000)
  CHECK_DB_SYS: "/check/db-sys",       // -> sys-probe en VM database (:5001)
  ZERTO: "/zerto",                    // -> zerto-probe local (:5002)

  REFRESH_INTERVAL_MS: 5000,
};
