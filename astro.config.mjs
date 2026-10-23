import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL: canonical origin. Change to 'https://www.averonoverseas.com' when
// a custom domain is active — that also makes BASE_PATH unnecessary (set it to '/').
const SITE_URL = process.env.SITE_URL ?? 'https://amanjai0101.github.io';

// BASE_PATH: the sub-path under the origin where the site is deployed.
//   GitHub Pages repo:  '/averonoverseas'  (default)
//   Custom domain root: '/'
const BASE_PATH = process.env.BASE_PATH ?? '/averonoverseas';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  integrations: [sitemap()],
});
