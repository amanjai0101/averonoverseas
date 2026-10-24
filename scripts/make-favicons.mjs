import sharp from 'sharp';
import { join } from 'path';

const src = 'e:/website/averon/images/AveronLogo.png';
const pub = 'e:/website/averon/public';

const sizes = [
  { size: 16,  out: 'favicon-16x16.png' },
  { size: 32,  out: 'favicon-32x32.png' },
  { size: 48,  out: 'favicon-48x48.png' },
  { size: 180, out: 'apple-touch-icon.png' },
  { size: 192, out: 'icon-192.png' },
  { size: 512, out: 'icon-512.png' },
];

for (const { size, out } of sizes) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: { r:233, g:239, b:244, alpha:1 } })
    .png()
    .toFile(join(pub, out));
  console.log(`OK  ${out}`);
}

// favicon.ico (32×32 PNG copied as .ico — browsers accept PNG-in-ICO for modern usage)
await sharp(src)
  .resize(32, 32, { fit: 'contain', background: { r:233, g:239, b:244, alpha:1 } })
  .png()
  .toFile(join(pub, 'favicon.ico'));
console.log('OK  favicon.ico');

console.log('Done.');
