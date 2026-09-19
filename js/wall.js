/**
 * Renderiza el corte transversal del muro: representación visual del
 * material y su grosor (o apertura de malla), a escala relativa.
 */

const WALL_MATERIAL_CLASS = {
  ladrillo: "wall-block--ladrillo",
  concreto: "wall-block--concreto",
  malla: "wall-block--malla",
};

// Torre de radio emitiendo, para el lado exterior del corte transversal.
const EXTERIOR_ICON_SVG = `
<svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M24 42V18"/>
  <path d="M16 42h16"/>
  <path d="M24 18l-6-13M24 18l6-13"/>
  <path d="M19.5 9h9"/>
  <circle cx="24" cy="5" r="1.6" fill="currentColor" stroke="none"/>
  <path d="M29 14c3.2 2.4 3.2 7 0 9.4" opacity="0.75"/>
  <path d="M33 10c5.6 4.2 5.6 13.6 0 17.8" opacity="0.45"/>
</svg>`;

// Habitación con ventana enrejada, para el lado interior del corte transversal.
const INTERIOR_ICON_SVG = `
<svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="9" y="7" width="30" height="34" rx="2"/>
  <line x1="16" y1="7" x2="16" y2="41"/>
  <line x1="24" y1="7" x2="24" y2="41"/>
  <line x1="32" y1="7" x2="32" y2="41"/>
  <line x1="9" y1="18" x2="39" y2="18"/>
</svg>`;

function renderWall(state, scenario) {
  const container = document.getElementById("wall-section");
  if (!container) return;

  const isMesh = state.materialId === "malla";
  const range = MATERIAL_PARAM_RANGES[state.materialId];
  const t = (state.materialParam - range.min) / (range.max - range.min);
  const blockWidthPct = isMesh ? 18 : Math.round(15 + t * 65); // %

  const materialLabel = MATERIALS.find((m) => m.id === state.materialId).label;
  const paramText = isMesh
    ? `apertura ${state.materialParam.toFixed(0)} mm`
    : `grosor ${state.materialParam.toFixed(2)} m`;

  let meshStyle = "";
  if (isMesh) {
    const cellPx = Math.min(40, Math.max(4, state.materialParam * 1.6));
    meshStyle = `style="--mesh-cell: ${cellPx}px;"`;
  }

  const verdictClass = `verdict--${scenario.verdict.key}`;

  container.innerHTML = `
    <div class="wall-diagram">
      <div class="wall-side-label">
        <span class="wall-side-icon wall-side-icon--exterior" aria-hidden="true">${EXTERIOR_ICON_SVG}</span>
        <span>Exterior</span>
      </div>
      <div class="wall-block ${WALL_MATERIAL_CLASS[state.materialId]}"
           style="width:${blockWidthPct}%;" ${meshStyle}>
        <span class="wall-block__attenuation mono">&minus;${fmtDb(scenario.attenuationDb)}</span>
      </div>
      <div class="wall-side-label">
        <span class="wall-side-icon wall-side-icon--interior ${verdictClass}" aria-hidden="true">${INTERIOR_ICON_SVG}</span>
        <span>Interior</span>
      </div>
    </div>
    <div class="wall-caption mono">${materialLabel} &middot; ${paramText}</div>
  `;
}
