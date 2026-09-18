/**
 * Motor de física — atenuación pasiva de señal celular.
 * Modelo educativo. Coeficientes aproximados (inspirados en literatura de
 * pérdida de penetración tipo COST-231 / ITU-R P.2040), no certificados.
 */

const SPEED_OF_LIGHT_M_S = 3e8;

const TECHNOLOGIES = [
  { id: "2g", label: "2G", freqMHz: 850 },
  { id: "3g", label: "3G", freqMHz: 1900 },
  { id: "4g", label: "4G", freqMHz: 2100 },
  { id: "5g-sub6", label: "5G Sub-6", freqMHz: 3500 },
  { id: "5g-mmwave", label: "5G mmWave", freqMHz: 28000 },
];

// Coeficientes de atenuación (dB/m) por material sólido, indexados por frecuencia (MHz).
const SOLID_MATERIAL_COEFFICIENTS_DB_PER_M = {
  ladrillo: { 850: 4, 1900: 6, 2100: 6.5, 3500: 9, 28000: 25 },
  concreto: { 850: 10, 1900: 14, 2100: 15, 3500: 20, 28000: 60 },
};

const MATERIALS = [
  { id: "ladrillo", label: "Ladrillo", kind: "solid" },
  { id: "concreto", label: "Concreto reforzado", kind: "solid" },
  { id: "malla", label: "Malla de acero (jaula de Faraday)", kind: "mesh" },
];

const VERDICT_THRESHOLDS_DBM = { blocked: -100, marginal: -95 };

/**
 * FSPL (Free Space Path Loss) en dB.
 * FSPL(dB) = 20*log10(d_m) + 20*log10(f_MHz) - 27.55
 */
function freeSpacePathLossDb(distanceM, freqMHz) {
  return 20 * Math.log10(distanceM) + 20 * Math.log10(freqMHz) - 27.55;
}

/** Potencia en la fachada (dBm) = EIRP(dBm) - FSPL(dB) */
function facadePowerDbm(eirpDbm, fsplDb) {
  return eirpDbm - fsplDb;
}

/**
 * Atenuación por material sólido (ladrillo/concreto): grosor(m) * coeficiente(dB/m).
 * El coeficiente se interpola linealmente entre los puntos de referencia por frecuencia.
 */
function solidMaterialAttenuationDb(materialId, thicknessM, freqMHz) {
  const coeff = interpolateCoefficient(SOLID_MATERIAL_COEFFICIENTS_DB_PER_M[materialId], freqMHz);
  return coeff * thicknessM;
}

/**
 * Atenuación por malla de acero: criterio de frecuencia de corte tipo guía de onda.
 * atenuacion(dB) = max(2, 20*log10(lambda / (2*apertura_m)))
 * A menor apertura respecto a la longitud de onda, mayor el bloqueo.
 * Frecuencias bajas (lambda grande) requieren apertura más fina para bloquearse.
 */
function meshAttenuationDb(apertureM, freqMHz) {
  const freqHz = freqMHz * 1e6;
  const lambdaM = SPEED_OF_LIGHT_M_S / freqHz;
  const ratio = lambdaM / (2 * apertureM);
  return Math.max(2, 20 * Math.log10(ratio));
}

/** Interpola linealmente el coeficiente dB/m para una frecuencia dada a partir de una tabla {freqMHz: coeff}. */
function interpolateCoefficient(table, freqMHz) {
  const points = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (freqMHz <= points[0]) return table[points[0]];
  if (freqMHz >= points[points.length - 1]) return table[points[points.length - 1]];
  for (let i = 0; i < points.length - 1; i++) {
    const lo = points[i], hi = points[i + 1];
    if (freqMHz >= lo && freqMHz <= hi) {
      const t = (freqMHz - lo) / (hi - lo);
      return table[lo] + t * (table[hi] - table[lo]);
    }
  }
  return table[points[points.length - 1]];
}

/** Atenuación total del material (dB) para el material/parametro/frecuencia dados. */
function materialAttenuationDb(materialId, param, freqMHz) {
  if (materialId === "malla") return meshAttenuationDb(param, freqMHz);
  return solidMaterialAttenuationDb(materialId, param, freqMHz);
}

/** Clasifica la potencia interior (dBm) según los umbrales del proyecto. */
function classifySignal(indoorPowerDbm) {
  if (indoorPowerDbm <= VERDICT_THRESHOLDS_DBM.blocked) {
    return { key: "blocked", label: "Bloqueada" };
  }
  if (indoorPowerDbm <= VERDICT_THRESHOLDS_DBM.marginal) {
    return { key: "marginal", label: "Señal al límite" };
  }
  return { key: "leak", label: "Señal utilizable / riesgo de fuga" };
}

/**
 * Calcula el escenario completo para una tecnología, material, parámetro de
 * material, distancia y EIRP dados.
 */
function computeScenario({ freqMHz, distanceM, eirpDbm, materialId, materialParam }) {
  const fsplDb = freeSpacePathLossDb(distanceM, freqMHz);
  const facadeDbm = facadePowerDbm(eirpDbm, fsplDb);
  const attenuationDb = materialAttenuationDb(materialId, materialParam, freqMHz);
  const indoorDbm = facadeDbm - attenuationDb;
  const verdict = classifySignal(indoorDbm);
  return { freqMHz, distanceM, eirpDbm, fsplDb, facadeDbm, attenuationDb, indoorDbm, verdict };
}
