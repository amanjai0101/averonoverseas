/**
 * process-incoming.mjs
 * Converts any .png/.jpg/.jpeg/.webp dropped in images-incoming/ to optimised
 * .webp in public/images/. If the image is not the expected ratio (4:3 for
 * product tiles, 3:2 for heroes), it pads to the ratio on a pure white
 * #FFFFFF canvas (no cropping). Max 1800px wide, quality 82.
 * Originals moved to images-incoming/done/ (gitignored).
 *
 * Usage: npm run images
 */
import sharp from 'sharp';
import { readdirSync, mkdirSync, renameSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

const inDir   = 'e:/website/averon/images-incoming';
const outDir  = 'e:/website/averon/public/images';
const doneDir = 'e:/website/averon/images-incoming/done';

mkdirSync(inDir,   { recursive: true });
mkdirSync(outDir,  { recursive: true });
mkdirSync(doneDir, { recursive: true });

const supported = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const files = readdirSync(inDir).filter(f => {
  const ext = extname(f).toLowerCase();
  return supported.has(ext) && !f.startsWith('.');
});

if (files.length === 0) {
  console.log('No files found in images-incoming/. Drop .png/.jpg/.jpeg/.webp files there and re-run.');
  process.exit(0);
}

/**
 * Detect expected ratio from filename.
 * -hero, home-cover, og-default, scene-* → 3:2 (landscape)
 * og-default → ~1.9:1
 * everything else → 4:3
 */
function expectedRatio(filename) {
  const base = basename(filename, extname(filename)).toLowerCase();
  if (base === 'og-default') return { w: 1200, h: 630 };
  if (base.includes('-hero') || base === 'home-cover' || base.startsWith('scene-') || base === 'about-hero') {
    return { w: 1800, h: 1200 }; // 3:2
  }
  return { w: 1600, h: 1200 }; // 4:3
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

let ok = 0, err = 0;

for (const f of files) {
  const srcPath  = join(inDir, f);
  const baseName = basename(f, extname(f));
  const dstPath  = join(outDir, `${baseName}.webp`);
  const donePath = join(doneDir, f);

  try {
    const meta = await sharp(srcPath).metadata();
    const sw = meta.width ?? 0;
    const sh = meta.height ?? 0;
    const target = expectedRatio(f);

    // Determine final canvas size (cap at 1800px wide)
    let cw = target.w;
    let ch = target.h;
    const maxW = 1800;
    if (cw > maxW) { ch = Math.round(ch * maxW / cw); cw = maxW; }

    const srcRatio = sw / sh;
    const tgtRatio = cw / ch;
    const ratioOk  = Math.abs(srcRatio - tgtRatio) < 0.02;

    let pipeline = sharp(srcPath);

    if (!ratioOk) {
      // Pad to target ratio on white canvas
      pipeline = pipeline.resize(cw, ch, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        position: 'centre',
      });
      console.log(`  ↳ padded to ${cw}×${ch} (was ${sw}×${sh}, ratio mismatch)`);
    } else {
      // Just resize to target (no padding needed)
      if (sw > cw) {
        pipeline = pipeline.resize(cw, ch, { fit: 'inside' });
      }
    }

    await pipeline.webp({ quality: 82, effort: 4 }).toFile(dstPath);
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
