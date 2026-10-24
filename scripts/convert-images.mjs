/**
 * convert-images.mjs
 * Converts source images from /images/ to optimised WebP in /public/images/.
 * Maps source filename → target WebP filename used in product/category JSONs.
 */
import sharp from 'sharp';
import { existsSync } from 'fs';
import { join } from 'path';

const src = 'e:/website/averon/images';
const dst = 'e:/website/averon/public/images';

// Map: source filename (no ext) → [{ target, width, height }]
// width/height chosen per role: hero 1200×800 (3:2), tile 800×600 (4:3), product 800×800 (1:1)
const MAP = [
  // ── Logo / favicon source ──────────────────────────────────────────────────
  { src: 'AveronLogo.png',             dst: 'averon-logo.webp',                         w: 400, h: 200 },

  // ── Category heroes (3:2) ─────────────────────────────────────────────────
  { src: 'injectablesHero.png',        dst: 'injectables-hero.webp',                    w: 1200, h: 800 },
  { src: 'syrupsHero.png',             dst: 'bottles-containers-hero.webp',             w: 1200, h: 800 },
  { src: 'plasticContainersHero.png',  dst: 'closures-caps-hero.webp',                  w: 1200, h: 800 },
  { src: 'blisterHero.png',            dst: 'blister-films-foils-hero.webp',            w: 1200, h: 800 },
  { src: 'dispensingHero.png',         dst: 'dosing-dispensing-hero.webp',              w: 1200, h: 800 },

  // ── Product tiles (4:3 → 800×600) ─────────────────────────────────────────
  { src: 'glassVials.png',             dst: 'injectables-glass-vials-1.webp',           w: 800, h: 600 },
  { src: 'ampoules.png',               dst: 'injectables-glass-ampoules-1.webp',        w: 800, h: 600 },
  { src: 'flipOffSeals.png',           dst: 'injectables-flip-off-seals-1.webp',        w: 800, h: 600 },
  { src: 'rubberStoppers.png',         dst: 'injectables-rubber-stoppers-1.webp',       w: 800, h: 600 },
  { src: 'glassSyrupsBottle.png',      dst: 'bottles-containers-glass-bottles-1.webp',  w: 800, h: 600 },
  { src: 'petBottles.png',             dst: 'bottles-containers-pet-bottles-1.webp',    w: 800, h: 600 },
  { src: 'hdpeContainers.png',         dst: 'bottles-containers-hdpe-containers-1.webp',w: 800, h: 600 },
  { src: 'ldpeContainers.png',         dst: 'bottles-containers-ldpe-containers-1.webp',w: 800, h: 600 },
  { src: 'aluminiumROPPcaps.png',      dst: 'closures-caps-ropp-1.webp',                w: 800, h: 600 },
  { src: 'plasticCaps.png',            dst: 'closures-caps-tamper-evident-1.webp',      w: 800, h: 600 },
  { src: 'capsAndMeasuringCups.png',   dst: 'closures-caps-screw-caps-1.webp',          w: 800, h: 600 },
  { src: 'aluminiumLidFoils.png',      dst: 'blister-films-foils-lid-foil-1.webp',      w: 800, h: 600 },
  { src: 'flexibleLaminates.png',      dst: 'blister-films-foils-flexible-laminates-1.webp', w: 800, h: 600 },
  { src: 'dropperAssembliesAndBottles.png', dst: 'dosing-dispensing-dropper-assemblies-1.webp', w: 800, h: 600 },
  { src: 'oralDosingSyringes.png',     dst: 'dosing-dispensing-oral-syringes-1.webp',  w: 800, h: 600 },
  { src: 'measuringCupsAndSpoons.png', dst: 'dosing-dispensing-measuring-cups-1.webp', w: 800, h: 600 },

  // ── CRC product (1:1) ─────────────────────────────────────────────────────
  { src: 'plasticCaps.png',            dst: 'closures-caps-crc-1.webp',                 w: 800, h: 800 },

  // ── About / cover ─────────────────────────────────────────────────────────
  { src: 'coverVisual.png',            dst: 'home-cover.webp',                          w: 1200, h: 800 },
  { src: 'aboutHero.png',              dst: 'about-hero.webp',                          w: 1200, h: 800 },
];

let ok = 0, skip = 0, err = 0;

for (const entry of MAP) {
  const srcPath = join(src, entry.src);
  const dstPath = join(dst, entry.dst);

  if (!existsSync(srcPath)) {
    console.log(`SKIP (not found): ${entry.src}`);
    skip++;
    continue;
  }

  try {
    await sharp(srcPath)
      .resize(entry.w, entry.h, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82, effort: 4 })
      .toFile(dstPath);
    console.log(`OK  ${entry.dst}`);
    ok++;
  } catch (e) {
    console.error(`ERR ${entry.dst}: ${e.message}`);
    err++;
  }
}

console.log(`\nDone: ${ok} converted, ${skip} skipped, ${err} errors.`);
