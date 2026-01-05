import type { Post } from '../../src/utils/types.js';
import { FeedConfig, escapeXml, wrapCdata, formatRfc3339Date, makeUrlsAbsolute } from './shared.js';

export function generateAtom(posts: Post[], config: FeedConfig): string {
  // Feed updated date is the most recent post date
  const latestDate = posts.length > 0 ? posts[0].frontmatter.date : new Date().toISOString().split('T')[0];

  const entries = posts.map((post) => {
    const postUrl = `${config.siteUrl}/${post.slug}`;
    const categories = post.frontmatter.tags
      .map((tag) => `    <category term="${escapeXml(tag)}" />`)
      .join('\n');

    // Convert relative URLs to absolute URLs for feed readers
    const absoluteHtml = makeUrlsAbsolute(post.html, config.siteUrl);

    return `  <entry>
    <title>${escapeXml(post.frontmatter.title)}</title>
    <link href="${postUrl}" rel="alternate" />
    <id>${postUrl}/</id>
    <updated>${formatRfc3339Date(post.frontmatter.date)}</updated>
    <summary>${escapeXml(post.frontmatter.description)}</summary>
    <content type="html">${wrapCdata(absoluteHtml)}</content>
${categories}
    <author>
      <name>${escapeXml(config.author.name)}</name>
    </author>
  </entry>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.title)}</title>
  <link href="${config.feedUrl}" rel="self" />
  <link href="${config.siteUrl}" rel="alternate" />
  <id>${config.siteUrl}/</id>
  <updated>${formatRfc3339Date(latestDate)}</updated>
  <subtitle>${escapeXml(config.description)}</subtitle>
  <author>
    <name>${escapeXml(config.author.name)}</name>
  </author>
${entries.join('\n')}
</feed>`;
}
