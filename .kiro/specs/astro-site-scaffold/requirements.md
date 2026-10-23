# Requirements Document

## Introduction

Stage 1 of the Averon Overseas website build. This stage scaffolds the Astro project: project configuration, layout component with header and footer, design-token CSS, self-hosted fonts, an i18n string skeleton, a generic JSON data schema for categories and products, a `formatSpec()` notation helper, `@astrojs/sitemap` integration, `robots.txt`, and a GitHub Actions workflow for GitHub Pages deployment. No page content is written in this stage.

## Glossary

- **Astro_Site**: The static Astro project being scaffolded at the repository root.
- **Layout**: The `src/layouts/Base.astro` component that wraps every page with a shared `<head>`, header, footer, and skip link.
- **Header**: The sticky top navigation bar containing the wordmark, primary nav links, language selector, and "Request a quote" call-to-action button.
- **Footer**: The bottom section containing company name, contact details, and secondary navigation links.
- **Token_CSS**: The file `src/styles/tokens.css` defining all CSS custom properties for colour, typography, and spacing, with light and dark mode variants.
- **Design_Tokens**: The set of CSS custom properties: `--paper`, `--panel`, `--ink`, `--accent`, `--muted`, `--rule`, `--night`, `--on-night`, `--serif`, `--sans`, `--mono`.
- **Font_Files**: Self-hosted WOFF2 font files for Young Serif, Hanken Grotesk, and JetBrains Mono stored under `public/fonts/`.
- **i18n_Skeleton**: The directory `src/i18n/` containing one JSON file per supported locale with all UI string keys populated in English and left as empty strings in other locales.
- **Category_Schema**: The JSON structure for a product category file at `src/data/categories/<slug>.json`.
- **Product_Schema**: The JSON structure for a product file at `src/data/products/<slug>.json`.
- **formatSpec**: The TypeScript helper function exported from `src/utils/formatSpec.ts` that formats numeric specification values according to the site notation rules.
- **Sitemap_Integration**: The `@astrojs/sitemap` Astro integration that generates `sitemap-index.xml` and `sitemap-0.xml` at build time.
- **Robots_File**: The static file `public/robots.txt` that declares crawl permissions and points to the sitemap.
- **GH_Actions_Workflow**: The GitHub Actions YAML file at `.github/workflows/deploy.yml` that builds the Astro site and deploys it to GitHub Pages using `withastro/action`.
- **Locale**: A BCP 47 language tag: `en` (primary), `hi`, `ar`, `fr`, `es`.

---

## Requirements

### Requirement 1: Astro Project Initialisation

**User Story:** As a developer, I want an Astro project configured for static GitHub Pages output, so that I can build and deploy the site without manual configuration.

#### Acceptance Criteria

1. THE Astro_Site SHALL include a `package.json` with `astro` and `@astrojs/sitemap` listed as `devDependencies` at exact bare semver version pins (e.g. `"astro": "5.x.x"` with no `^` or `~` prefix).
2. THE Astro_Site SHALL include an `astro.config.mjs` that reads `SITE_URL` from the environment (defaulting to `'https://averonoverseas.github.io'` when the variable is absent), sets `site` to that value, sets `output: 'static'`, `base: '/'`, and registers the `@astrojs/sitemap` integration. No other file SHALL hard-code the production URL; all references to the canonical origin (sitemap, robots.txt, canonical tags) SHALL derive from this single value so that switching to `www.averonoverseas.com` later requires changing only `SITE_URL`.
3. THE Astro_Site SHALL include a `tsconfig.json` extending Astro's strict base config (`"extends": "astro/tsconfigs/strict"`).
4. WHEN `npm run build` is executed, THE Astro_Site SHALL emit HTML, CSS, JS, images, `sitemap-index.xml`, `sitemap-0.xml`, and `robots.txt` into the `dist/` directory.
5. THE Astro_Site SHALL include a `.gitignore` that excludes `dist/`, `node_modules/`, and `.env`.
6. THE Astro_Site SHALL include a `.env.example` file containing the line `SITE_URL=https://averonoverseas.github.io` as the only required variable, with no real secret values.
7. THE Astro_Site SHALL include a GitHub Actions workflow file at `.github/workflows/deploy.yml` so that deployment requires no manual CLI steps after pushing to `main`.

---

### Requirement 2: Design Token CSS

**User Story:** As a developer, I want all visual design values defined as CSS custom properties in one file, so that every component consumes tokens and the design is consistent without a CSS framework.

#### Acceptance Criteria

1. THE Token_CSS SHALL define the following custom properties on `:root`: `--paper: #E9EFF4`, `--panel: #D6E1EA`, `--ink: #12263F`, `--accent: #E58C6B`, `--muted: #566577`, `--rule: #9FB1C2`, `--night: #12263F`, `--on-night: #EAF0F6`.
2. THE Token_CSS SHALL define font-stack custom properties: `--serif` referencing Young Serif with Georgia and serif fallbacks, `--sans` referencing Hanken Grotesk with system-ui and sans-serif fallbacks, `--mono` referencing JetBrains Mono with ui-monospace and monospace fallbacks.
3. IF `prefers-color-scheme` is `dark` AND the `<html>` element's `data-theme` attribute is not set to `"light"`, THE Token_CSS SHALL override: `--paper: #0D1826`, `--panel: #16273B`, `--ink: #E6EDF4`, `--muted: #93A4B7`, `--rule: #34495F`, `--night: #16273B`. The tokens `--accent` and `--on-night` SHALL remain at their light-mode `:root` values in dark mode.
4. WHERE `data-theme="dark"` is set on the `<html>` element, THE Token_CSS SHALL apply the same dark-mode overrides (`--paper: #0D1826`, `--panel: #16273B`, `--ink: #E6EDF4`, `--muted: #93A4B7`, `--rule: #34495F`, `--night: #16273B`) regardless of system preference. `--accent` and `--on-night` SHALL remain at their light-mode values.
5. WHERE `data-theme="light"` is set on the `<html>` element, THE Token_CSS SHALL preserve all light-mode token values regardless of `prefers-color-scheme`.
6. THE Token_CSS SHALL set `color-scheme: light` on `:root`. Inside both the `prefers-color-scheme: dark` media query block and the `[data-theme="dark"]` rule, THE Token_CSS SHALL set `color-scheme: dark`.
7. THE Token_CSS SHALL include a `@media (prefers-reduced-motion: reduce)` rule that sets `transition: none !important` and `scroll-behavior: auto !important` on `*`.

---

### Requirement 3: Self-Hosted Fonts

**User Story:** As a developer, I want the three required typefaces served from the site's own origin, so that there are no external font requests and `font-display: swap` is applied.

#### Acceptance Criteria

1. THE Astro_Site SHALL install `@fontsource/young-serif`, `@fontsource/hanken-grotesk`, and `@fontsource/jetbrains-mono` as `devDependencies`, then copy the latin-subset WOFF2 files for the required weight variants — Young Serif (400), Hanken Grotesk (400, 500, 700), JetBrains Mono (400, 500) — into `public/fonts/`. Each file SHALL return HTTP 200 when served from the built site. No font files SHALL be downloaded manually from the web.
2. THE Token_CSS SHALL declare one `@font-face` rule per weight variant listed in criterion 1 (six rules total), each setting `font-display: swap` and a `src` referencing the corresponding `/fonts/` path.
3. THE Token_CSS SHALL NOT contain any CSS `@import` or `url()` referencing `fonts.googleapis.com` or any other external font host, and the Layout SHALL NOT include a `<link>` to any external font CDN.
4. WHEN a page is served, THE Layout SHALL include Token_CSS as the first `<link rel="stylesheet">` element in `<head>`, so that `@font-face` declarations are parsed before any other stylesheet.

---

### Requirement 4: Base Layout Component

**User Story:** As a developer, I want a single layout component that wraps every page with consistent head metadata, skip navigation, header, and footer, so that all pages share the same shell without duplication.

#### Acceptance Criteria

1. THE Layout SHALL accept props: `title` (string, required, ≤60 characters), `description` (string, required), `canonicalURL` (string, required), `ogImage` (string, optional), `lang` (string, default `'en'`), `dir` (string, default `'ltr'`), and `alternates` (array of `{ lang: string, url: string }`, optional, for `<link rel="alternate" hreflang>` tags).
2. THE Layout SHALL render a `<!DOCTYPE html>` document with `lang` and `dir` attributes set from props.
3. THE Layout SHALL include in `<head>`: `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<meta name="description">` with the `description` prop, `<title>` with the `title` prop, `<link rel="canonical">` with the `canonicalURL` prop, Open Graph tags `og:title`, `og:description`, `og:url`, and `og:image` (omitted when `ogImage` is not provided), and one `<link rel="alternate" hreflang>` per entry in `alternates`.
4. THE Layout SHALL render a skip-navigation link as the first focusable element in `<body>` that links to `#main-content`; the link SHALL be visually hidden when not focused and visible when focused (satisfying WCAG 2.4.1 bypass-blocks).
5. THE Layout SHALL render the Header component immediately after the skip link.
6. THE Layout SHALL render a `<main id="main-content">` element that wraps the default slot.
7. THE Layout SHALL render the Footer component after the `<main>` element.
8. THE Layout SHALL import and apply Token_CSS globally.
9. IF the `lang` prop's BCP 47 base language subtag is `ar`, `he`, `fa`, or `ur`, THEN THE Layout SHALL set `dir="rtl"` on the `<html>` element regardless of the `dir` prop value.
10. THE Layout SHALL include an `<head>` named slot called `jsonld` so that individual pages can inject additional `<script type="application/ld+json">` blocks without modifying the layout.
11. THE Layout SHALL render an `Organization` JSON-LD block on every page containing: `name: "Averon Overseas"`, `address` (streetAddress, addressLocality, addressRegion, postalCode, addressCountry), `email: "info@averonoverseas.com"`, `telephone` array with both phone numbers, and `url` set to the `SITE_URL` value.

---

### Requirement 5: Header Component

**User Story:** As a developer, I want a sticky header with the wordmark, primary navigation, language selector, and quote CTA, so that buyers can navigate the site from any page.

#### Acceptance Criteria

1. THE Header SHALL render a `<header>` element with `role="banner"`, `position: sticky`, `top: 0`, and `z-index: 20`.
2. THE Header SHALL display the wordmark "AVERON OVERSEAS" in Young Serif with the tagline "Enable Better Reach" below it in Hanken Grotesk, both as a single `<a>` linking to the site root.
3. THE Header SHALL render a `<nav aria-label="Main">` containing links to Products, Specifications, How we source, About, and Contact, using labels from the active locale's i18n JSON.
4. THE Header SHALL render a `<select>` element with an accessible `aria-label` attribute, listing options for `EN`, `हिन्दी`, `العربية`, `Français`, and `Español`; non-English options SHALL have a `disabled` attribute until reviewed translations exist.
5. THE Header SHALL render a "Request a quote" `<a>` element styled with the primary button pattern (filled ink background), linking to `/rfq/`.
6. WHEN viewport width is 860 px or less, THE Header SHALL hide the `<nav>` and the desktop CTA `<a>`, and instead render a `<details>` element with `<summary aria-label="Menu">` containing the same navigation links.
7. THE Header SHALL apply `border-bottom: 1px solid var(--rule)` and `background: var(--paper)`.
8. WHEN a navigation link inside the mobile `<details>` menu is activated, THE Header SHALL close the `<details>` element (set `open` to false).
9. THE Header SHALL consume all navigation labels exclusively from the active locale's i18n JSON; no navigation string SHALL be hard-coded in the component markup.

---

### Requirement 6: Footer Component

**User Story:** As a developer, I want a footer with company details and secondary navigation, so that contact information is always accessible.

#### Acceptance Criteria

1. THE Footer SHALL render a `<footer>` element with `role="contentinfo"` styled with the night background token and the on-night foreground token.
2. THE Footer SHALL display: the company name sourced from the `footer.companyName` i18n key, the one-line description from `footer.description`, the address from `footer.address`, the email as an `<a href="mailto:…">` from `footer.email`, and both phone numbers as `<a href="tel:…">` elements from `footer.phone1` and `footer.phone2`. The English values for these keys SHALL be: company name "AVERON OVERSEAS", description "Sourcing and supply company for pharmaceutical primary packaging and raw materials.", address "Jaipur, Rajasthan 302012, India", email `info@averonoverseas.com`, phones `+91-85911-04074` and `+91-70738-57555`.
3. THE Footer SHALL render three secondary navigation links using labels from the active locale's i18n JSON: Products linking to `/products/`, Privacy Policy linking to `/privacy/`, and Sitemap linking to `/sitemap.xml`.
4. THE Footer SHALL apply bottom padding of `calc(48px + env(safe-area-inset-bottom, 0px))`.
5. THE Footer SHALL consume all text labels from the active locale's i18n JSON, falling back to the `en` locale value when a key is an empty string or missing.

---

### Requirement 7: i18n String Skeleton

**User Story:** As a developer, I want all UI strings externalised into per-locale JSON files from day one, so that adding translated content later requires only populating the JSON without editing component files.

#### Acceptance Criteria

1. THE Astro_Site SHALL contain the directory `src/i18n/` with one JSON file per supported locale: `en.json`, `hi.json`, `ar.json`, `fr.json`, `es.json`.
2. THE `en.json` file SHALL define string keys for every piece of UI text in the Header and Footer, including: `nav.products`, `nav.specifications`, `nav.howWeSource`, `nav.about`, `nav.contact`, `nav.requestQuote`, `footer.companyName`, `footer.description`, `footer.address`, `footer.email`, `footer.phone1`, `footer.phone2`, `footer.links.products`, `footer.links.privacy`, `footer.links.sitemap`, `lang.en`, `lang.hi`, `lang.ar`, `lang.fr`, `lang.es`.
3. THE non-English locale JSON files SHALL contain exactly the same set of keys as `en.json` (no additional, no missing keys) with empty string values, signalling that translations are pending.
4. THE Astro_Site SHALL export a `useTranslations(lang: string)` utility function from `src/i18n/index.ts` that accepts a locale string and returns a translator function; that translator function SHALL map any i18n key to its value, falling back to `en.json` when a key's value is an empty string or the key is missing, and returning the key string itself as a last resort when the key is also absent from `en.json`.
5. WHEN `useTranslations` is called with a string that does not exactly match one of the five supported locale codes (`en`, `hi`, `ar`, `fr`, `es`), THE `useTranslations` function SHALL fall back to the `en` locale.

---

### Requirement 8: Category and Product Data Schema

**User Story:** As a developer, I want a documented JSON schema for categories and products, so that data files are consistent and templates can be built against a stable shape.

#### Acceptance Criteria

1. THE Astro_Site SHALL contain the directories `src/data/categories/` and `src/data/products/`.
2. THE `src/data/categories/` directory SHALL contain one seed JSON file per category. Each file SHALL match the schema `{ slug: string, name: string, summary: string (max 160 chars), order: number (unique across all category files), image: string (filename ending in .webp or .avif), seoTitle: string (max 60 chars), seoDescription: string (max 155 chars) }`. The six product families from the 2026 catalogue SHALL be represented: `injectables`, `bottles-containers`, `closures-caps`, `blister-films-foils`, `dosing-dispensing`, `raw-materials`.
3. THE `src/data/products/` directory SHALL contain at least one seed product JSON file matching the schema: `{ slug: string, category: string, name: string, summary: string (max 160 chars), materials: string[], variants: Array<{ label: string, attrs: Record<string, string|number> }>, specs: Array<{ key: string, value: string, tol?: string, unit: string }>, sizeRange: string, colours: string[], standards: string[], docs: string[], images: string[], status: "verified" | "to-verify", tags: string[] }`.
4. THE Astro_Site SHALL export TypeScript type definitions for `Category` and `Product` from `src/data/types.ts` matching the schemas in criteria 2 and 3.
5. THE Astro_Site SHALL export helper functions `getCategories()` and `getProducts(categorySlug?: string)` from `src/data/index.ts` that read the JSON files using `import.meta.glob` and return typed arrays; `getCategories()` SHALL return categories sorted ascending by `order`; `getProducts()` without an argument SHALL return all products; `getProducts(categorySlug)` with an unrecognised slug SHALL return an empty array.

---

### Requirement 9: formatSpec() Helper

**User Story:** As a developer, I want a single helper function that formats all numeric specification values according to the site notation rules, so that no component formats values independently and all output is consistent.

#### Acceptance Criteria

1. THE `formatSpec` function SHALL be exported from `src/utils/formatSpec.ts` and SHALL accept a parameter object with fields: `value` (string or number — numbers are converted to string via `.toString()` with no rounding or padding), `unit` (string, optional), `tol` (string or number, optional), `isDiameter` (boolean, optional, default `false`).
2. WHEN `unit` is provided as a non-empty string AND `tol` is not provided, THE `formatSpec` function SHALL return `"<value>\u2009<unit>"` (Unicode thin space U+2009 between value and unit).
3. WHEN both `value` and `tol` are provided AND `unit` is provided as a non-empty string, THE `formatSpec` function SHALL return `"<value> ± <tol>\u2009<unit>"`. WHEN `tol` is provided AND `unit` is absent or empty, THE `formatSpec` function SHALL return `"<value> ± <tol>"` with no trailing unit.
4. WHEN `isDiameter` is `true`, THE `formatSpec` function SHALL prefix the output with `"Ø\u2009"`, producing: `"Ø\u2009<value>\u2009<unit>"` (with unit), `"Ø\u2009<value> ± <tol>\u2009<unit>"` (with tolerance and unit), `"Ø\u2009<value> ± <tol>"` (with tolerance, no unit), or `"Ø\u2009<value>"` (bare value). WHEN `isDiameter` is `false` or absent and no `unit` or `tol` is provided, THE `formatSpec` function SHALL return the bare value string with no prefix.
5. THE `formatSpec` function SHALL render the unit exactly as the caller provides it, preserving case without transformation; callers MUST pass `"mL"` not `"ml"` to comply with site notation rules.
6. WHEN neither `unit` (non-empty) nor `tol` is provided AND `isDiameter` is `false`, THE `formatSpec` function SHALL return the bare `value` as a plain string with no unit, tolerance, or prefix applied.
7. THE Astro_Site SHALL contain a test file `src/utils/formatSpec.test.ts` with exactly eight example-based unit tests (no property-based tests) covering: (a) plain value with unit, (b) value with tolerance and unit, (c) diameter prefix with unit, (d) mL unit case preservation, (e) no unit — bare value returned, (f) zero tolerance with unit, (g) tolerance without unit, (h) isDiameter with tolerance and no unit.

---

### Requirement 10: Sitemap Integration

**User Story:** As a developer, I want `@astrojs/sitemap` to generate a sitemap automatically at build time, so that search engines can discover all pages without manual maintenance.

#### Acceptance Criteria

1. THE `astro.config.mjs` SHALL import and register `@astrojs/sitemap` in the `integrations` array.
2. WHEN `npm run build` is executed, THE Astro_Site SHALL emit `dist/sitemap-index.xml` and `dist/sitemap-0.xml`; every URL entry in `sitemap-0.xml` SHALL begin with the value of `SITE_URL`.
3. THE `astro.config.mjs` SHALL pass `SITE_URL` (with default `'https://averonoverseas.github.io'`) to the `site` property so that all sitemap URL entries are absolute and consistent with canonical tags and robots.txt.
4. THE `public/robots.txt` SHALL be generated at build time (via an Astro endpoint or a build script) so that the `Sitemap:` directive uses the `SITE_URL` value rather than a hard-coded URL; the generated file SHALL contain `Sitemap: <SITE_URL>/sitemap-index.xml`.

---

### Requirement 11: robots.txt

**User Story:** As a developer, I want a `robots.txt` that explicitly allows all major crawlers including AI user-agents and points to the sitemap URL, so that the site is fully indexable and AI-discoverable.

#### Acceptance Criteria

1. THE Robots_File SHALL be located at `public/robots.txt` so that it is served at the site root path `/robots.txt`.
2. THE Robots_File SHALL begin with a wildcard stanza: `User-agent: *` on its own line, followed by `Allow: /` on the next line, with no `Disallow` directive in that stanza.
3. THE Robots_File SHALL contain individual blank-line-separated stanzas after the wildcard stanza, each with its own `User-agent:` line and `Allow: /`, for each of the following agents: `Googlebot`, `Bingbot`, `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `CCBot`.
4. THE Robots_File SHALL contain a `Sitemap:` directive whose URL is derived from `SITE_URL` (e.g. `Sitemap: https://averonoverseas.github.io/sitemap-index.xml` by default), consistent with Requirement 10 criterion 4.
5. THE Robots_File SHALL NOT contain any `Disallow` directive with a non-empty value anywhere in the file.

---

### Requirement 12: GitHub Actions Deployment Workflow

**User Story:** As a developer, I want a GitHub Actions workflow that builds and deploys the site to GitHub Pages on every push to the `main` branch, so that the site updates automatically without manual steps.

#### Acceptance Criteria

1. THE GH_Actions_Workflow SHALL be located at `.github/workflows/deploy.yml`.
2. WHEN a commit is pushed to the `main` branch OR when a `workflow_dispatch` event is triggered, THE GH_Actions_Workflow SHALL start a new run.
3. THE GH_Actions_Workflow SHALL set `permissions: contents: read, pages: write, id-token: write`.
4. THE GH_Actions_Workflow SHALL execute a build job using `withastro/action` to compile the site, followed by a deploy job using `actions/deploy-pages` to publish to GitHub Pages; the deploy job SHALL only execute after the build job completes successfully.
5. IF a deployment run is already in progress WHEN a new run starts, THE GH_Actions_Workflow SHALL cancel the in-progress run before allowing the new run to proceed, using a `concurrency` group keyed to the GitHub Pages environment.
6. THE GH_Actions_Workflow SHALL use Node.js 20 or later for the build step.
7. WHEN the build job exits with a non-zero status code, THE GH_Actions_Workflow SHALL mark the run as failed and SHALL NOT proceed to the deploy job.
8. WHEN the deploy job fails, THE GH_Actions_Workflow SHALL mark the run as failed, surface the error in the Actions log, and the previously deployed version SHALL remain live without modification.
