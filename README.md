# Simulador de Atenuación Pasiva de Señal Celular

Proyecto académico — curso de Telecomunicaciones, UMG (Universidad Mariano Gálvez), Guatemala.

Simulador web educativo que modela la **atenuación pasiva** de señal celular en
fachadas de centros penitenciarios mediante blindaje con materiales (ladrillo,
concreto reforzado, malla de acero). **No implementa ni diseña interferencia
activa (jamming)** — esa técnica está fuera del alcance del proyecto y de la ley.

SPA en HTML/CSS/JS puro, sin frameworks ni build step.

## Qué calcula

1. **FSPL** (free space path loss) entre la torre celular y la fachada:
   `FSPL(dB) = 20·log10(distancia_m) + 20·log10(frecuencia_MHz) − 27.55`
   `Potencia en fachada (dBm) = EIRP(dBm) − FSPL(dB)`

2. **Atenuación por material**:
   - Ladrillo / concreto reforzado: `atenuación = grosor(m) × coeficiente(dB/m)`,
     con coeficientes de referencia crecientes según la frecuencia.
   - Malla de acero (jaula de Faraday): criterio de frecuencia de corte tipo
     guía de onda, `atenuación = max(2, 20·log10(λ / (2·apertura_m)))`.

3. **Potencia dentro de la celda** = potencia en fachada − atenuación del material,
   clasificada como bloqueada (≤ −100 dBm), señal al límite (−100 a −95 dBm) o
   señal utilizable / riesgo de fuga (> −95 dBm).

Los coeficientes de materiales son aproximados, inspirados en literatura de
pérdida de penetración tipo COST-231 / ITU-R P.2040, y no están certificados.

## Estructura

```
index.html        Marcado y layout de la SPA
css/style.css      Tema oscuro/claro, estética de instrumento RF, responsive
js/physics.js      Motor de cálculo (FSPL, atenuación, clasificación) — puro, sin DOM
js/diagram.js      Diagrama del trayecto de la señal (torre → fachada → interior)
js/wall.js         Corte transversal del muro con textura por material
js/verdict.js      Panel de veredicto y escala de umbrales
js/table.js        Tabla comparativa de las 5 tecnologías
js/app.js          Estado, controles y orquestación de renders
```

## Ejecutar localmente

No requiere instalación ni dependencias. Basta con servir el directorio como
archivos estáticos, por ejemplo:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Deploy

Es un sitio 100% estático — no requiere configuración de build.

- **Vercel**: importar el repo, framework preset "Other", sin build command,
  output directory `.` (raíz).
- **Netlify**: importar el repo, build command vacío, publish directory `.`.
- **GitHub Pages**: activar Pages apuntando a la rama principal, directorio raíz.
