import type { Post } from '../../src/utils/types.js';
import { FeedConfig, escapeXml, wrapCdata, formatRfc822Date, makeUrlsAbsolute } from './shared.js';

export function generateRss(posts: Post[], config: FeedConfig): string {
  // lastBuildDate is the current date/time when feed is generated
  const lastBuildDate = formatRfc822Date(new Date().toISOString());

  const items = posts.map((post) => {
    const postUrl = `${config.siteUrl}/${post.slug}`;
    const categories = post.frontmatter.tags
      .map((tag) => `    <category>${escapeXml(tag)}</category>`)
      .join('\n');

    // Convert relative URLs to absolute URLs for feed readers
    const absoluteHtml = makeUrlsAbsolute(post.html, config.siteUrl);

    return `  <item>
    <title>${escapeXml(post.frontmatter.title)}</title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <pubDate>${formatRfc822Date(post.frontmatter.date)}</pubDate>
    <description>${wrapCdata(absoluteHtml)}</description>
${categories}
  </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${config.siteUrl}</link>
    <description>${escapeXml(config.description)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${config.feedUrl}" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;
}
