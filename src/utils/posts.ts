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
    // Extract slug from filename: "../posts/2024-12-25-thirty.md" -> "thirty"
    const filename = filepath.split('/').pop()!;
    const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');

    const { frontmatter, content: markdownContent } = parseFrontmatter(content);

    return {
      slug,
      frontmatter,
      content: markdownContent,
      html: md.render(markdownContent),
    };
  });

  // Filter out drafts in production
  const filtered = import.meta.env.PROD
    ? posts.filter((p) => !p.frontmatter.draft)
    : posts;

  // Sort by date, newest first
  return filtered.sort((a, b) =>
    b.frontmatter.date.localeCompare(a.frontmatter.date)
  );
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
