#!/usr/bin/env node
/**
 * Post-build verification script for Averon Overseas.
 * Checks that all expected build artifacts are present and well-formed.
 *
 * Usage: node scripts/check-build.mjs
 *        npm run check-build
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 */

import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');

const SITE_URL = (process.env.SITE_URL ?? 'https://averonoverseas.github.io').replace(/\/$/, '');

let allPassed = true;

/**
 * Run a single check. Prints ✅ or ❌ and tracks overall pass/fail.
 * @param {string} description  Human-readable label for the check
 * @param {boolean} passed      Whether this check succeeded
 */
function check(description, passed) {
  if (passed) {
    console.log(`✅ ${description}`);
  } else {
    console.log(`❌ ${description}`);
    allPassed = false;
  }
}

// ── Sitemap files ────────────────────────────────────────────────────────────

check(
  'dist/sitemap-index.xml exists',
  existsSync(resolve(distDir, 'sitemap-index.xml'))
);

check(
  'dist/sitemap-0.xml exists',
  existsSync(resolve(distDir, 'sitemap-0.xml'))
);

// ── robots.txt ───────────────────────────────────────────────────────────────

const robotsPath = resolve(distDir, 'robots.txt');
const robotsExists = existsSync(robotsPath);
check('dist/robots.txt exists', robotsExists);

if (robotsExists) {
  const robotsContent = readFileSync(robotsPath, 'utf-8');
  const expectedSitemapLine = `Sitemap: ${SITE_URL}/sitemap-index.xml`;
  check(
    `dist/robots.txt contains "${expectedSitemapLine}"`,
    robotsContent.includes(expectedSitemapLine)
  );
} else {
  // Mark the sitemap-line check as failed too since we can't read the file
  check(
    `dist/robots.txt contains "Sitemap: ${SITE_URL}/sitemap-index.xml"`,
    false
  );
}

// ── WOFF2 font files ─────────────────────────────────────────────────────────

const fontFiles = [
  'young-serif-latin-400-normal.woff2',
  'hanken-grotesk-latin-400-normal.woff2',
  'hanken-grotesk-latin-500-normal.woff2',
  'hanken-grotesk-latin-700-normal.woff2',
  'jetbrains-mono-latin-400-normal.woff2',
  'jetbrains-mono-latin-500-normal.woff2',
];

for (const font of fontFiles) {
  check(
    `dist/fonts/${font} exists`,
    existsSync(resolve(distDir, 'fonts', font))
  );
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log('');
if (allPassed) {
  console.log('All post-build checks passed.');
  process.exit(0);
} else {
  console.log('One or more post-build checks failed. See ❌ lines above.');
  process.exit(1);
}
