import { md } from './markdown';
import { Post } from './types';
import { parseFrontmatter } from './frontmatter';

// Vite's glob import - loads all .md files at build time
const postFiles = import.meta.glob<string>('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export function getAllPosts(): Post[] {
  const posts = Object.entries(postFiles).map(([filepath, content]) => {
    // Extract filename and check if it has date prefix
    const filename = filepath.split('/').pop()!;
    const hasDatePrefix = /^\d{4}-\d{2}-\d{2}-/.test(filename);

    // Extract slug: "2024-12-25-thirty.md" -> "thirty" or "debug.md" -> "debug"
    const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');

    const { frontmatter, content: markdownContent } = parseFrontmatter(content);

    return {
      slug,
      frontmatter,
      content: markdownContent,
      html: md.render(markdownContent),
      hasDatePrefix,
    };
  });

  // In production: only dated posts, no drafts
  // In dev: all posts (dated and undated)
  const filtered = import.meta.env.PROD
    ? posts.filter((p) => p.hasDatePrefix && !p.frontmatter.draft)
    : posts.filter((p) => !p.frontmatter.draft);

  // Sort: dev-only posts first (alphabetically), then dated posts (by date)
  return filtered.sort((a, b) => {
    // Dev-only posts come first
    if (!a.hasDatePrefix && b.hasDatePrefix) return -1;
    if (a.hasDatePrefix && !b.hasDatePrefix) return 1;

    // Both dev-only: sort alphabetically by slug
    if (!a.hasDatePrefix && !b.hasDatePrefix) {
      return a.slug.localeCompare(b.slug);
    }

    // Both dated: sort by date (newest first)
    const dateA = a.frontmatter.date || '';
    const dateB = b.frontmatter.date || '';
    return dateB.localeCompare(dateA);
  });
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) =>
    post.frontmatter.tags.includes(tag)
  );
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts();
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count); // Sort by count, descending
}
