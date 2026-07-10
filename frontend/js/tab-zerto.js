const TabZerto = (() => {
  const statusBar = document.getElementById("zvmStatusBar");
  const cardGrid = document.getElementById("zertoCardGrid");

  function statusDot(ok) {
    return `<span class="status-dot ${ok ? "status-dot--ok" : "status-dot--error"}"></span>`;
  }

  function slaBadge(isMeetingSla, label) {
    const cls = isMeetingSla ? "badge--ok" : "badge--error";
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function vpgBlock(vpg) {
    return `
      <div class="zerto-vpg-block">
        <div class="zerto-stat-row">
          <div class="zerto-stat">
            <span class="zerto-stat__label">${I18n.t("zerto.vpgStatus")}</span>
            <span class="zerto-stat__value">${slaBadge(vpg.is_meeting_sla, vpg.status_label)}</span>
          </div>
          <div class="zerto-stat">
            <span class="zerto-stat__label">${I18n.t("zerto.actualRpo")}</span>
            <span class="zerto-stat__value">${vpg.actual_rpo_human}</span>
          </div>
        </div>
        ${progressRow(I18n.t("zerto.journalHistory"), vpg.journal_history_human, vpg.configured_journal_human, vpg.journal_ratio_percent)}
        ${progressRow(I18n.t("zerto.failsafeHistory"), vpg.failsafe_history_human, vpg.configured_failsafe_human, vpg.failsafe_ratio_percent)}
      </div>
    `;
  }

  function progressRow(label, value, configured, percent) {
    return `
      <div class="metric-row">
        <span class="metric-row__label" style="width:110px">${label}</span>
        <div class="metric-row__bar-track">
          <div class="metric-row__bar-fill" style="width:${Math.min(percent, 100)}%"></div>
        </div>
        <span class="metric-row__value">${value} / ${configured}</span>
      </div>
    `;
  }

  function vmsTable(vms) {
    if (!vms || vms.length === 0) {
      return `<p>${I18n.t("common.noData")}</p>`;
    }
    const rows = vms.map((vm) => `
      <tr>
        <td>${vm.name}</td>
        <td>${vm.status_label}</td>
        <td>${vm.actual_rpo_human}</td>
        <td>${vm.iops}</td>
        <td>${vm.journal_size_human}</td>
      </tr>
    `).join("");

    return `
      <table class="table">
        <thead><tr>
          <th>${I18n.t("zerto.colVm")}</th><th>${I18n.t("zerto.colStatus")}</th>
          <th>${I18n.t("zerto.colRpo")}</th><th>${I18n.t("zerto.colIops")}</th><th>${I18n.t("zerto.colJournal")}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function alertsList(alerts) {
    if (!alerts || alerts.length === 0) {
      return `<p style="text-align:center;color:var(--text-muted)">${I18n.t("zerto.noAlerts")}</p>`;
    }
    return alerts.map((a) => `
      <div class="infra-status-check">
        <span>${a.description}</span>
        <span class="badge badge--warn">${a.level}</span>
      </div>
    `).join("");
  }

  function eventsTable(events) {
    if (!events || events.length === 0) {
      return `<p style="text-align:center;color:var(--text-muted)">${I18n.t("zerto.noEvents")}</p>`;
    }
    const rows = events.map((e) => `
      <tr>
        <td>${e.time ? new Date(e.time).toLocaleString() : "—"}</td>
        <td>${e.site || "—"}</td>
        <td>${e.description}</td>
        <td>${e.user}</td>
      </tr>
    `).join("");

    return `
      <table class="table">
        <thead><tr>
          <th>${I18n.t("zerto.colTime")}</th><th>${I18n.t("zerto.colSite")}</th>
          <th>${I18n.t("zerto.colDescription")}</th><th>${I18n.t("zerto.colUser")}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function siteCard(site) {
    if (!site.reachable) {
      return `<div class="card"><h2>${statusDot(false)} ${site.label}</h2><p>${I18n.t("common.unreachable")}</p></div>`;
    }

    const vpgBlocks = site.vpgs.length > 0
      ? site.vpgs.map(vpgBlock).join("")
      : `<p>${I18n.t("common.noData")}</p>`;

    return `
      <div class="card">
        <h2>${statusDot(true)} ${site.label}</h2>
        ${vpgBlocks}
        <h2 style="margin-top:18px">${I18n.t("zerto.protectedVms")}</h2>
        ${vmsTable(site.protected_vms)}
        <h2 style="margin-top:18px">${I18n.t("zerto.activeAlerts")}</h2>
        ${alertsList(site.active_alerts)}
        <h2 style="margin-top:18px">${I18n.t("zerto.recentEvents")}</h2>
        ${eventsTable(site.recent_events)}
      </div>
    `;
  }

  async function loadAll() {
    try {
      const data = await Api.zerto.data();

      statusBar.innerHTML = `
        <span>${statusDot(data.remote.reachable)} ${data.remote.label}</span>
        <span>${statusDot(data.local.reachable)} ${data.local.label}</span>
      `;

      cardGrid.innerHTML = `${siteCard(data.remote)}${siteCard(data.local)}`;
    } catch (err) {
      statusBar.innerHTML = `<span>${statusDot(false)} ${I18n.t("common.unreachable")}</span>`;
      cardGrid.innerHTML = `<div class="card"><p>${I18n.t("common.unreachable")}</p></div>`;
      console.error("Error cargando datos de Zerto:", err);
    }
  }

  function init() {
    loadAll();
    document.addEventListener("i18n:changed", loadAll);
  }

  return { init, loadAll };
})();

document.addEventListener("DOMContentLoaded", TabZerto.init);
