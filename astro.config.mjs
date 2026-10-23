import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL: set this env var to switch from GitHub Pages to a custom domain.
// All canonical URLs, sitemap entries, and robots.txt derive from this single value.
const SITE_URL = process.env.SITE_URL ?? 'https://averonoverseas.github.io';

export default defineConfig({
  site: SITE_URL,
  base: '/',
  output: 'static',
  integrations: [sitemap()],
});
