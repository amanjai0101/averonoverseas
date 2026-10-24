/**
 * process-incoming.mjs
 * Converts any .png / .jpg / .jpeg / .webp dropped in images-incoming/
 * to optimised .webp in public/images/ (max 1800px wide, quality 82),
 * then moves originals to images-incoming/done/.
 *
 * Usage: npm run images
 */
import sharp from 'sharp';
import { readdirSync, mkdirSync, renameSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

const inDir   = 'e:/website/averon/images-incoming';
const outDir  = 'e:/website/averon/public/images';
const doneDir = 'e:/website/averon/images-incoming/done';

// Ensure directories exist
mkdirSync(inDir,   { recursive: true });
mkdirSync(outDir,  { recursive: true });
mkdirSync(doneDir, { recursive: true });

const supported = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

const files = readdirSync(inDir).filter(f => {
  const ext = extname(f).toLowerCase();
  return supported.has(ext) && !f.startsWith('.');
});

if (files.length === 0) {
  console.log('No files found in images-incoming/. Drop .png/.jpg/.webp files there and re-run.');
  process.exit(0);
}

let ok = 0, err = 0;

for (const f of files) {
  const srcPath  = join(inDir, f);
  const baseName = basename(f, extname(f));
  const dstPath  = join(outDir, `${baseName}.webp`);
  const donePath = join(doneDir, f);

  try {
    const meta = await sharp(srcPath).metadata();
    const resize = meta.width && meta.width > 1800
      ? { width: 1800 }
      : undefined;

    await sharp(srcPath)
      .resize(resize)
      .webp({ quality: 82, effort: 4 })
      .toFile(dstPath);

    renameSync(srcPath, donePath);
    console.log(`✓  ${f}  →  public/images/${baseName}.webp`);
    ok++;
  } catch (e) {
    console.error(`✗  ${f}: ${e.message}`);
    err++;
  }
}

console.log(`\nDone: ${ok} converted, ${err} errors.`);
if (ok > 0) console.log('Run `npm run build` to pick up the new images.');
