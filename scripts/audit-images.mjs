/**
 * audit-images.mjs
 * Reads every file in public/images/, gets pixel dimensions via sharp,
 * computes aspect ratio, and writes IMAGE_AUDIT.md.
 */
import sharp from 'sharp';
import { readdirSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

const imgDir = 'e:/website/averon/public/images';
const outFile = 'e:/website/averon/IMAGE_AUDIT.md';

const files = readdirSync(imgDir)
  .filter(f => /\.(webp|png|jpg|jpeg|avif)$/i.test(f))
  .sort();

const rows = [];
for (const f of files) {
  const p = join(imgDir, f);
  try {
    const meta = await sharp(p).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const g = gcd(w, h);
    const ar = `${w/g}:${h/g}`;
    const isStd43 = Math.abs(w/h - 4/3) < 0.02;
    const flag = isStd43 ? '' : '⚠ NOT 4:3';
    rows.push({ f, w, h, ar, flag });
  } catch (e) {
    rows.push({ f, w: '?', h: '?', ar: '?', flag: '⚠ READ ERROR' });
  }
}

const lines = [
  '# IMAGE_AUDIT.md',
  '',
  'Audit of `public/images/`. Flagged (⚠) = not 4:3 or otherwise non-standard.',
  'New standard: **4:3, 1600×1200, pure white (#FFFFFF) seamless backdrop, subject within central 75%**.',
  '',
  '| Filename | Width | Height | Aspect | Flag |',
  '|---|---|---|---|---|',
  ...rows.map(r => `| ${r.f} | ${r.w} | ${r.h} | ${r.ar} | ${r.flag} |`),
  '',
  '## Flagged images requiring regeneration',
  '',
  ...rows.filter(r => r.flag).map(r => `- \`${r.f}\` — ${r.flag}`),
  '',
  '## Notes',
  '- All current images were converted from PNG source photos at 800×600 (4:3) or 1200×800 (3:2).',
  '- Category hero images (3:2) are intentionally non-4:3; they are used as heroes not product tiles.',
  '- Product tile images flagged as non-4:3 should be replaced with 1600×1200 white-backdrop images.',
  '- See IMAGE_PROMPTS.md for generation prompts.',
];

writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`Written: ${outFile}`);
rows.filter(r => r.flag).forEach(r => console.log(`  FLAGGED: ${r.f} (${r.w}×${r.h} ${r.ar}) ${r.flag}`));
console.log(`Total: ${rows.length} files, ${rows.filter(r=>r.flag).length} flagged.`);
