const TabAbout = (() => {
  const stackContainer = document.getElementById("stackGroups");

  const STACK_GROUPS = [
    { key: "about.stack.frontend", items: ["nginx", "HTML5", "CSS3", "JavaScript"] },
    { key: "about.stack.backend", items: ["Python 3.12", "FastAPI", "Gunicorn", "SQLAlchemy"] },
    { key: "about.stack.database", items: ["PostgreSQL 16"] },
    { key: "about.stack.observability", items: ["nginx", "HTML/CSS/JS", "Chart.js", "FastAPI (zerto-probe)"] },
    { key: "about.stack.infra", items: ["Máquinas virtuales", "Linux"] },
  ];

  function renderStack() {
    stackContainer.innerHTML = STACK_GROUPS.map((group) => `
      <div class="stack-group">
        <div class="stack-group__title">${I18n.t(group.key)}</div>
        <div>${group.items.map((i) => `<span class="stack-pill">${i}</span>`).join("")}</div>
      </div>
    `).join("");
  }

  function renderArch() {
    const container = document.getElementById("archDiagramContainer");
    container.innerHTML = `
      <div class="card">
        <h2 data-i18n="about.archFlowBusiness">${I18n.t("about.archFlowBusiness")}</h2>
        <svg viewBox="0 0 920 150" style="width:100%; height:auto; font-family:inherit;">
          <defs>
            <marker id="arrowBusiness" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--primary)"/>
            </marker>
          </defs>

          <rect x="10" y="45" width="180" height="60" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="100" y="70" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">Browser</text>
          <text x="100" y="87" text-anchor="middle" fill="var(--text-muted)" font-size="10">End user</text>

          <line x1="190" y1="75" x2="238" y2="75" stroke="var(--primary)" stroke-width="1.6" marker-end="url(#arrowBusiness)"/>
          <text x="214" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">HTTP :80</text>

          <rect x="240" y="45" width="200" height="60" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="340" y="68" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">Frontend VM</text>
          <text x="340" y="84" text-anchor="middle" fill="var(--text-muted)" font-size="10">nginx · UI + RBG</text>
          <text x="340" y="97" text-anchor="middle" fill="var(--text-muted)" font-size="9">:80 · sys-probe :5001</text>

          <line x1="440" y1="75" x2="488" y2="75" stroke="var(--primary)" stroke-width="1.6" marker-end="url(#arrowBusiness)"/>
          <text x="464" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">proxy /api :8000</text>

          <rect x="490" y="45" width="200" height="60" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="590" y="68" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">Backend VM</text>
          <text x="590" y="84" text-anchor="middle" fill="var(--text-muted)" font-size="10">FastAPI · Gunicorn</text>
          <text x="590" y="97" text-anchor="middle" fill="var(--text-muted)" font-size="9">:8000</text>

          <line x1="690" y1="75" x2="738" y2="75" stroke="var(--primary)" stroke-width="1.6" marker-end="url(#arrowBusiness)"/>
          <text x="714" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">SQL :5432</text>

          <rect x="740" y="45" width="170" height="60" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="825" y="68" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">Database VM</text>
          <text x="825" y="84" text-anchor="middle" fill="var(--text-muted)" font-size="10">PostgreSQL 16</text>
          <text x="825" y="97" text-anchor="middle" fill="var(--text-muted)" font-size="9">db-probe :5000</text>
        </svg>
        <p class="card__subtitle" style="margin-top:10px">${I18n.t("about.archFlowBusinessCaption")}</p>
      </div>

      <div class="card">
        <h2>${I18n.t("about.archFlowObservability")}</h2>
        <svg viewBox="0 0 900 380" style="width:100%; height:auto; font-family:inherit;">
          <defs>
            <marker id="arrowObs" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--text-muted)"/>
            </marker>
          </defs>

          <rect x="15" y="150" width="230" height="80" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="130" y="178" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">Observability Console</text>
          <text x="130" y="196" text-anchor="middle" fill="var(--text-muted)" font-size="10">nginx · SPA</text>
          <text x="130" y="212" text-anchor="middle" fill="var(--text-muted)" font-size="9">+ zerto-probe local :5002</text>

          <line x1="245" y1="190" x2="555" y2="45"  stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#arrowObs)"/>
          <line x1="245" y1="190" x2="555" y2="135" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#arrowObs)"/>
          <line x1="245" y1="190" x2="555" y2="225" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#arrowObs)"/>
          <line x1="245" y1="190" x2="555" y2="320" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#arrowObs)"/>

          <text x="390" y="105" text-anchor="middle" fill="var(--primary)" font-size="9.5" font-weight="600">/api/kpis · /api/health</text>
          <text x="390" y="153" text-anchor="middle" fill="var(--primary)" font-size="9.5" font-weight="600">/check/frontend</text>
          <text x="390" y="248" text-anchor="middle" fill="var(--primary)" font-size="9.5" font-weight="600">/check/db · /check/db-sys</text>
          <text x="390" y="278" text-anchor="middle" fill="var(--primary)" font-size="9.5" font-weight="600">/zerto (local)</text>

          <rect x="560" y="10" width="290" height="70" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="705" y="35" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700">Backend VM</text>
          <text x="705" y="52" text-anchor="middle" fill="var(--text-muted)" font-size="10">FastAPI — booking KPIs + health</text>
          <text x="705" y="66" text-anchor="middle" fill="var(--text-muted)" font-size="9">:8000</text>

          <rect x="560" y="100" width="290" height="70" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="705" y="125" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700">Frontend VM</text>
          <text x="705" y="142" text-anchor="middle" fill="var(--text-muted)" font-size="10">nginx — HTTP ping + sys-probe</text>
          <text x="705" y="156" text-anchor="middle" fill="var(--text-muted)" font-size="9">:80 · :5001</text>

          <rect x="560" y="190" width="290" height="70" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="705" y="215" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700">Database VM</text>
          <text x="705" y="232" text-anchor="middle" fill="var(--text-muted)" font-size="10">PostgreSQL — db-probe + sys-probe</text>
          <text x="705" y="246" text-anchor="middle" fill="var(--text-muted)" font-size="9">:5432 · :5000 · :5001</text>

          <rect x="560" y="280" width="290" height="80" rx="8" fill="var(--surface-alt)" stroke="var(--border)"/>
          <text x="705" y="305" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700">Zerto ZVMA</text>
          <text x="705" y="322" text-anchor="middle" fill="var(--text-muted)" font-size="10">Origin + Destination — VPGs, RPO, journal</text>
          <text x="705" y="336" text-anchor="middle" fill="var(--text-muted)" font-size="9">Keycloak API</text>
          <text x="705" y="350" text-anchor="middle" fill="var(--text-muted)" font-size="9">(external system, outside this demo)</text>
        </svg>
        <p class="card__subtitle" style="margin-top:10px">${I18n.t("about.archFlowObservabilityCaption")}</p>
      </div>
    `;
  }

  function loadAll() {
    renderStack();
    renderArch();
  }

  function init() {
    loadAll();
    document.addEventListener("i18n:changed", loadAll);
  }

  return { init, loadAll };
})();

document.addEventListener("DOMContentLoaded", TabAbout.init);
