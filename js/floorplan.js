/**
 * Plano 2D interactivo de la infraestructura penitenciaria: torre celular,
 * muro perimetral (material seleccionado) y bloque de celdas. Los tres
 * elementos son clicables/enfocables y muestran su detalle en el panel
 * inferior.
 */

let selectedHotspot = "cell";

function renderFloorplan(state, scenario) {
  const container = document.getElementById("floorplan-canvas");
  if (!container) return;

  const isMesh = state.materialId === "malla";
  const range = MATERIAL_PARAM_RANGES[state.materialId];
  const t = (state.materialParam - range.min) / (range.max - range.min);
  const thickness = isMesh ? 10 : Math.round(8 + t * 26);
  const meshCell = isMesh ? Math.min(26, Math.max(3, state.materialParam * 1.1)) : 10;

  const outer = { x: 150, y: 40, w: 450, h: 220 };
  const inner = {
    x: outer.x + thickness,
    y: outer.y + thickness,
    w: outer.w - thickness * 2,
    h: outer.h - thickness * 2,
  };

  const margin = 10;
  const gap = 5;
  const corridorGap = 16;
  const cols = 4;
  const rows = 2;
  const cellW = (inner.w - margin * 2 - gap * (cols - 1)) / cols;
  const cellH = (inner.h - margin * 2 - corridorGap) / rows;

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: inner.x + margin + c * (cellW + gap),
        y: inner.y + margin + r * (cellH + corridorGap),
        w: cellW,
        h: cellH,
      });
    }
  }

  const verdictClass = `verdict--${scenario.verdict.key}`;

  const cellsMarkup = cells
    .map(
      (c) => `<rect class="fp-cell fp-hotspot ${verdictClass}" data-hotspot="cell" tabindex="0" role="button"
        x="${c.x.toFixed(1)}" y="${c.y.toFixed(1)}" width="${c.w.toFixed(1)}" height="${c.h.toFixed(1)}" rx="2"></rect>`
    )
    .join("");

  container.innerHTML = `
    <svg class="floorplan-svg" viewBox="0 0 640 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Plano 2D de la infraestructura penitenciaria">
      <defs>
        <pattern id="fp-pat-ladrillo" width="22" height="11" patternUnits="userSpaceOnUse">
          <rect width="22" height="11" fill="#7a3b2a"></rect>
          <path d="M0 11H22M11 0V11" stroke="#00000045" stroke-width="1"></path>
        </pattern>
        <pattern id="fp-pat-concreto" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#6b7280"></rect>
          <circle cx="2" cy="2" r="0.6" fill="#ffffff33"></circle>
          <circle cx="6" cy="6" r="0.6" fill="#ffffff33"></circle>
        </pattern>
        <pattern id="fp-pat-malla" width="${meshCell}" height="${meshCell}" patternUnits="userSpaceOnUse">
          <rect width="${meshCell}" height="${meshCell}" fill="#141a26"></rect>
          <path d="M0 0H${meshCell}M0 0V${meshCell}" stroke="#8fa2c2" stroke-width="1"></path>
        </pattern>
      </defs>

      <rect class="fp-yard" x="0" y="0" width="640" height="300" rx="4"></rect>

      <g class="fp-waves" aria-hidden="true">
        <path d="M80 150 Q104 128 80 106"></path>
        <path d="M94 150 Q128 118 94 86"></path>
        <path d="M108 150 Q152 108 108 66"></path>
      </g>

      <g class="fp-tower fp-hotspot" data-hotspot="tower" tabindex="0" role="button" transform="translate(30,110)">
        <path d="M16 40V10"></path>
        <path d="M8 40h16"></path>
        <path d="M16 10l-4-9M16 10l4-9"></path>
        <circle cx="16" cy="1" r="1.5" fill="currentColor" stroke="none"></circle>
      </g>
      <text class="fp-label" x="16" y="158" text-anchor="middle">TORRE</text>
      <text class="fp-label fp-label--dim" x="16" y="169" text-anchor="middle">${scenario.distanceM} m</text>

      <path class="fp-wall fp-hotspot" data-hotspot="wall" tabindex="0" role="button"
        fill-rule="evenodd" fill="url(#fp-pat-${state.materialId})"
        d="M${outer.x} ${outer.y}H${outer.x + outer.w}V${outer.y + outer.h}H${outer.x}Z
           M${inner.x} ${inner.y}H${inner.x + inner.w}V${inner.y + inner.h}H${inner.x}Z"></path>
      <text class="fp-label" x="${outer.x + outer.w / 2}" y="${outer.y - 10}" text-anchor="middle">MURO PERIMETRAL</text>

      <rect class="fp-interior-bg" x="${inner.x}" y="${inner.y}" width="${inner.w}" height="${inner.h}"></rect>
      <rect class="fp-corridor" x="${(inner.x + margin).toFixed(1)}" y="${(inner.y + margin + cellH).toFixed(1)}"
        width="${(inner.w - margin * 2).toFixed(1)}" height="${corridorGap}"></rect>

      ${cellsMarkup}
      <text class="fp-label" x="${inner.x + inner.w / 2}" y="${outer.y + outer.h + 22}" text-anchor="middle">BLOQUE DE CELDAS</text>

      <g class="fp-watchtower" transform="translate(${outer.x - 15},${outer.y - 15})" aria-hidden="true"><rect width="12" height="12"></rect></g>
      <g class="fp-watchtower" transform="translate(${outer.x + outer.w + 3},${outer.y + outer.h + 3})" aria-hidden="true"><rect width="12" height="12"></rect></g>
    </svg>

    <div class="floorplan-info" id="floorplan-info"></div>
  `;

  const svg = container.querySelector(".floorplan-svg");
  svg.querySelectorAll("[data-hotspot]").forEach((el) => {
    el.addEventListener("click", () => selectHotspot(el.dataset.hotspot, state, scenario));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectHotspot(el.dataset.hotspot, state, scenario);
      }
    });
  });

  applyHotspotSelection(svg);
  updateFloorplanInfo(state, scenario);
}

function selectHotspot(kind, state, scenario) {
  selectedHotspot = kind;
  const svg = document.querySelector(".floorplan-svg");
  if (svg) applyHotspotSelection(svg);
  updateFloorplanInfo(state, scenario);
}

function applyHotspotSelection(svg) {
  svg.querySelectorAll("[data-hotspot]").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.hotspot === selectedHotspot);
  });
}

function updateFloorplanInfo(state, scenario) {
  const panel = document.getElementById("floorplan-info");
  if (!panel) return;

  const isMesh = state.materialId === "malla";
  const materialLabel = MATERIALS.find((m) => m.id === state.materialId).label;
  const paramText = isMesh
    ? `apertura ${state.materialParam.toFixed(0)} mm`
    : `grosor ${state.materialParam.toFixed(2)} m`;

  if (selectedHotspot === "tower") {
    panel.innerHTML = `<strong>Torre celular</strong> &middot; EIRP ${fmtDbm(scenario.eirpDbm)} &middot; ${scenario.freqMHz} MHz &middot; distancia a la fachada ${scenario.distanceM} m`;
  } else if (selectedHotspot === "wall") {
    panel.innerHTML = `<strong>Muro perimetral</strong> &middot; ${materialLabel} &middot; ${paramText} &middot; atenuación &minus;${fmtDb(scenario.attenuationDb)}`;
  } else {
    panel.innerHTML = `<strong>Bloque de celdas</strong> &middot; ${fmtDbm(scenario.indoorDbm)} &middot; <span class="verdict--${scenario.verdict.key}">${scenario.verdict.label}</span> &middot; potencia uniforme asumida en todo el interior`;
  }
}
