#!/usr/bin/env node
// Generate a branded cover image for a blog post using OpenAI gpt-image-1.
//
// Usage:
//   node scripts/generate-cover.mjs <slug>           Generate cover for one post
//   node scripts/generate-cover.mjs --all            Generate covers for all posts missing one
//   node scripts/generate-cover.mjs --force <slug>   Regenerate even if a cover exists

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import OpenAI from 'openai';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Load env from .env.local first (preferred for local-only secrets), then .env
loadEnv({ path: path.join(repoRoot, '.env.local') });
loadEnv({ path: path.join(repoRoot, '.env') });
const postsDir = path.join(repoRoot, 'src/content/blog');
const coversDir = path.join(repoRoot, 'public/covers');

const BASE_STYLE = [
  'Editorial blog header illustration in a minimalist, modern flat-design style.',
  'Strict color palette: dark forest green #013121, vibrant spring green #1C6E42, sea green accent #498B68, soft off-white background #F8F7F5.',
  'Clean geometric shapes, subtle gradients, sophisticated and premium feel.',
  'High-end coaching brand aesthetic, similar to Stratechery or Lenny\'s Newsletter cover art.',
  'NO TEXT. NO WORDS. NO LETTERS. NO TYPOGRAPHY.',
  '3:2 wide aspect ratio composition with focal subject left of center.',
].join(' ');

// Per-slug subject overrides. Falls back to title-derived subject if missing.
const SUBJECT_OVERRIDES = {
  'ai-commoditizing-coaches-category-of-one':
    'A single distinct chess knight piece standing tall and confident on a chessboard, surrounded by many identical generic pawns. Conceptual visual metaphor for standing out as a category of one among commoditized competitors.',
  'the-one-container-rule':
    'Three small separate geometric box outlines on the left flowing or merging into one larger unified open container on the right. Subtle directional flow lines. Conceptual visual metaphor for consolidating scattered offers into one container.',
  'the-cash-cycle-build-backwards':
    'A three-tier ascending platform or pyramid structure with subtle directional arrows showing reverse build order (the top tier built first, base tier built last). Conceptual visual metaphor for designing offers in reverse order.',
  'welcome-to-the-productized-coach-blog':
    'A simple geometric open doorway or arched threshold with soft warm light spilling through from the other side. Conceptual visual metaphor for new beginnings and an invitation inside.',
  'evergreen-ads-stop-burning-out-your-facebook-ads':
    'A single tall, steady evergreen pine tree standing alone on a gentle hillside while smaller deciduous trees around it have lost their leaves. Subtle indicators of multiple seasons or time passing across the same scene. Conceptual visual metaphor for an ad that endures and keeps producing while everything else around it burns out.',
  'get-paid-to-create':
    'A minimalist composition showing a flow: on the left, a stack of coin-like circles or a payment receipt; in the center, an arrow or pathway; on the right, an open empty notebook page or microphone stand with light beaming onto it. The flow goes from payment to creation, not creation to payment. Conceptual visual metaphor for being paid before building.',
  'business-should-be-boring':
    'A minimalist geometric metronome rendered in clean editorial line work, with a slow horizontal swing of motion indicators tracing a steady predictable arc. Beside it, three or four identical small geometric markers arranged in a clean repeating sequence suggesting a steady cadence. Conceptual visual metaphor for predictable, boring, disciplined rhythm in a business.',
  'be-a-selfish-bastard':
    'A clean geometric illustration showing a single bold confident arrow pointing in one direction, while six to eight smaller identical arrows behind it all point in the opposite direction. The single confident arrow leads. The crowd of arrows follows the safe path. Conceptual visual metaphor for trusting your own creative direction versus following what the audience asked for.',
  'three-buyers-a-day':
    'A clean minimalist illustration of exactly three identical small figures or coin-markers stepping onto a rising platform or path one after another, with a subtle upward trend line and a small proof checkmark. The emphasis is on the steady count of three, repeating daily. Conceptual visual metaphor for validating an offer by getting three steady buyers a day rather than chasing one big launch.',
  'win-the-first-impression':
    'A clean geometric illustration of a tall document or page where only the top few lines are brightly illuminated and crisp in dark forest green, while the rest of the page below fades softly into pale muted gray. A subtle beam of light or a minimalist eye shape focuses attention on the glowing top section. Conceptual visual metaphor for the first few lines mattering far more than the rest of the page.',
};

function buildPrompt(slug, frontmatter) {
  const subject =
    SUBJECT_OVERRIDES[slug] ||
    `Abstract geometric illustration representing the concept: "${frontmatter.title}". ${
      frontmatter.description ? `Theme: ${frontmatter.description}` : ''
    }`;
  return `${subject}\n\nStyle requirements: ${BASE_STYLE}`;
}

async function loadPost(slug) {
  const filePath = path.join(postsDir, `${slug}.md`);
  const raw = await fs.readFile(filePath, 'utf-8');
  const { data } = matter(raw);
  return { filePath, data, raw };
}

async function generateOne(slug, { force = false } = {}) {
  const { data } = await loadPost(slug);
  const outPath = path.join(coversDir, `${slug}.png`);

  if (!force) {
    try {
      await fs.access(outPath);
      console.log(`  → ${slug}: cover already exists, skipping (use --force to regenerate)`);
      return { slug, skipped: true };
    } catch {
      // file does not exist, continue
    }
  }

  const prompt = buildPrompt(slug, data);
  console.log(`  → ${slug}: generating cover...`);
  console.log(`     prompt: ${prompt.slice(0, 120)}...`);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1536x1024',
    quality: 'high',
    n: 1,
  });

  const b64 = response.data[0].b64_json;
  if (!b64) throw new Error(`No image data returned for ${slug}`);

  await fs.mkdir(coversDir, { recursive: true });
  await fs.writeFile(outPath, Buffer.from(b64, 'base64'));
  const stat = await fs.stat(outPath);
  console.log(`     ✓ saved ${path.relative(repoRoot, outPath)} (${(stat.size / 1024).toFixed(1)} KB)`);

  // Update frontmatter to include heroImage if missing
  await ensureHeroImageInFrontmatter(slug);

  return { slug, generated: true };
}

async function ensureHeroImageInFrontmatter(slug) {
  const { filePath, data, raw } = await loadPost(slug);
  if (data.heroImage) return;
  const updated = { ...data, heroImage: `/covers/${slug}.png` };
  const content = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
  const newRaw = matter.stringify(content, updated);
  await fs.writeFile(filePath, newRaw);
  console.log(`     ✓ added heroImage to ${slug}.md frontmatter`);
}

async function listPostSlugs() {
  const files = await fs.readdir(postsDir);
  return files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in .env.local');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const all = args.includes('--all');
  const slugs = args.filter((a) => !a.startsWith('--'));

  let targets;
  if (all) {
    targets = await listPostSlugs();
  } else if (slugs.length > 0) {
    targets = slugs;
  } else {
    console.error('Usage: node scripts/generate-cover.mjs <slug> | --all [--force]');
    process.exit(1);
  }

  console.log(`Generating covers for ${targets.length} post(s)...\n`);
  for (const slug of targets) {
    try {
      await generateOne(slug, { force });
    } catch (err) {
      console.error(`  ✗ ${slug}: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
