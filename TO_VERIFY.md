# TO_VERIFY.md

Items that require supplier confirmation or contain known data conflicts.
Specifications shown are indicative. Final specifications are confirmed with the supplier at order stage.
Products subject to controlled-substance regulations are not listed and are supplied only to licensed buyers, subject to applicable law.

---

## Spelling corrections applied (catalogue → corrected)

| Catalogue text | Corrected to | File |
|---|---|---|
| Amocicillin | **Amoxicillin** | apis.json |
| Levotaxacin | **Levofloxacin** | apis.json |
| Methormin HCl | **Metformin HCl** | apis.json |
| Vildaglitin | **Vildagliptin** | apis.json |
| Clobetasol Proponate | **Clobetasol Propionate** | apis.json |
| Levtirecetam | **Levetiracetam** | apis.json |
| Melendazole | **Mebendazole** | apis.json |
| Crospowidone | **Crospovidone** | excipients.json |

---

## Spec conflicts from spec/CoA sheets

1. **CRC 28 mm — overall weight range conflict**
   - Specification sheet (AO/QA/QC/SPC/02): 6.00–6.30 g
   - CoA: 6.00–6.60 g
   - Data uses: `6.30 ± 0.30 g` (midpoint of spec range, wider tolerance)
   - Action: Confirm with supplier which range is current.

2. **CRC 28 mm — EPE liner diameter tolerance conflict**
   - Specification sheet: ±0.20 mm
   - CoA: ±0.10 mm
   - Data uses: `±0.20 mm` (specification sheet value, conservative)
   - Action: Confirm with supplier which tolerance applies.

3. **Tamper-evident cap LDPE plug liner — plug OD range typo**
   - CoA prints plug OD range as "24.40–20.80 mm" (lower bound > upper bound — apparent typo)
   - Data uses: `24.40 ± 0.20 mm` (nominal value only)
   - Action: Supplier to confirm correct OD range.

4. **Tamper-evident cap — overall height conflict**
   - Specification sheet text: 23.35 mm
   - Drawing dimension: 20.8 mm
   - Data uses: `23.35 mm` (specification text)
   - Action: Confirm with supplier which dimension is current.

5. **15 mL measuring cup — spec title references brand name**
   - Specification document title includes a specific brand cap name.
   - Data describes cup generically as "28 mm plastic cap" variant.
   - Action: Confirm the cup fits all 28 mm plastic closures, not just one brand.

---

## Products requiring supplier confirmation (status: to-verify)

All products below have `"status": "to-verify"` in their JSON files.
Sizes, capacities and dimensions are from the 2026 catalogue and are indicative only.

### Injectables
- `glass-vials.json` — All 14 vial size variants (2R–100R); neck finish assignment per size, exact dimensions, packing quantities.
- `glass-ampoules.json` — All 10 variants; exact dimensions per size.
- `flip-off-seals.json` — All 4 neck sizes; exact dimensions and packing details.
- `rubber-stoppers.json` — All 8 variants; exact dimensions per compound and design.

### Bottles & Containers
- `glass-bottles.json` — All 6 capacity variants; exact dimensions, packing quantities.
- `pet-bottles.json` — All 7 capacity variants; neck finish per size, exact dimensions.
- `hdpe-containers.json` — All 8 capacity variants; neck finish per size, exact dimensions.
- `ldpe-containers.json` — All 9 capacity variants; exact dimensions.

### Closures & Caps
- `ropp-caps.json` — All 7 variants; exact dimensions per neck size.
- `plastic-screw-caps.json` — All 8 neck-size variants; with-liner and without-liner options, exact dimensions.
- `tamper-evident-caps.json` — 5 non-verified neck-size variants (18/20/24/33/38 mm).
- `crc-cap-28.json` — 4 non-verified neck-size variants (22/25/33/38 mm); specs for non-28 mm sizes.

### Blister Films & Foils
- `pvc-film.json` — Exact thickness options per colour; packing roll lengths.
- `pvc-pvdc-film.json` — PVDC coating weights (g/m²) per variant; available thickness combinations.
- `blister-lid-foil.json` — Roll lengths; lacquer type options.
- `tropical-foil.json` — Thickness; roll lengths; oPA gauge.
- `strip-foil.json` — Thickness range; roll widths and lengths.
- `cold-form-film.json` — Thickness; roll widths and lengths.
- `flexible-laminates.json` — All dimensions; minimum order quantities; printing options.

### Dosing & Dispensing
- `dropper-assemblies.json` — All 10 variants; teat material (natural rubber vs silicone); PP cap neck finish.
- `oral-dosing-syringes.json` — All 5 variants; graduation interval per size; FFS-sealed vs bulk pricing.
- `measuring-cups.json` — 4 non-verified capacity variants (5/10/30/60 mL).
- `dosing-spoons.json` — All 3 variants; exact dimensions.

### Raw Materials
- All items in `apis.json`, `excipients.json`, `vitamins-minerals.json`, `chemicals.json` — Available grades per item; minimum order quantities; lead times.

---

## Image placeholders

All `images` fields in product JSON files contain placeholder filenames (e.g. `injectables-glass-vials-1.webp`).
Images must be created or sourced and placed in `public/images/` before Stage 3 pages are built.
See `.kiro/steering/averon.md` section 11 for image generation prompt guidelines.
