/**
 * Renderiza el panel de veredicto: badge de estado, potencia interior y
 * escala visual de umbrales (bloqueada / límite / fuga).
 */

const VERDICT_SCALE_MIN_DBM = -130;
const VERDICT_SCALE_MAX_DBM = -60;

function scaleToPct(dbm) {
  const clamped = Math.min(VERDICT_SCALE_MAX_DBM, Math.max(VERDICT_SCALE_MIN_DBM, dbm));
  return ((clamped - VERDICT_SCALE_MIN_DBM) / (VERDICT_SCALE_MAX_DBM - VERDICT_SCALE_MIN_DBM)) * 100;
}

function renderVerdict(scenario) {
  const container = document.getElementById("verdict-panel");
  if (!container) return;

  const { key, label } = scenario.verdict;
  const blockedEndPct = scaleToPct(VERDICT_THRESHOLDS_DBM.blocked);
  const marginalEndPct = scaleToPct(VERDICT_THRESHOLDS_DBM.marginal);
  const markerPct = scaleToPct(scenario.indoorDbm);

  container.innerHTML = `
    <div class="verdict-badge verdict--${key}">
      <span class="verdict-badge__label">${label}</span>
      <span class="verdict-badge__value mono">${fmtDbm(scenario.indoorDbm)}</span>
    </div>

    <div class="verdict-scale">
      <div class="verdict-scale__zone verdict-scale__zone--blocked" style="width:${blockedEndPct}%"></div>
      <div class="verdict-scale__zone verdict-scale__zone--marginal" style="width:${marginalEndPct - blockedEndPct}%"></div>
      <div class="verdict-scale__zone verdict-scale__zone--leak" style="width:${100 - marginalEndPct}%"></div>
      <div class="verdict-scale__marker" style="left:${markerPct}%" title="${fmtDbm(scenario.indoorDbm)}"></div>
    </div>
    <div class="verdict-scale__ticks mono">
      <span>${VERDICT_SCALE_MIN_DBM} dBm</span>
      <span>${VERDICT_THRESHOLDS_DBM.blocked} dBm</span>
      <span>${VERDICT_THRESHOLDS_DBM.marginal} dBm</span>
      <span>${VERDICT_SCALE_MAX_DBM} dBm</span>
    </div>
    <div class="verdict-legend">
      <span class="verdict-legend__item"><i class="verdict-legend__swatch verdict-legend__swatch--blocked"></i>Bloqueada &le; &minus;100 dBm</span>
      <span class="verdict-legend__item"><i class="verdict-legend__swatch verdict-legend__swatch--marginal"></i>Límite &minus;100 a &minus;95 dBm</span>
      <span class="verdict-legend__item"><i class="verdict-legend__swatch verdict-legend__swatch--leak"></i>Fuga &gt; &minus;95 dBm</span>
    </div>
  `;
}
