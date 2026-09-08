/**
 * Generates the PWA icon set from the public website's own logo.
 *
 * The logo is 550x349 — wider than it is tall — and a PWA icon must be
 * square, so each size is the logo CONTAINED (never cropped) on a square
 * brand-cream ground with a margin. Cropping to square would cut the
 * wordmark in half; stretching would distort it.
 *
 * A separate maskable icon carries a much larger safe-area margin, since
 * Android may clip a maskable icon to a circle or squircle.
 *
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(here, "..", "src", "assets", "KN_AGRO_LOGO.png");
const OUT = path.join(here, "..", "public");

// The site's own cream page ground, so the icon sits on brand colour
// rather than a transparent square that renders differently per platform.
const GROUND = { r: 246, g: 247, b: 244, alpha: 1 };

const render = async (size, { inset, file }) => {
  const inner = Math.round(size * inset);
  const logo = await sharp(SOURCE).resize(inner, inner, { fit: "contain", background: { ...GROUND, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: GROUND } })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(path.join(OUT, file));
  console.log(`  ${file}  ${size}x${size}`);
};

await mkdir(OUT, { recursive: true });
console.log("Generating PWA icons from the site logo:");
await render(192, { inset: 0.82, file: "pwa-192.png" });
await render(512, { inset: 0.82, file: "pwa-512.png" });
await render(512, { inset: 0.60, file: "pwa-maskable-512.png" });
await render(180, { inset: 0.82, file: "apple-touch-icon.png" });
await render(64, { inset: 0.88, file: "favicon.png" });
