/**
 * Renderiza la tabla comparativa de las 5 tecnologías con el material,
 * grosor/apertura, distancia y EIRP actuales.
 */

function renderComparisonTable(state) {
  const table = document.getElementById("comparison-table");
  if (!table) return;

  const materialParamBase = state.materialId === "malla" ? state.materialParam / 1000 : state.materialParam;

  const rows = TECHNOLOGIES.map((tech) => {
    const scenario = computeScenario({
      freqMHz: tech.freqMHz,
      distanceM: state.distanceM,
      eirpDbm: state.eirpDbm,
      materialId: state.materialId,
      materialParam: materialParamBase,
    });
    return { tech, scenario };
  });

  const head = `
    <thead>
      <tr>
        <th>Tecnología</th>
        <th>Frecuencia</th>
        <th>FSPL</th>
        <th>Potencia en fachada</th>
        <th>Atenuación material</th>
        <th>Potencia interior</th>
        <th>Veredicto</th>
      </tr>
    </thead>
  `;

  const body = rows
    .map(({ tech, scenario }) => {
      const isActive = tech.id === state.techId;
      return `
        <tr class="${isActive ? "comparison-table__row--active" : ""}">
          <td>${tech.label}</td>
          <td class="mono">${tech.freqMHz} MHz</td>
          <td class="mono">${fmtDb(scenario.fsplDb)}</td>
          <td class="mono">${fmtDbm(scenario.facadeDbm)}</td>
          <td class="mono">&minus;${fmtDb(scenario.attenuationDb)}</td>
          <td class="mono">${fmtDbm(scenario.indoorDbm)}</td>
          <td><span class="table-verdict-chip verdict--${scenario.verdict.key}">${scenario.verdict.label}</span></td>
        </tr>
      `;
    })
    .join("");

  table.innerHTML = head + `<tbody>${body}</tbody>`;
}
