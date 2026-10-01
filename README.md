# Solar Plant Designer

A browser-based tool for **preliminary** design of rooftop, canopy and ground-mounted solar PV plants.
You locate the site, describe the structure, draw roofs and obstacles in a 2D CAD editor, lay out
modules automatically or by hand, inspect the design in 3D with a moving sun and live shadows, fetch
solar-resource data from a public provider, and get a month-by-month energy estimate with a full loss
breakdown, electrical sizing checks and a PDF report.

Every displayed value is labelled with its provenance: **USER INPUT**, **CALCULATED**, **ESTIMATED**,
**EXTERNAL DATA**, **ASSUMPTION** or **DEMO**. Demo data is never used silently.

> This application provides preliminary solar PV design and energy production estimates. Final
> structural, electrical, civil, mechanical, code-compliance, installation, shading, and energy-yield
> decisions must be verified using site-specific measurements and qualified professionals.

---

## Features

**Project management** — create, rename, save, duplicate, delete, import and export projects
(versioned JSON schema, stored in browser `localStorage`), undo/redo, unsaved-change indicator,
a demo project (industrial shed, Surat, Gujarat).

**Location** — place search (OpenStreetMap Nominatim), street/satellite map with click-to-pin,
manual coordinates, time zone and elevation lookup (Open-Meteo) with manual override, calculated
sunrise, sunset, solar noon and day length.

**Structure** — 22 structure types (residential/commercial/industrial roofs, warehouse, factory
shed, carport, parking canopy, ground mount, school, hospital, etc.; the registry in
`src/data/structureTypes.ts` is extensible). Flat, mono-pitch (shed), gable, canopy and ground
roof forms. Dimensions accept mm / cm / m / in / ft per field.

**2D CAD editor** — rectangular and polygon roofs, vertex editing, obstacles (water tanks, HVAC,
lift rooms, staircases, vents, skylights, parapets, chimneys, nearby structures, trees, exclusion
zones), move / resize / rotate / duplicate / delete, dimension lines, north arrow, scale bar,
setbacks (dashed), walkways, live shadow overlay, keyboard shortcuts.

**Panels** — library of generic module classes (explicitly *not* manufacturer datasheets) plus a
fully custom module (power, dimensions, efficiency, temperature coefficients, Voc/Vmp/Isc/Imp,
weight, bifacial flag).

**Layout** — geometry-based packing that respects boundaries, setbacks, obstacles and walkways;
row pitch from a shade-free time window, a ground-coverage ratio or a manual value; terrain slope
aware. **Auto layout** compares several configurations side by side (orientation × spacing rule)
with count, kWp, GCR and, when solar data is loaded, estimated energy — it does not declare a
"best" one. **Manual mode**: add, delete, move, rotate, duplicate, multi-select, lock, create rows,
with live statistics.

**3D** — Three.js (React Three Fiber) scene with building, roof planes, parapets, obstacles,
trees and instanced panels; orbit/pan/zoom, reset/top/front/side views, directional sun with
real-time shadows, sun path arc, **Play sun path** animation.

**Shading** — sun position for any date/time, morning/noon/afternoon presets, solstice/equinox
shortcuts, projected obstacle shadows on horizontal and sloped surfaces, seasonal shading table,
inter-row shading.

**Solar resource & energy** — provider abstraction with NASA POWER, PVGIS and NREL PVWatts, plus a
clearly labelled demo generator; monthly irradiation and temperature table; configurable losses;
monthly/annual energy, specific yield, performance ratio, capacity factor; loss waterfall.

**Charts (with tooltips, legends, units, CSV and PNG export)** — monthly irradiation (GHI vs plane
of array), monthly energy, peak sun hours, daily energy profile, cumulative generation, seasonal
generation, loss waterfall, sun path, shading by month, tilt sensitivity, surface/array breakdown.

**Electrical (optional)** — generic inverter library or custom inverter, string sizing with
cold-temperature Voc and hot-temperature Vmp checks, DC/AC ratio, MPPT and current checks,
suggested string configuration, with the notice *"This is a preliminary design calculation and
must be verified by a qualified electrical engineer."*

**Structural information** — roof area, panel + racking weight, distributed load estimate versus a
user-entered capacity, with the notice *"Structural suitability has not been verified."*

**Dashboard and reports** — dashboard grouped into project / system / resource / energy / design;
PDF report (project, location, structure, roof plan, layout, module and inverter data, irradiation,
monthly table, losses, sunlight table, assumptions, warnings, disclaimer; watermarked DEMO when demo
data is used); PNG plan export; CSV (monthly results, panel list); JSON project export.

**"How is this calculated?"** expanders next to every key figure explain the formula and inputs.

**Responsive UI** — desktop CAD layout (top bar, left section nav, centre canvas, right properties
and warnings panel), collapsible side panels on tablets, a step-by-step wizard on phones.

**Robustness** — Zod validation with inline messages, network timeouts, provider fallback chain,
analysis in a Web Worker (with main-thread fallback), keyboard accessibility and ARIA labels.

---

## Tech stack

| Area | Library |
| --- | --- |
| Framework | React 18 + TypeScript (strict) + Vite 5 |
| Styling | Tailwind CSS 3 (custom component classes; no UI kit) |
| State | Zustand (with undo/redo history) |
| Validation | Zod |
| Maps | Leaflet (OpenStreetMap tiles; Esri World Imagery for satellite) |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Charts | Recharts |
| PDF | jsPDF + jspdf-autotable |
| Geometry | Custom module (`src/calculations/geometry.ts`) — no Turf dependency |
| Tests | Vitest (unit), Playwright (end-to-end) |

Deliberate deviations from a "typical" stack: no shadcn/ui, React Hook Form or Turf.js. Forms are
small controlled components with Zod checks, and the geometry needed (polygon offset, clipping,
point-in-polygon, SAT overlap, hulls) is implemented and unit-tested directly.

---

## Installation

Requirements: **Node.js 18+** (tested with Node 22) and npm.

```bash
unzip solar-plant-designer.zip
cd solar-plant-designer
npm install
cp .env.example .env.local   # optional — the app works with no keys
```

## Development and build

```bash
npm run dev        # dev server at http://localhost:5173 (includes the PVGIS proxy)
npm run build      # type-check (tsc -b) + production build into dist/
npm run preview    # serve the production build at http://localhost:4173 (also proxies PVGIS)
npm run typecheck  # TypeScript only
```

---

## Environment variables

All are optional (see `.env.example`).

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_SOLAR_PROVIDER` | `nasa` | Primary provider: `nasa`, `pvgis` or `pvwatts`. |
| `VITE_NREL_API_KEY` | *(empty → `DEMO_KEY`)* | NREL developer key for PVWatts v8. `DEMO_KEY` is heavily rate-limited. |
| `VITE_PVGIS_BASE_URL` | `/api/pvgis` | Base URL for PVGIS. The default relies on the Vite proxy. |
| `VITE_SOLAR_TIMEOUT_MS` | `20000` | Timeout for external solar-data requests (ms). |

`VITE_*` values are embedded in the client bundle at build time. Do not put secrets you are not
prepared to expose in them; for production, proxy PVWatts through your own backend.

## API setup and provider configuration

| Provider | Data used | Key | Browser access |
| --- | --- | --- | --- |
| **NASA POWER** (default) | Long-term monthly climatology: `ALLSKY_SFC_SW_DWN`, `T2M`, `T2M_MAX`, `T2M_MIN` | None | Direct (CORS allowed) |
| **PVGIS** (EU JRC) | `MRcalc` monthly horizontal irradiation + temperature | None | **Needs a proxy** — PVGIS does not send CORS headers. `vite dev` / `vite preview` proxy `/api/pvgis` → `https://re.jrc.ec.europa.eu/api`. For static hosting, configure an equivalent reverse proxy and set `VITE_PVGIS_BASE_URL`. |
| **NREL PVWatts v8** | TMY hourly GHI and ambient temperature aggregated to months (the app runs its own PV model; PVWatts' AC output is not used) | NREL key recommended | Direct |
| **Demo** | Extraterrestrial irradiation × assumed clearness index 0.5; temperature 25 °C ± 5 °C | — | Local. Labelled **DEMO** everywhere and watermarked in reports. |

Behaviour: the selected provider is tried first, then the remaining real providers in turn. If
all fail, the app shows **"Solar resource data is currently unavailable."** with a retry button and
a **Use demo data** button. Demo data is only used after that explicit click.

To add a provider, implement `SolarDataProvider` (`src/services/solarDataProvider.ts`) and register
it in `src/services/providers.ts`.

---

## Testing

```bash
npm test                   # Vitest unit tests (85 tests, 11 files)
npm run test:e2e:install   # one-time: download Playwright's Chromium
npm run test:e2e           # builds, starts `vite preview`, runs 13 end-to-end flows
# or, with an existing Chrome/Chromium:
PW_CHROME_PATH=/path/to/chrome npm run test:e2e
```

Unit tests cover unit conversion, geometry, solar position (declination/equation-of-time ranges, noon elevation, day length, polar day/night),
irradiance transposition, row spacing and layout packing, gable surfaces, shadow projection on flat
and sloped planes, energy and loss chain, electrical string checks, validation, provider parsing and
schema migration, and the full analysis pipeline.

The end-to-end suite blocks all external network calls so it is deterministic, and covers: new
project + rename; coordinates → sun times; invalid-input rejection; structure type + unit
conversion; drawing a boundary; placing and editing an obstacle; panel selection + custom power;
auto layout and applying an option; manual add/delete + undo; 3D view + camera presets; provider
failure message and explicit demo opt-in; full analysis with 12-month table and annual total; save,
reload and CSV/JSON/PDF export.

---

## Project structure

```
src/
  calculations/     pure, unit-tested engineering maths
    units.ts  geometry.ts  solarPosition.ts  irradiance.ts  structure.ts
    panelLayout.ts  shading.ts  losses.ts  energy.ts  electrical.ts
    pipeline.ts (layout → shading → energy orchestration)  validation.ts
  components/       app shell: TopBar, LeftPanel, RightPanel, Toast, shared UI (ui.tsx)
  data/             panel, inverter, structure-type and obstacle-type registries
  features/
    project/ location/ structure/ roof-editor/ panel-library/ layout-engine/
    viewer3d/ shading/ electrical/ solar-analysis/ dashboard/ reports/
  hooks/            derived-state hooks
  services/         solar providers, geocoding, storage, worker client, exports, PDF report
  store/            Zustand project store (undo/redo, UI state)
  types/            Project schema (versioned) and analysis result types
  utils/            ids, project factory + demo project, static plan SVG, disclaimers
  workers/          analysis Web Worker
tests/
  unit/             Vitest
  e2e/              Playwright
public/             static assets
```

---

## Calculation methodology

Coordinate frame: plan x = east, y = north (metres); azimuth measured clockwise from north
(180° = due south).

1. **Solar position** — NOAA General Solar Position equations (Spencer 1971 Fourier series for
   equation of time and declination), with an approximate refraction correction; sunrise/sunset at −0.833° apparent altitude. Local time
   uses a fixed UTC offset.
2. **Typical-year weather** — provider monthly mean daily global horizontal irradiation (GHI) and
   temperature. Each month is represented by Klein's (1977) representative day.
3. **Diffuse split** — Erbs et al. (1982) daily diffuse fraction from the monthly clearness index.
4. **Hourly profile** — Collares-Pereira & Rabl (1979) for global and Liu & Jordan (1960) for
   diffuse, evaluated in 0.5 h steps and renormalised so each day sums exactly to the provider's
   daily total.
5. **Plane-of-array irradiance** — Hay-Davies anisotropic sky model, isotropic ground reflection
   with configurable albedo (default 0.2).
6. **Incidence-angle losses** — ASHRAE IAM with b₀ = 0.05.
7. **Cell temperature** — Faiman model; U = 29 W/m²K for open-rack mounting, 20 W/m²K for
   flush/roof-following. DC power uses the module's power temperature coefficient.
8. **Shading** — beam irradiance is reduced by the fraction of each module's footprint covered by
   projected obstacle shadows (flat and sloped receiver planes) and by inter-row shading, evaluated
   at each time step. Diffuse shading is not modelled.
9. **Row spacing (shade-free mode)** — pitch chosen so rows do not shade each other between the
   selected hours on the winter solstice, using the sun's profile angle and the terrain slope.
10. **Loss chain** (applied in order, each shown in the waterfall): nominal → shading → IAM →
    temperature → soiling (3 %) → mismatch (1.5 %) → DC wiring (1.5 %) → inverter efficiency (2 %)
    → inverter clipping → AC wiring (1 %) → availability (99 %) → other (1 %). Defaults are
    editable assumptions.
11. **KPIs** — specific yield = annual AC energy / DC kWp; performance ratio (IEC 61724 basis) =
    specific yield / annual plane-of-array irradiation (kWh/m² ÷ 1 kW/m²); capacity factor =
    annual AC energy / (kWp × 8760 h).
12. **Tilt suggestion** — Jacobson & Jadhav (2018) latitude fit, offered as a starting point only.
13. **Electrical** — string Voc at the site's minimum temperature, Vmp at maximum ambient + 30 °C
    cell rise, checked against inverter maximum DC voltage and MPPT window; DC/AC ratio and input
    current checks.

Daily charts interpolate between representative days and scale to monthly totals; they are a
typical-year profile, **not** measured daily data.

---

## Known limitations

- Energy is a **typical-year, representative-day model** from monthly climatology. It will not
  reproduce any specific year or short-term variability, and it is less accurate than an hourly
  TMY simulation (e.g. PVsyst, SAM).
- **Shading** covers beam irradiance only; diffuse/horizon shading and the electrical effect of
  partial shading (bypass diodes, string mismatch) are not modelled, so real shading losses can be
  higher.
- **Inverter clipping** is evaluated on representative-day profiles and is likely underestimated
  for high DC/AC ratios.
- **Bifacial gain** is not modelled (the bifacial flag is informational).
- **Daylight saving time** is not modelled; a fixed UTC offset is used.
- Panel and inverter libraries contain **generic class values**, not manufacturer datasheets.
  Use the custom entries with real datasheet values for any serious study.
- **PVGIS requires a proxy**; the included one only exists under `vite dev` / `vite preview`.
- PVWatts with `DEMO_KEY` is rate-limited and may fail.
- Some 2D shadow overlays are drawn on a horizontal reference plane; the energy calculation itself
  projects onto the actual sloped surfaces.
- **Structural suitability is not verified.** Load figures are simple distributed estimates.
- Satellite imagery (Esri World Imagery) and map tiles are third-party services; availability and
  licensing for your use case are not guaranteed.
- Projects live in the browser's `localStorage` only; clearing site data deletes them. Export to
  JSON for backup.
- Not a substitute for site surveys, code-compliance review or professional engineering sign-off.
