/**
 * Orquestación de la interfaz: estado, controles y disparo de renders.
 */

const state = {
  techId: TECHNOLOGIES[1].id, // 3G por defecto
  materialId: "concreto",
  materialParam: 0.3, // metros (grosor) o metros (apertura, se ajusta según material)
  distanceM: 1200,
  eirpDbm: 43,
};

const BLOCKING_PRESETS = [
  {
    id: "tight",
    label: "Bloqueo mínimo",
    materialId: "malla",
    materialParam: 3,
    distanceM: 1550,
    eirpDbm: 30,
  },
  {
    id: "robust",
    label: "Bloqueo robusto",
    materialId: "malla",
    materialParam: 3,
    distanceM: 3000,
    eirpDbm: 30,
  },
];

const MATERIAL_PARAM_RANGES = {
  ladrillo: { min: 0.1, max: 1.0, step: 0.01, unit: "m", label: "Grosor de muro (m)", default: 0.2 },
  concreto: { min: 0.1, max: 1.0, step: 0.01, unit: "m", label: "Grosor de muro (m)", default: 0.2 },
  malla: { min: 3, max: 50, step: 1, unit: "mm", label: "Apertura de malla (mm)", default: 10 },
};

const els = {
  techSelect: document.getElementById("tech-select"),
  techFreqValue: document.getElementById("tech-freq-value"),
  materialSelect: document.getElementById("material-select"),
  paramLabel: document.getElementById("param-label"),
  paramSlider: document.getElementById("param-slider"),
  paramValue: document.getElementById("param-value"),
  distanceSlider: document.getElementById("distance-slider"),
  distanceValue: document.getElementById("distance-value"),
  eirpSlider: document.getElementById("eirp-slider"),
  eirpValue: document.getElementById("eirp-value"),
  presetsButtons: document.getElementById("presets-buttons"),
};

function getCurrentTech() {
  return TECHNOLOGIES.find((t) => t.id === state.techId);
}

function getMaterialParamInBaseUnits() {
  // La malla se controla en mm en la UI pero la física trabaja en metros.
  return state.materialId === "malla" ? state.materialParam / 1000 : state.materialParam;
}

function populateSelects() {
  els.techSelect.innerHTML = TECHNOLOGIES.map(
    (t) => `<option value="${t.id}">${t.label} (${t.freqMHz} MHz)</option>`
  ).join("");
  els.techSelect.value = state.techId;

  els.materialSelect.innerHTML = MATERIALS.map(
    (m) => `<option value="${m.id}">${m.label}</option>`
  ).join("");
  els.materialSelect.value = state.materialId;
}

function applyMaterialParamRange() {
  const range = MATERIAL_PARAM_RANGES[state.materialId];
  els.paramLabel.textContent = range.label;
  els.paramSlider.min = range.min;
  els.paramSlider.max = range.max;
  els.paramSlider.step = range.step;
  if (state.materialParam < range.min || state.materialParam > range.max) {
    state.materialParam = range.default;
  }
  els.paramSlider.value = state.materialParam;
}

function syncControlLabels() {
  const tech = getCurrentTech();
  els.techFreqValue.textContent = `${tech.freqMHz} MHz`;
  const range = MATERIAL_PARAM_RANGES[state.materialId];
  els.paramValue.textContent = `${state.materialParam.toFixed(range.unit === "m" ? 2 : 0)} ${range.unit}`;
  els.distanceValue.textContent = `${state.distanceM} m`;
  els.eirpValue.textContent = `${state.eirpDbm} dBm`;
}

function populatePresetButtons() {
  els.presetsButtons.innerHTML = BLOCKING_PRESETS.map(
    (p) => `<button type="button" class="preset-btn" data-preset-id="${p.id}">${p.label}</button>`
  ).join("");
  els.presetsButtons.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = BLOCKING_PRESETS.find((p) => p.id === btn.dataset.presetId);
      applyPreset(preset);
    });
  });
}

function applyPreset(preset) {
  state.materialId = preset.materialId;
  state.materialParam = preset.materialParam;
  state.distanceM = preset.distanceM;
  state.eirpDbm = preset.eirpDbm;

  els.materialSelect.value = state.materialId;
  applyMaterialParamRange();
  els.distanceSlider.value = state.distanceM;
  els.eirpSlider.value = state.eirpDbm;
  update();
}

function bindEvents() {
  els.techSelect.addEventListener("change", (e) => {
    state.techId = e.target.value;
    update();
  });
  els.materialSelect.addEventListener("change", (e) => {
    state.materialId = e.target.value;
    applyMaterialParamRange();
    update();
  });
  els.paramSlider.addEventListener("input", (e) => {
    state.materialParam = Number(e.target.value);
    update();
  });
  els.distanceSlider.addEventListener("input", (e) => {
    state.distanceM = Number(e.target.value);
    update();
  });
  els.eirpSlider.addEventListener("input", (e) => {
    state.eirpDbm = Number(e.target.value);
    update();
  });
}

function update() {
  syncControlLabels();
  const tech = getCurrentTech();
  const scenario = computeScenario({
    freqMHz: tech.freqMHz,
    distanceM: state.distanceM,
    eirpDbm: state.eirpDbm,
    materialId: state.materialId,
    materialParam: getMaterialParamInBaseUnits(),
  });

  if (typeof renderDiagram === "function") renderDiagram(scenario);
  if (typeof renderFloorplan === "function") renderFloorplan(state, scenario);
  if (typeof renderVerdict === "function") renderVerdict(scenario);
  if (typeof renderComparisonTable === "function") renderComparisonTable(state);
}

function initThemeToggle() {
  const stored = localStorage.getItem("theme");
  const icon = document.getElementById("theme-toggle-icon");
  const apply = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    icon.textContent = theme === "light" ? "☀" : "☾";
  };
  apply(stored === "light" ? "light" : "dark");
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    apply(next);
    localStorage.setItem("theme", next);
  });
}

function initGlossaryModal() {
  const modal = document.getElementById("glossary-modal");
  const openBtn = document.getElementById("glossary-toggle");
  const closeBtn = document.getElementById("glossary-close");
  if (!modal || !openBtn) return;

  openBtn.addEventListener("click", () => modal.showModal());
  closeBtn.addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

function init() {
  populateSelects();
  applyMaterialParamRange();
  els.distanceSlider.value = state.distanceM;
  els.eirpSlider.value = state.eirpDbm;
  populatePresetButtons();
  bindEvents();
  initThemeToggle();
  initGlossaryModal();
  update();
}

document.addEventListener("DOMContentLoaded", init);
