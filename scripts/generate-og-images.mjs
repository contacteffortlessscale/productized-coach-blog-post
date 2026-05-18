#!/usr/bin/env node
// Generate 1200x630 Open Graph optimized variants of the cover images.
// Resizes existing /public/covers/*.png → /public/og/*.png at OG-standard dimensions.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const COVERS_DIR = path.join(repoRoot, 'public/covers');
const OG_DIR = path.join(repoRoot, 'public/og');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

async function main() {
  await fs.mkdir(OG_DIR, { recursive: true });
  const files = (await fs.readdir(COVERS_DIR)).filter((f) => f.endsWith('.png'));
  console.log(`Generating ${OG_WIDTH}x${OG_HEIGHT} OG variants for ${files.length} covers...`);

  for (const file of files) {
    const inputPath = path.join(COVERS_DIR, file);
    const outputPath = path.join(OG_DIR, file);

    await sharp(inputPath)
      .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'center' })
      .png({ quality: 90, compressionLevel: 8 })
      .toFile(outputPath);

    const stat = await fs.stat(outputPath);
    console.log(`  ✓ ${file} (${(stat.size / 1024).toFixed(1)} KB)`);
  }
  console.log('\nDone. OG images at /og/<slug>.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
