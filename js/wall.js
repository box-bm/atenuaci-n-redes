/**
 * Renderiza el corte transversal del muro: representación visual del
 * material y su grosor (o apertura de malla), a escala relativa.
 */

const WALL_MATERIAL_CLASS = {
  ladrillo: "wall-block--ladrillo",
  concreto: "wall-block--concreto",
  malla: "wall-block--malla",
};

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

  container.innerHTML = `
    <div class="wall-diagram">
      <div class="wall-side-label">
        <span>Exterior</span>
        <span class="wall-side-arrow" aria-hidden="true">&rarr;</span>
      </div>
      <div class="wall-block ${WALL_MATERIAL_CLASS[state.materialId]}"
           style="width:${blockWidthPct}%;" ${meshStyle}>
        <span class="wall-block__attenuation mono">&minus;${fmtDb(scenario.attenuationDb)}</span>
      </div>
      <div class="wall-side-label">
        <span class="wall-side-arrow wall-side-arrow--faded" aria-hidden="true">&rarr;</span>
        <span>Interior</span>
      </div>
    </div>
    <div class="wall-caption mono">${materialLabel} &middot; ${paramText}</div>
  `;
}
