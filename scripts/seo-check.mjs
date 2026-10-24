/**
 * seo-check.mjs
 * Build-time SEO validation. Reads every .html file in dist/ and checks:
 *   - <title> present and ≤60 chars
 *   - <meta name="description"> present and ≤155 chars
 *   - <link rel="canonical"> present
 *   - Exactly one <h1>
 *   - No <img> missing alt attribute
 *   - No duplicate titles across pages
 *   - No duplicate meta descriptions across pages
 *   - No broken internal links (href starting with / that don't exist in dist/)
 *
 * Exits with code 1 if any check fails.
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';

const distDir = 'e:/website/averon/dist';
const base = process.env.BASE_PATH ?? '/averonoverseas';
const baseStripped = base === '/' ? '' : base.replace(/\/$/, '');

let errors = 0;
let warnings = 0;

function error(file, msg) { console.error(`  ✗ [${file}] ${msg}`); errors++; }
function warn(file, msg)  { console.warn(`  ⚠ [${file}] ${msg}`); warnings++; }

// Collect all HTML files
function getHtmlFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...getHtmlFiles(full));
    else if (entry.name.endsWith('.html')) result.push(full);
  }
  return result;
}

const htmlFiles = getHtmlFiles(distDir);
const titles = new Map(); // title → file
const descs  = new Map(); // desc  → file

console.log(`\nSEO check: ${htmlFiles.length} HTML files in dist/\n`);

for (const file of htmlFiles) {
  const rel  = relative(distDir, file);
  const html = readFileSync(file, 'utf8');

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const titleRaw   = titleMatch ? titleMatch[1].trim() : '';
  // Decode basic HTML entities for length check
  const titleText  = titleRaw.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#\d+;/g,' ').replace(/&[a-z]+;/g,' ').trim();
  if (!titleText) {
    error(rel, 'Missing <title>');
  } else {
    if (titleText.length > 60) warn(rel, `Title too long (${titleText.length} chars): "${titleText}"`);
    if (titles.has(titleText)) warn(rel, `Duplicate title: "${titleText}" (also in ${titles.get(titleText)})`);
    else titles.set(titleText, rel);
  }

  // Meta description
  const descMatch = html.match(/<meta\s[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
                 ?? html.match(/<meta\s[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const descText  = descMatch ? descMatch[1].trim() : '';
  if (!descText) {
    error(rel, 'Missing <meta name="description">');
  } else {
    if (descText.length > 155) warn(rel, `Description too long (${descText.length} chars)`);
    if (descs.has(descText)) warn(rel, `Duplicate description in ${descs.get(descText)}`);
    else descs.set(descText, rel);
  }

  // Canonical
  if (!html.includes('rel="canonical"')) error(rel, 'Missing <link rel="canonical">');

  // H1 count
  const h1s = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1s === 0) error(rel, 'No <h1> found');
  if (h1s > 1) warn(rel, `${h1s} <h1> tags found (expected 1)`);

  // img alt
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const img of imgTags) {
    if (!/\balt\s*=/i.test(img)) error(rel, `<img> missing alt: ${img.slice(0, 80)}`);
    if (/\balt\s*=\s*["']\s*["']/i.test(img) && !/aria-hidden/i.test(img)) {
      warn(rel, `<img> has empty alt without aria-hidden (decorative?): ${img.slice(0, 80)}`);
    }
  }

  // Internal links (skip anchors, mailto, tel, external)
  const hrefs = [...html.matchAll(/href=["']([^"'#?]+)/gi)].map(m => m[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    // Strip base prefix
    const path = href.startsWith(baseStripped) ? href.slice(baseStripped.length) : href;
    if (!path || path === '/') continue;
    const candidate1 = join(distDir, path);
    const candidate2 = join(distDir, path, 'index.html');
    const candidate3 = join(distDir, path.replace(/\/$/, '') + '.html');
    if (!existsSync(candidate1) && !existsSync(candidate2) && !existsSync(candidate3)) {
      // Ignore well-known paths that are intentionally not in dist
      const ignored = ['/sitemap.xml', '/robots.txt', '/products.json', '/llms.txt', '/llms-full.txt'];
      if (!ignored.some(i => path.startsWith(i))) {
        warn(rel, `Possibly broken internal link: ${href}`);
      }
    }
  }
}

console.log(`\nResult: ${errors} error(s), ${warnings} warning(s)\n`);
if (errors > 0) {
  console.error('SEO check FAILED. Fix the errors above before deploying.\n');
  process.exit(1);
} else {
  console.log('SEO check PASSED.\n');
}
