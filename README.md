# Averon Overseas — Website

Static Astro site for [averonoverseas.com](https://www.averonoverseas.com). Built on GitHub Pages.

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview dist/ locally
npm run test      # run vitest unit tests
```

## Adding images

Drop any `.png`, `.jpg`, or `.webp` file into `images-incoming/`.
Run `npm run images` — it converts each file to optimised WebP (max 1800 px wide, quality 82) in `public/images/` using the same base filename, then moves the originals to `images-incoming/done/` (gitignored).
See `IMAGE_PROMPTS.md` for AI generation prompts for all missing or placeholder images.

## Data

All products and categories live in `src/data/`. Add a product by dropping one JSON file into `src/data/products/` — no template edits needed. See `TO_VERIFY.md` for items pending supplier confirmation.

## Deployment

Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically (`.github/workflows/deploy.yml`).
Set `SITE_URL` environment variable to switch the canonical domain (e.g. `https://www.averonoverseas.com`).
