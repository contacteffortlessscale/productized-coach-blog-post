#!/usr/bin/env node
// IndexNow ping — notifies Bing, Yandex, Naver, Seznam of new/updated URLs.
// Pulls all blog post URLs from the content collection and POSTs them to api.indexnow.org.
// Run manually after publishing new posts: `node scripts/indexnow-ping.mjs`

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const HOST = 'blog.productizedcoach.com';
const KEY = '77a9d4d02925d9df60735916b70161a4';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const POSTS_DIR = path.join(repoRoot, 'src/content/blog');

async function listPostUrls() {
  const files = await fs.readdir(POSTS_DIR);
  const slugs = files
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => f.replace(/\.(md|mdx)$/, ''));
  return [
    `https://${HOST}/`,
    ...slugs.map((s) => `https://${HOST}/blog/${s}/`),
  ];
}

async function main() {
  const urlList = await listPostUrls();
  console.log(`Pinging IndexNow for ${urlList.length} URLs...`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log(`IndexNow response: ${r.status} ${r.statusText}`);
  if (r.status === 200 || r.status === 202) {
    console.log('All URLs submitted. Bing/Yandex will crawl within hours.');
  } else {
    const body = await r.text();
    console.error('Response body:', body);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
