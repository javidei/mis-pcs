const tabs = [...document.querySelectorAll("[data-view]")];
const panels = [...document.querySelectorAll("[data-panel]")];
const content = document.querySelector("#contenido");
const closingAction = document.querySelector("#closing-action");
const validViews = new Set(["sue", "javi", "comparativa"]);

const aliases = {
  pc1: "sue",
  pc2: "sue",
  pc3: "javi",
  pc2015: "sue",
  pc2026: "javi"
};

const viewMeta = {
  sue: {
    title: "PC de Sue · evolución 2015–2026",
    next: "javi",
    action: "Ver el PC de Javi"
  },
  javi: {
    title: "PC de Javi · RTX 5070 Ti",
    next: "comparativa",
    action: "Comparar los dos PC"
  },
  comparativa: {
    title: "Comparativa · Sue y Javi",
    next: "sue",
    action: "Ver la evolución de Sue"
  }
};

function normalizeView(value) {
  const cleanValue = value.replace(/^#/, "");
  return validViews.has(cleanValue) ? cleanValue : aliases[cleanValue] || "comparativa";
}

function isViewHash(value) {
  const cleanValue = value.replace(/^#/, "");
  return validViews.has(cleanValue) || Object.hasOwn(aliases, cleanValue);
}

function activateView(value, options = {}) {
  const view = normalizeView(value);

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== view;
  });

  tabs.forEach((tab) => {
    const selected = tab.dataset.view === view;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  const meta = viewMeta[view];
  closingAction.href = `#${meta.next}`;
  closingAction.dataset.go = meta.next;
  closingAction.innerHTML = `${meta.action} <span>→</span>`;
  document.title = `${meta.title} · PC de casa`;

  if (options.updateHash !== false) {
    history.replaceState(null, "", `#${view}`);
  }

  if (options.scroll) {
    content.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    activateView(tab.dataset.view, { scroll: true });
  });

  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    let targetIndex = index;
    if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") targetIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") targetIndex = 0;
    if (event.key === "End") targetIndex = tabs.length - 1;

    tabs[targetIndex].focus();
    activateView(tabs[targetIndex].dataset.view, { scroll: false });
  });
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-go]");
  if (!target) return;

  event.preventDefault();
  activateView(target.dataset.go, { scroll: true });
});

window.addEventListener("hashchange", () => {
  if (isViewHash(location.hash)) {
    activateView(location.hash, { updateHash: false, scroll: true });
  }
});

activateView(location.hash, { updateHash: false });
