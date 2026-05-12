/**
 * Estimate reading time for a blog post.
 * 220 wpm is the median adult reading speed for non-fiction.
 */
export function estimateReadTime(rawBody: string): { minutes: number; words: number } {
  // Strip frontmatter, markdown syntax, code blocks
  const stripped = rawBody
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#>*_~|-]/g, ' ');
  const words = stripped.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return { minutes, words };
}
