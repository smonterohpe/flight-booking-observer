// Badge de frescura de datos. Cada pestaña con polling crea uno y lo
// alimenta con markSuccess()/markFailure() en cada ciclo de refresco:
//   - markSuccess(): el último fetch fue correcto -> "● En vivo"
//   - markFailure(): el fetch falló -> se mantienen los datos anteriores
//     en pantalla y el badge pasa a "cached · Xm Ys" (tiempo desde el
//     último dato bueno), igual que en el dashboard de referencia.
function createFreshnessBadge(containerEl) {
  let lastSuccessAt = null;
  let mode = "loading"; // loading | live | cached
  let tickTimer = null;

  function humanElapsed(ms) {
    const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  function render() {
    if (mode === "loading") {
      containerEl.innerHTML = `<span class="freshness-badge freshness-badge--loading">${I18n.t("common.loading")}</span>`;
    } else if (mode === "live") {
      containerEl.innerHTML = `<span class="freshness-badge freshness-badge--live">● ${I18n.t("common.live")}</span>`;
    } else {
      const elapsed = lastSuccessAt ? humanElapsed(Date.now() - lastSuccessAt) : "—";
      containerEl.innerHTML = `<span class="freshness-badge freshness-badge--cached">⏱ ${I18n.t("common.cached")} · ${elapsed}</span>`;
    }
  }

  function markSuccess() {
    lastSuccessAt = Date.now();
    mode = "live";
    render();
  }

  function markFailure() {
    mode = lastSuccessAt ? "cached" : "loading";
    render();
  }

  if (!tickTimer) {
    tickTimer = setInterval(() => { if (mode === "cached") render(); }, 1000);
  }

  document.addEventListener("i18n:changed", render);
  render();

  return { markSuccess, markFailure };
}

window.createFreshnessBadge = createFreshnessBadge;
