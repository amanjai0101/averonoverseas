# Averon Overseas — Website

Static Astro site for [averonoverseas.com](https://www.averonoverseas.com). Deployed on GitHub Pages.

## Development

```bash
cp .env.example .env   # fill in your keys
npm install
npm run dev            # local dev server at localhost:4321
npm run build          # production build → dist/
npm run preview        # preview dist/ locally
npm run test           # run vitest unit tests
npm run seo-check      # validate SEO after build (run after npm run build)
```

## Indexing control

Set `PUBLIC_INDEXABLE=false` (default) while staging. When the custom domain `www.averonoverseas.com` is live and verified in Google Search Console, set `PUBLIC_INDEXABLE=true` in GitHub repository Variables. This flips every page from `noindex` to `index,follow` and sets `robots.txt` to allow all crawlers.

## Analytics

Set `PUBLIC_GOATCOUNTER_CODE` to your GoatCounter site code to enable cookieless analytics. No cookie banner is required — GoatCounter collects no personal data. Alternatively, add Cloudflare Web Analytics by pasting the script snippet into `Base.astro` (no environment variable needed for that approach).

## Adding images

Drop `.png`, `.jpg`, `.jpeg` or `.webp` files into `images-incoming/`. Run `npm run images` — each file is converted to optimised WebP (max 1800 px wide, quality 82) in `public/images/`, padded to the correct 4:3 or 3:2 ratio on white if needed, then originals are moved to `images-incoming/done/` (gitignored). See `IMAGE_PROMPTS.md` for AI generation prompts.

## Adding products

Drop one JSON file into `src/data/products/` — no template edits needed. See existing files for the schema and `TO_VERIFY.md` for items pending supplier confirmation.

## Deployment

Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically. See `DEPLOY.md` for the full launch checklist including DNS, Search Console, and how to flip `PUBLIC_INDEXABLE`.
