# Productized Coach Blog

The blog for [productizedcoach.com](https://productizedcoach.com), built for AI search discoverability (ChatGPT, Perplexity, Claude, Google AI Overviews).

## Stack

- [Astro 5](https://astro.build) — static site generator, ships pure HTML
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- Markdown / MDX content collections
- RSS, sitemap, `llms.txt`, Schema.org JSON-LD baked in

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build to ./dist
npm run preview  # preview production build
```

## Adding a new post

Drop a `.md` file in `src/content/blog/` with this frontmatter:

```yaml
---
title: "Your post title"
description: "Short blurb (≈150 chars) — used for SEO + social cards."
pubDate: 2026-05-07
author: "Zac Hansen"
tags: ["productized coaching"]
draft: false
---

Body of the post in Markdown.
```

Filename becomes the URL slug: `my-post.md` → `/blog/my-post/`.

## SEO / AI-discoverability checklist

- ✅ Static-rendered HTML on every page
- ✅ `robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, etc.
- ✅ `/llms.txt` — emerging standard for LLM-friendly site summaries
- ✅ `sitemap-index.xml` auto-generated
- ✅ `/rss.xml` feed
- ✅ Schema.org JSON-LD: `Organization` on every page, `Article` on each post
- ✅ Open Graph + Twitter Card metadata
- ✅ Canonical URLs

## Deploying

Connect this repo to Vercel. It will auto-detect Astro and deploy on push.
DNS: point `blog.productizedcoach.com` CNAME to `cname.vercel-dns.com`.
