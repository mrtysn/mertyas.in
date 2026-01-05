export interface FeedConfig {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  author: {
    name: string;
    email?: string;
  };
}

/**
 * Escape special XML characters: &, <, >, ", '
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wrap HTML content in CDATA section, handling nested ]]> sequences
 */
export function wrapCdata(html: string): string {
  // If HTML contains ]]>, split it to prevent breaking CDATA
  const escaped = html.replace(/]]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${escaped}]]>`;
}

/**
 * Convert relative URLs in HTML to absolute URLs
 * Handles both <img src="..."> and <a href="..."> tags
 */
export function makeUrlsAbsolute(html: string, siteUrl: string): string {
  // Remove trailing slash from siteUrl for consistent concatenation
  const baseUrl = siteUrl.replace(/\/$/, '');

  // Convert relative src attributes (images, etc.)
  let result = html.replace(
    /(<(?:img|script|link)[^>]+\s)src=["'](?!https?:\/\/)([^"']+)["']/gi,
    (match, prefix, url) => {
      const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      return `${prefix}src="${absoluteUrl}"`;
    }
  );

  // Convert relative href attributes (links)
  result = result.replace(
    /(<a[^>]+\s)href=["'](?!https?:\/\/)(?![#])([^"']+)["']/gi,
    (match, prefix, url) => {
      const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      return `${prefix}href="${absoluteUrl}"`;
    }
  );

  return result;
}

/**
 * Format date string to RFC 822 format (used by RSS 2.0)
 * Example: "Wed, 25 Dec 2024 00:00:00 GMT"
 */
export function formatRfc822Date(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toUTCString();
}

/**
 * Format date string to RFC 3339 format (used by Atom)
 * Example: "2024-12-25T00:00:00Z"
 */
export function formatRfc3339Date(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toISOString();
}
