# Implementation Plan: astro-site-scaffold

## Overview

Scaffold the complete Astro 5 static site structure for Averon Overseas (Stage 1). This plan converts the design document into a dependency-ordered series of coding tasks. Each task builds on the previous one and ends with all code wired together. No page content is written — only structural foundations.

Implementation language: **TypeScript / Astro** (static output, zero client JS).

---

## Tasks

- [x] 1. Initialise Astro project files
  - Create `package.json` with `astro` and `@astrojs/sitemap` as exact-pinned `devDependencies` (no `^` or `~`), plus `@fontsource/young-serif`, `@fontsource/hanken-grotesk`, `@fontsource/jetbrains-mono` as `devDependencies`, and `vitest` + `fast-check` for testing
  - Create `astro.config.mjs` reading `SITE_URL` from `process.env` (default `'https://averonoverseas.github.io'`), setting `site`, `base: '/'`, `output: 'static'`, and registering `@astrojs/sitemap`
  - Create `tsconfig.json` extending `"astro/tsconfigs/strict"`
  - Create `.gitignore` excluding `dist/`, `node_modules/`, `.env`
  - Create `.env.example` with `SITE_URL=https://averonoverseas.github.io` as the only entry
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

  - [x] 1.7 Add `"test"` script to `package.json`
    - Add `"test": "vitest --run"` to the `scripts` section of `package.json` so that `npm test` runs the full suite once (no watch mode), consistent with CI usage
    - _Requirements: (testing infrastructure)_

- [x] 2. Set up design token CSS and self-hosted fonts
  - [x] 2.1 Copy WOFF2 font files to `public/fonts/`
    - Copy `young-serif-latin-400-normal.woff2` from `node_modules/@fontsource/young-serif/files/`
    - Copy `hanken-grotesk-latin-400-normal.woff2`, `hanken-grotesk-latin-500-normal.woff2`, `hanken-grotesk-latin-700-normal.woff2` from `node_modules/@fontsource/hanken-grotesk/files/`
    - Copy `jetbrains-mono-latin-400-normal.woff2`, `jetbrains-mono-latin-500-normal.woff2` from `node_modules/@fontsource/jetbrains-mono/files/`
    - Six files total in `public/fonts/`
    - _Requirements: 3.1_

  - [x] 2.2 Create `src/styles/tokens.css`
    - Define all `:root` colour tokens: `--paper: #E9EFF4`, `--panel: #D6E1EA`, `--ink: #12263F`, `--accent: #E58C6B`, `--muted: #566577`, `--rule: #9FB1C2`, `--night: #12263F`, `--on-night: #EAF0F6`
    - Define font-stack tokens: `--serif` (Young Serif → Georgia → serif), `--sans` (Hanken Grotesk → system-ui → sans-serif), `--mono` (JetBrains Mono → ui-monospace → monospace)
    - Add `color-scheme: light` on `:root`
    - Add `@media (prefers-color-scheme: dark)` block with `:root:not([data-theme="light"])` selector applying dark overrides: `--paper: #0D1826`, `--panel: #16273B`, `--ink: #E6EDF4`, `--muted: #93A4B7`, `--rule: #34495F`, `--night: #16273B`, `color-scheme: dark`
    - Add `[data-theme="dark"]` rule with identical dark overrides and `color-scheme: dark`
    - Add `[data-theme="light"]` rule re-applying all light-mode values
    - Add `@media (prefers-reduced-motion: reduce)` setting `transition: none !important` and `scroll-behavior: auto !important` on `*`
    - Add six `@font-face` rules (one per weight variant), each with `font-display: swap` and a `src` path under `/fonts/`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.2, 3.3_

- [x] 3. Create TypeScript data types and i18n skeleton
  - [x] 3.1 Create `src/data/types.ts`
    - Export `Category` interface: `slug`, `name`, `summary` (max 160), `order` (number), `image` (`.webp`/`.avif`), `seoTitle` (max 60), `seoDescription` (max 155)
    - Export `ProductSpec` interface: `key`, `value`, `tol?`, `unit`
    - Export `ProductVariant` interface: `label`, `attrs: Record<string, string | number>`
    - Export `Product` interface with all required fields from Requirement 8.3 including `status: 'verified' | 'to-verify'`
    - _Requirements: 8.4_

  - [x] 3.2 Create i18n locale JSON files
    - Create `src/i18n/en.json` with all 19 required keys: `nav.products`, `nav.specifications`, `nav.howWeSource`, `nav.about`, `nav.contact`, `nav.requestQuote`, `footer.companyName`, `footer.description`, `footer.address`, `footer.email`, `footer.phone1`, `footer.phone2`, `footer.links.products`, `footer.links.privacy`, `footer.links.sitemap`, `lang.en`, `lang.hi`, `lang.ar`, `lang.fr`, `lang.es` — all populated with English values per Requirement 6.2
    - Create `src/i18n/hi.json`, `src/i18n/ar.json`, `src/i18n/fr.json`, `src/i18n/es.json` — identical key set, all values as empty string `""`
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 3.3 Create `src/i18n/index.ts` — `useTranslations()` utility
    - Define `Locale` type and statically import all five locale JSON files (no dynamic `import()`)
    - Implement `useTranslations(lang: string): (key: string) => string` with three-step fallback: locale value → `en` value → raw key string
    - Validate `lang` against the five supported codes; fall back to `'en'` for any unrecognised string
    - _Requirements: 7.4, 7.5_

- [x] 4. Create seed data JSON files
  - [x] 4.1 Create six category JSON files in `src/data/categories/`
    - `injectables.json` (order: 1), `bottles-containers.json` (order: 2), `closures-caps.json` (order: 3), `blister-films-foils.json` (order: 4), `dosing-dispensing.json` (order: 5), `raw-materials.json` (order: 6)
    - Each file must include all required fields: `slug`, `name`, `summary` (≤160 chars), `order`, `image` (`.webp` filename), `seoTitle` (≤60 chars), `seoDescription` (≤155 chars)
    - Use placeholder image filenames following the `category-hero.webp` naming convention
    - _Requirements: 8.1, 8.2_

  - [x] 4.2 Create seed product JSON file `src/data/products/crc-cap-28.json`
    - Populate all required fields: `slug: "crc-cap-28"`, `category: "closures-caps"`, `name`, `summary`, `materials`, `variants`, `specs` (Overall height, Outer diameter, Weight), `sizeRange`, `colours`, `standards`, `docs`, `images`, `status: "verified"`, `tags`
    - Use spec values from the design document (24.30 mm height, 34.40 mm OD, 6.30 g weight, all with ±0.20 tol)
    - _Requirements: 8.1, 8.3_

  - [x] 4.3 Create `src/data/index.ts` — data access helpers
    - Implement `getCategories(): Promise<Category[]>` using `import.meta.glob('…/categories/*.json', { eager: true })`, returning results sorted ascending by `order`
    - Implement `getProducts(categorySlug?: string): Promise<Product[]>` using `import.meta.glob('…/products/*.json', { eager: true })`, returning all products when no argument is given, filtered products when a matching slug is given, and `[]` for an unrecognised slug
    - Note: `src/data/index.ts` uses `import.meta.glob` which is a Vite/Astro-only API; TypeScript will report errors in a plain TS context — this is expected and the file works correctly at Astro build time
    - _Requirements: 8.5_

- [x] 5. Create `formatSpec()` helper and unit tests
  - [x] 5.1 Create `src/utils/formatSpec.ts`
    - Export `FormatSpecOptions` interface: `value: string | number`, `unit?: string`, `tol?: string | number`, `isDiameter?: boolean` (default `false`)
    - Export `formatSpec(opts: FormatSpecOptions): string` implementing the 8-cell output matrix from the design (U+2009 thin space between value and unit, `Ø\u2009` prefix when `isDiameter` is true, `" ± "` separator for tolerances)
    - Convert numeric `value` via `.toString()` with no rounding or padding
    - Render `unit` exactly as provided (case-preserving, so `"mL"` stays `"mL"`)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 5.2 Create `src/utils/formatSpec.test.ts` with exactly 8 example-based unit tests
    - (a) `formatSpec({ value: '24.30', unit: 'mm' })` → `"24.30\u2009mm"`
    - (b) `formatSpec({ value: '24.30', tol: '0.20', unit: 'mm' })` → `"24.30 ± 0.20\u2009mm"`
    - (c) `formatSpec({ value: '34.40', unit: 'mm', isDiameter: true })` → `"Ø\u200934.40\u2009mm"`
    - (d) `formatSpec({ value: '25.70', unit: 'mL' })` → `"25.70\u2009mL"`
    - (e) `formatSpec({ value: '100' })` → `"100"`
    - (f) `formatSpec({ value: '10', tol: '0', unit: 'mm' })` → `"10 ± 0\u2009mm"`
    - (g) `formatSpec({ value: '10', tol: '0.5' })` → `"10 ± 0.5"`
    - (h) `formatSpec({ value: '34.40', tol: '0.20', isDiameter: true })` → `"Ø\u200934.40 ± 0.20"`
    - Use `vitest` (`import { describe, it, expect } from 'vitest'`); no property-based tests in this file
    - _Requirements: 9.7_

- [x] 6. Checkpoint — run formatSpec unit tests
  - Run `npx vitest --run src/utils/formatSpec.test.ts` and confirm all 8 tests pass. Ask the user if any test fails unexpectedly.

- [x] 7. Create `robots.txt` Astro endpoint
  - [x] 7.1 Extract `buildRobotsTxt(siteUrl: string): string` as a named export in `src/pages/robots.txt.ts`
    - Build the robots.txt string: wildcard stanza (`User-agent: *` / `Allow: /`), then individual stanzas for `Googlebot`, `Bingbot`, `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `CCBot` (each with `Allow: /`), then `Sitemap: <siteUrl>/sitemap-index.xml` (trailing slash stripped from `siteUrl`)
    - No `Disallow` directive with a non-empty value anywhere in the output
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 10.4_

  - [x] 7.2 Wire `buildRobotsTxt` into the Astro `GET` API route in the same file
    - Export `export const GET: APIRoute` using `({ site }) => new Response(buildRobotsTxt(...), { headers: { 'Content-Type': 'text/plain' } })`
    - Derive site URL from Astro's `site` context value (`site?.toString().replace(/\/$/, '') ?? ''`)
    - _Requirements: 10.4, 11.1_

- [x] 8. Create layout and component files
  - [x] 8.1 Create `src/components/Footer.astro`
    - Accept `lang: string` prop (default `'en'`)
    - Render `<footer role="contentinfo">` with `background: var(--night); color: var(--on-night)` and `padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px))`
    - Display company name, description, address, email (`<a href="mailto:…">`), and two phone numbers (`<a href="tel:…">`) using `useTranslations(lang)` for all string values
    - Render three secondary nav links via i18n keys: Products → `/products/`, Privacy Policy → `/privacy/`, Sitemap → `/sitemap.xml`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.2 Create `src/components/Header.astro`
    - Accept `lang: string` prop (default `'en'`)
    - Render `<header role="banner">` with `position: sticky; top: 0; z-index: 20; background: var(--paper); border-bottom: 1px solid var(--rule)`
    - Wordmark: `<a href="/">` containing `<span>AVERON OVERSEAS</span>` (Young Serif) and `<span>Enable Better Reach</span>` (Hanken Grotesk)
    - `<nav aria-label="Main">` with five links using `useTranslations(lang)` keys (`nav.products`, `nav.specifications`, `nav.howWeSource`, `nav.about`, `nav.contact`)
    - Language `<select aria-label="Language">` listing EN (enabled), हिन्दी, العربية, Français, Español (all non-English `disabled`)
    - "Request a quote" `<a href="/rfq/">` styled as primary button (filled `var(--ink)` background)
    - At ≤860 px: hide `<nav>` and desktop CTA; show `<details><summary aria-label="Menu">` with the same links
    - Inline `<script>` (≤200 bytes) that sets `open = false` on the `<details>` element when any child `<a>` is clicked
    - All label strings from `useTranslations(lang)` — no hard-coded navigation text
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x] 8.3 Create `src/layouts/Base.astro`
    - Accept props: `title`, `description`, `canonicalURL`, `ogImage?`, `lang?` (default `'en'`), `dir?` (default `'ltr'`), `alternates?`
    - Auto-detect RTL: if `lang` base subtag is `ar`, `he`, `fa`, or `ur`, force `dir="rtl"` on `<html>` regardless of the `dir` prop — extract this logic as an exported pure helper `resolveDir(lang: string, dir: string): string` for testability
    - Emit `<head>` in required order: charset → viewport → `<link rel="stylesheet" href={tokens.css}>` (first stylesheet) → title → description → canonical → OG tags (omit `og:image` when `ogImage` is absent) → hreflang alternates → Organization JSON-LD `<script>` → named slot `jsonld`
    - Organization JSON-LD: `@type: "Organization"`, `name: "Averon Overseas"`, `email`, both telephone numbers, `address` object, `url` from `import.meta.env.SITE`
    - `<body>`: skip link (`<a href="#main-content" class="skip-link">`) → `<Header lang={lang} />` → `<main id="main-content"><slot /></main>` → `<Footer lang={lang} />`
    - Skip link CSS: `position: absolute; left: -9999px` at rest, visible on `:focus`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 3.4_

- [x] 9. Create GitHub Actions deployment workflow
  - Create `.github/workflows/deploy.yml` with:
    - `on: push: branches: [main]` and `workflow_dispatch`
    - `concurrency: group: pages, cancel-in-progress: true`
    - `permissions: contents: read, pages: write, id-token: write`
    - `build` job using `actions/checkout@v4` and `withastro/action@v3` with `node-version: 20`
    - `deploy` job using `actions/deploy-pages@v4`, `needs: build`, environment `github-pages`
  - _Requirements: 1.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x] 10. Checkpoint — verify project builds
  - Run `npm install` then `npm run build` and confirm `dist/` contains HTML, `sitemap-index.xml`, `sitemap-0.xml`, and `robots.txt`. Ask the user if any build error appears.

- [x] 11.1 Add Vitest configuration
  - `vitest.config.ts` exists with `test.include` covering `src/**/*.test.ts`
  - Confirm `vitest` and `fast-check` are already in `devDependencies` from task 1
  - Also complete sub-task 1.7: add `"test": "vitest --run"` to `package.json` scripts if not already present
  - _Requirements: (testing infrastructure)_

- [ ]* 11.2 Write property tests for `useTranslations` fallback chain — `src/i18n/index.test.ts`
  - **Property 4: `useTranslations` fallback chain** — use `fc.constantFrom(...supportedLocales)` and `fc.string()` for key; for each (locale, key) pair assert the three-step rule: locale value → `en` value → raw key
  - **Property 5: Invalid locale falls back to English** — use `fc.string()` filtered to exclude the five valid codes; assert `useTranslations(invalid)(k) === useTranslations('en')(k)` for all keys
  - Import `useTranslations` from `../../src/i18n/index.ts`
  - **Validates: Requirements 7.4, 7.5**

- [ ]* 11.3 Write property test for non-English i18n key parity — `src/i18n/index.test.ts`
  - **Property 6: Non-English i18n key parity** — for each of `hi`, `ar`, `fr`, `es`: read the locale file, assert key set exactly equals `en.json` key set and all values are `""`
  - **Validates: Requirements 7.3**

- [ ]* 11.4 Write property tests for data helpers — `src/data/index.test.ts`
  - **Property 9: `getCategories()` returns ascending-sorted results** — generate arbitrary arrays of category-shaped objects with distinct `order` values using `fc.array(fc.record({...}))`, pass to the extracted sort function, assert strict ascending order
  - **Property 10: `getProducts()` filter correctness** — generate arbitrary product arrays and slug strings; assert (a) no-arg returns all, (b) matching slug returns exactly those products, (c) unknown slug returns `[]`
  - **Validates: Requirements 8.5**

- [ ]* 11.5 Write property tests for data schema conformance — `src/data/schema.test.ts`
  - **Property 7: Category schema conformance** — iterate all files in `src/data/categories/`; for each assert all required fields present with correct types, `summary` ≤160, `seoTitle` ≤60, `seoDescription` ≤155, `image` ends in `.webp`/`.avif`, `order` values unique across all files
  - **Property 8: Product schema conformance** — iterate all files in `src/data/products/`; for each assert required fields, `summary` ≤160, `status` in `['verified','to-verify']`, all array fields are arrays, each spec entry has `key`/`value`/`unit`, each variant has `label` and `attrs`
  - **Validates: Requirements 8.2, 8.3**

- [ ]* 11.6 Write property test for `buildRobotsTxt()` — `src/utils/robots.test.ts`
  - **Property 11: `buildRobotsTxt()` structural invariants** — use `fc.webUrl()` (or `fc.string()` filtered to URL-like values) to generate site URLs; for each assert: (a) starts with `User-agent: *` stanza containing `Allow: /`, (b) individual stanzas for all 7 named bots each with `Allow: /`, (c) `Sitemap:` line equals `<url>/sitemap-index.xml` with trailing slash stripped, (d) no `Disallow:` line with a non-empty path
  - Import `buildRobotsTxt` from `../../src/pages/robots.txt.ts`
  - **Validates: Requirements 10.4, 11.2, 11.3, 11.4, 11.5**

- [ ]* 11.7 Write property tests for RTL auto-detection — `src/layouts/base.test.ts`
  - **Property 3: RTL auto-detection** — import the exported `resolveDir(lang: string, dir: string): string` pure helper from `../../src/layouts/Base.astro`; generate lang strings with base subtag in `['ar','he','fa','ur']` (with optional region suffix e.g. `ar-SA`) and assert result is `'rtl'`; generate arbitrary strings whose base subtag is not in that set and assert result is `'ltr'`
  - Note: `resolveDir` is already exported from `src/layouts/Base.astro` — import directly from there, no re-export needed
  - **Validates: Requirements 4.9**

- [ ] 12. Checkpoint — run full test suite
  - Run `npx vitest --run` and confirm all tests pass (8 formatSpec unit tests + all property tests). Ask the user if any failures appear.

- [x] 13. Integration smoke test
  - [x] 13.1 Create `scripts/check-build.ts` (or `check-build.mjs`) post-build verification script
    - After `npm run build`, verify: `dist/sitemap-index.xml` exists, `dist/sitemap-0.xml` exists, `dist/robots.txt` contains `Sitemap:` with the `SITE_URL` value, all six WOFF2 font files exist under `dist/fonts/`
    - Exit with a non-zero code and a clear message if any check fails
    - _Requirements: 1.4, 3.1, 10.2, 11.1_

  - [ ]* 13.2 Run integration smoke test
    - Execute `npm run build && npx tsx scripts/check-build.ts` (or equivalent) and confirm all post-build checks pass
    - _Requirements: 1.4, 10.2, 10.3_

- [x] 14. Final checkpoint — full build and test pass
  - Run `npm run build` and `npx vitest --run` one final time. Confirm `dist/` output is complete, all unit and property tests pass, and the integration smoke test script exits 0. Ask the user if anything needs attention before committing.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP (all structural code is complete without them)
- Each task references specific requirements for full traceability
- Font copy (task 2.1) must run after `npm install`; it relies on `node_modules/@fontsource/*/files/*.woff2` being present
- The `<details>` mobile nav requires zero JS bundle — only a tiny inline `<script>` closing the element on link click
- `buildRobotsTxt` is exported as a named function so it can be unit-tested independently of the Astro endpoint
- The RTL logic in `Base.astro` (task 8.3) is exported as a pure function `resolveDir(lang, dir)` to make Property 3 (task 11.7) testable without rendering Astro components
- Property tests run a minimum of 100 iterations each (fast-check default)
- `vitest --run` executes tests once (no watch mode); use this in CI and for manual verification
- `src/data/index.ts` uses `import.meta.glob` which is Vite/Astro-only — TypeScript will flag errors in a plain TS context; this is expected and the file works correctly at build time

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.7", "3.1", "3.2"] },
    { "id": 1, "tasks": ["2.1", "3.3", "4.1", "4.2"] },
    { "id": 2, "tasks": ["2.2", "4.3", "5.1"] },
    { "id": 3, "tasks": ["5.2", "7.1", "8.1", "11.1"] },
    { "id": 4, "tasks": ["7.2", "8.2"] },
    { "id": 5, "tasks": ["8.3"] },
    { "id": 6, "tasks": ["9"] },
    { "id": 7, "tasks": ["11.2", "11.3", "11.4", "11.5", "11.6", "11.7"] },
    { "id": 8, "tasks": ["13.1"] },
    { "id": 9, "tasks": ["13.2"] }
  ]
}
```
