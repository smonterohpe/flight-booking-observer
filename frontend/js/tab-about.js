const TabAbout = (() => {
  const stackContainer = document.getElementById("stackGroups");
  const archContainer = document.getElementById("archDiagram");

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

  function archBox(vmLabelKey, name, tech, port) {
    return `
      <div class="arch-box">
        <div class="arch-box__vm">${I18n.t(vmLabelKey)}</div>
        <div class="arch-box__name">${name}</div>
        <div class="arch-box__tech">${tech}</div>
        <div class="arch-box__port">${port}</div>
      </div>
    `;
  }

  function renderArch() {
    archContainer.innerHTML = `
      <div class="arch-row">
        ${archBox("about.stack.frontend", "Frontend", "nginx · HTML/CSS/JS", ":80")}
        ${archBox("about.stack.backend", "Backend", "FastAPI · Gunicorn", ":8000")}
        ${archBox("about.stack.database", "Database", "PostgreSQL 16", ":5432")}
        ${archBox("about.stack.observability", "Observability Console", "nginx · zerto-probe", ":80 / :5002")}
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
