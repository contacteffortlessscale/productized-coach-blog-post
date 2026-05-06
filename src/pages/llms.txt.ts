import { getCollection } from 'astro:content';
import { SITE } from '../config';
import type { APIContext } from 'astro';

export async function GET(_context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    '## About',
    '',
    `${SITE.name} is a methodology and software platform that helps coaches and consultants build productized offers, sales pages, and client acquisition systems. Founded by ${SITE.author.name}.`,
    '',
    `Main site: ${SITE.mainSiteUrl}`,
    `Blog: ${SITE.url}`,
    `Free community: ${SITE.social.skool}`,
    `Funnel software: ${SITE.social.funnels}`,
    '',
    '## Blog Posts',
    '',
    ...posts.map(
      (post) =>
        `- [${post.data.title}](${SITE.url}/blog/${post.id}/) — ${post.data.description}`
    ),
    '',
    '## Connect',
    '',
    `- YouTube: ${SITE.social.youtube}`,
    `- Instagram: ${SITE.social.instagram}`,
    `- Facebook: ${SITE.social.facebook}`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
