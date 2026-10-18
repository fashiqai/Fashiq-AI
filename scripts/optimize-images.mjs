/**
 * Batch-convert pose & style PNGs to optimized WebP thumbnails.
 * 
 * Usage:  node scripts/optimize-images.mjs
 *
 * For each source PNG it creates a sibling `.webp` file at the target
 * resolution (small thumbnails that the pose grid actually needs).
 * The originals are kept untouched.
 */

import sharp from "sharp";
import { readdir, stat, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "..", "public");

// Directories containing images to optimize
const IMAGE_DIRS = [
  "poses/female",
  "poses/male",
  "styles/jewelry/earring",
  "styles/jewelry/necklace",
  "styles/jewelry/ring",
];

// Thumbnail dimensions — 480px covers 3x Retina mobile displays perfectly with zero blurriness
const THUMB_MAX = 480;
const QUALITY = 88;

async function processDir(relDir) {
  const absDir = path.join(PUBLIC, relDir);

  let entries;
  try {
    entries = await readdir(absDir);
  } catch {
    console.log(`  ⏭  Skipping ${relDir} (not found)`);
    return;
  }

  for (const file of entries) {
    if (!file.endsWith(".png")) continue;

    const srcPath = path.join(absDir, file);
    const destPath = path.join(absDir, file.replace(/\.png$/i, ".webp"));

    const srcStat = await stat(srcPath);
    const srcKB = (srcStat.size / 1024).toFixed(0);

    await sharp(srcPath)
      .resize({ width: THUMB_MAX, height: THUMB_MAX, fit: "inside" })
      .webp({ quality: QUALITY })
      .toFile(destPath);

    const destStat = await stat(destPath);
    const destKB = (destStat.size / 1024).toFixed(0);
    const saving = ((1 - destStat.size / srcStat.size) * 100).toFixed(0);

    console.log(`  ✅ ${relDir}/${file}  ${srcKB}KB → ${destKB}KB  (−${saving}%)`);
  }
}

// Also create tiny blur placeholder data-URLs
async function generateBlurPlaceholder(srcPath) {
  const buffer = await sharp(srcPath)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 20 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString("base64")}`;
}

async function main() {
  console.log("🖼  Optimizing images for mobile performance...\n");

  for (const dir of IMAGE_DIRS) {
    console.log(`📂 ${dir}`);
    await processDir(dir);
  }

  // Also optimize the root-level best-match pose
  const bestMatch = path.join(PUBLIC, "poses", "best-match.png");
  try {
    await sharp(bestMatch)
      .resize({ width: THUMB_MAX, height: THUMB_MAX, fit: "inside" })
      .webp({ quality: QUALITY })
      .toFile(bestMatch.replace(".png", ".webp"));
    console.log(`  ✅ poses/best-match.png → webp`);
  } catch {
    console.log(`  ⏭  best-match.png not found`);
  }

  // Optimize indoor/outdoor background previews
  for (const bg of ["indoor.png", "outdoor.png"]) {
    const bgPath = path.join(PUBLIC, bg);
    try {
      await sharp(bgPath)
        .resize({ width: 300, height: 300, fit: "inside" })
        .webp({ quality: QUALITY })
        .toFile(bgPath.replace(".png", ".webp"));
      console.log(`  ✅ ${bg} → webp`);
    } catch {
      console.log(`  ⏭  ${bg} not found`);
    }
  }

  console.log("\n✨ Done! WebP thumbnails created alongside originals.");
}

main().catch(console.error);
