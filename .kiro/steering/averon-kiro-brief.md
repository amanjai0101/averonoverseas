# Averon Overseas – Kiro steering brief

## 1. Business
- Averon Overseas is a **trader / sourcing company**, Jaipur, Rajasthan 302012, India. info@averonoverseas.com, +91-85911-04074, +91-70738-57555. Tagline: "Enable Better Reach".
- Audience: pharma manufacturers, brand owners, procurement teams, international buyers.
- Content depth: **brief and buyer-useful only**: name, one-line description, material, available sizes, colours, standard/neck finish, documents on request. No tutorials, no long essays.
- **Never invent** certifications, customers, capacities, years, statistics, awards, testimonials. If unknown, leave the field out and add it to `TO_VERIFY.md`.
- Controlled substances are not listed. Keep the catalogue footnote: specifications are indicative, final specs confirmed with supplier at order stage.

## 2. Stack (GitHub Pages, static)
- Astro, static output, zero client JS by default, plain CSS with design tokens (no UI framework, no Tailwind template look).
- `astro.config`: set `site` and `base` for GitHub Pages; output `dist/`; deploy via GitHub Actions (`withastro/action`).
- Images: WebP/AVIF via Astro `<Image>`, explicit width/height, lazy below fold, descriptive `alt`.
- Fonts: Young Serif (headings), Hanken Grotesk (body), JetBrains Mono (spec values only). Self-host with `font-display: swap`.

## 3. Generic, extensible data model (do not hard-code products in templates)
```
src/data/categories/<slug>.json   { slug, name, summary, order, image, seoTitle, seoDescription }
src/data/products/<slug>.json
{
  "slug": "crc-cap-28",
  "category": "closures-caps",
  "name": "Child-resistant closure (CRC)",
  "summary": "One line, max 160 chars.",
  "materials": ["PP", "LDPE", "EPE liner"],
  "variants": [ { "label": "28 mm", "attrs": { "neck": 28, "unit": "mm" } } ],
  "specs": [ { "key": "Overall height", "value": "24.30", "tol": "0.20", "unit": "mm" } ],
  "sizeRange": "22–38 mm",
  "colours": ["White", "Custom"],
  "standards": [],
  "docs": ["Drawing", "Specification", "CoA"],
  "images": ["crc-cap-28-1.webp"],
  "status": "verified | to-verify",
  "tags": ["child resistant", "tamper evident"]
}
```
- Category page = auto-list of products with that category. Product page = auto-built from JSON. Adding a product = adding one JSON file + image. No template edits.
- Home product index, nav, sitemap, JSON-LD and search index are all generated from the same data.
- Seed data: only items in the 2026 catalogue (Injectables, Bottles & Containers, Closures & Caps, Blister Films & Foils, Dosing & Dispensing, Raw Materials) and the CoA/spec sheets (CRC28, SURESEAL28 EPE and LDPE-plug, 28 mm dosing cups 15/20 mL). Raw materials: category pages list names only, grouped by therapeutic/functional category, no per-item pages initially.

## 4. Notation rules (apply everywhere, via one `formatSpec()` helper)
- Number, thin space, unit: `24.30 mm`, `6.30 g`, `1.40 mm`, `25.70 mL`, `100 µm`.
- Tolerance: `24.30 ± 0.20 mm`. Ranges: `2R–100R`, `30–500 mL` (en dash, no spaces around it).
- Diameter: `Ø 34.40 mm`. Neck finish: `28 mm`. Volume unit: **mL** (not ml) site-wide.
- Decimal point `.`, thousands thin space. Polymers abbreviated with full name on first use per page: PP (polypropylene).
- Spec tables: label left, value right in mono, hairline rows, same component on every product.
- Dimension notes say "typical, confirmed per order".

## 5. Pages
`/` Home · `/products/` index · `/products/<category>/` · `/products/<category>/<product>/` · `/raw-materials/` · `/documents/` (what we share: CoA, TDS, SDS, drawing, spec; no downloads of private files) · `/about/` · `/contact/` (includes RFQ) · `/rfq/` · `/privacy/` · `/404`.
Every product page: image, one-line summary, spec table, available sizes, "Request a quote" button pre-filling product name via URL param, related products.

## 6. Design rules
- Follow the reference page: square corners, 1 px rules, no card shadows, no gradients, no emoji, no fake stats. Accent (#E58C6B) only for the quote CTA and diagram dimension lines. Light and dark mode via tokens.
- Tokens: paper #E9EFF4, panel #D6E1EA, ink/night #12263F, accent #E58C6B, muted #566577, rule #9FB1C2.
- One photo or drawing per product row/page. Realistic product photography style: neutral pale blue-grey backdrop, soft top light, product centred, no text on image, 4:3 for tiles, 1:1 for product pages. Technical diagrams: navy line on paper with peach dimension lines.
- Accessibility: WCAG AA contrast, visible focus, skip link, reduced motion respected, forms labelled, 44 px touch targets.

## 7. Forms and analytics (static-compatible)
- RFQ + contact: Web3Forms or Formspree free tier (access key placeholder in `.env.example`; email delivery to info@averonoverseas.com). Honeypot field, client + server validation message, success/failure states, consent checkbox linking to privacy policy.
- Analytics: GoatCounter or Cloudflare Web Analytics (cookieless, privacy-friendly: pages, countries, referrers, time; **not** individual identities). Individual contact details come only from submitted forms. If a cookie-based tool is added later, add a consent banner first.
- Privacy policy must describe exactly what is collected, by which processor, and contact for requests.

## 8. SEO and AI discoverability
- One H1 per page, semantic landmarks, unique `<title>` (≤60 chars) and meta description (≤155) generated from data, canonical URL, Open Graph/Twitter tags, `lang`, `hreflang` when translations exist.
- JSON-LD: `Organization` (name, address, email, phones, logo), `WebSite`, `BreadcrumbList`, `Product` (name, description, category, material, image; **no price, no fake ratings**), `ContactPage`.
- `sitemap.xml` (via `@astrojs/sitemap`), `robots.txt` allowing all major crawlers incl. GPTBot, ClaudeBot, Google-Extended, PerplexityBot, and pointing to sitemap. `llms.txt` at root: company summary, page list, product categories, contact. `/products.json` public feed generated from the data (name, category, sizes, materials, URL).
- Natural keywords in headings and copy (e.g. "pharmaceutical primary packaging supplier India", "API and excipient sourcing India"); no stuffing, no hidden text. Internal links between category ↔ product ↔ RFQ. Descriptive filenames and alt text.
- Performance targets: Lighthouse ≥95 all four, LCP <2.5 s, CLS <0.1, total JS <30 kB, images ≤150 kB.
- Include `404.html`, favicon set, `site.webmanifest`, security meta (`referrer`, no inline JS where avoidable).

## 9. Multilingual
- English first. Structure with Astro i18n routing (`/hi/`, `/ar/`, `/fr/`, `/es/`…), all UI strings in `src/i18n/<lang>.json`, product text keys optional per language with English fallback. RTL support via `dir` attribute for Arabic.
- Language selector lists only languages that have reviewed content. Machine translations marked `status: draft` and not published until a human reviews them.

## 10. Credit-efficient build plan (give Kiro one stage at a time)
Use **Spec mode once** (Stage 1). Use plain chat/vibe for everything else. End each stage with: "Commit, update PROJECT_STATUS.md in ≤10 lines, stop."

**Stage 0 – Audit (done by you, free):** commit this file + reference page + catalogue PDF + spec PDFs in `reference/`.
**Stage 1 – Scaffold (Spec mode):** "Read `.kiro/steering/averon.md` and `reference/design.html`. Scaffold the Astro site with layout, header/footer, tokens CSS, i18n skeleton, data schema + `formatSpec()`, sitemap, robots, GitHub Pages workflow. No page content yet."
**Stage 2 – Data:** "From `reference/` catalogue and spec PDFs, create category and product JSON files per section 3. Only facts present in the documents; flag the rest in `TO_VERIFY.md`. Use placeholder image paths."
**Stage 3 – Pages:** "Build home, category, product, raw-materials, documents, about, contact/RFQ pages from the data, matching `reference/design.html`."
**Stage 4 – SEO pass:** "Implement section 8 completely, run a build, list any page missing title/description/canonical/JSON-LD."
**Stage 5 – Forms, analytics, privacy:** section 7.
**Stage 6 – QA:** "Check at 360, 768, 1280, 1920 px, keyboard-only, dark mode, reduced motion; run Lighthouse and an HTML/link validator; fix issues; list remaining."
**Stage 7 – Translations:** add one language at a time after English is live.
**Stage 8 – Launch:** repo settings → Pages → GitHub Actions; add Search Console and Bing Webmaster verification, submit sitemap; custom domain `www.averonoverseas.com` via CNAME + DNS.

## 11. Images
- Generate detailed prompts for generating real images of Products or images like "People in laboratory" with proper size and scenario: "Photorealistic studio product photograph, [product], pale blue-grey seamless backdrop, soft top-left light, subtle shadow, centred, no text, no logo, sharp focus, 4:3." Review at thumbnail size, regenerate only failures.
- Use real supplier or sample photos where available; they outrank generated images for trust. Do not show generated images as certified samples.
- Name files `category-product-n.webp`; keep originals outside the repo.
- You can even put all the prmompts in one .md file also so that i can use and generate the image separately via other external tool and put them at right places.
- Sevaral Images are already there in images/ folder in the project for reference and direct use. Also use proper logo images or favicon icon images for web engines to show on listing at search.
