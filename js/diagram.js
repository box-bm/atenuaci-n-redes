/**
 * Renderiza el diagrama del trayecto de la señal: Torre -> Fachada -> Interior,
 * mostrando la potencia en cada etapa y la pérdida entre etapas.
 */

function fmtDbm(value) {
  return `${value.toFixed(1)} dBm`;
}

function fmtDb(value) {
  return `${value.toFixed(1)} dB`;
}

function renderDiagram(scenario) {
  const container = document.getElementById("signal-diagram");
  if (!container) return;

  const verdictClass = `verdict--${scenario.verdict.key}`;

  container.innerHTML = `
    <div class="stage stage--tower">
      <div class="stage__glyph" aria-hidden="true">TX</div>
      <div class="stage__label">Torre celular</div>
      <div class="stage__value mono">${fmtDbm(scenario.eirpDbm)}</div>
      <div class="stage__sub mono">EIRP · ${scenario.freqMHz} MHz</div>
    </div>

    <div class="stage__link">
      <div class="stage__link-label mono">&minus;${fmtDb(scenario.fsplDb)}</div>
      <div class="stage__link-caption">FSPL en ${scenario.distanceM} m</div>
      <div class="stage__link-line"></div>
    </div>

    <div class="stage stage--facade">
      <div class="stage__glyph" aria-hidden="true">▢</div>
      <div class="stage__label">Fachada</div>
      <div class="stage__value mono">${fmtDbm(scenario.facadeDbm)}</div>
      <div class="stage__sub mono">antes del blindaje</div>
    </div>

    <div class="stage__link">
      <div class="stage__link-label mono">&minus;${fmtDb(scenario.attenuationDb)}</div>
      <div class="stage__link-caption">atenuación del material</div>
      <div class="stage__link-line"></div>
    </div>

    <div class="stage stage--interior ${verdictClass}">
      <div class="stage__glyph" aria-hidden="true">▣</div>
      <div class="stage__label">Interior de la celda</div>
      <div class="stage__value mono">${fmtDbm(scenario.indoorDbm)}</div>
      <div class="stage__sub mono">${scenario.verdict.label}</div>
    </div>
  `;
}
