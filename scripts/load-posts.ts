import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatter } from '../src/utils/frontmatter.js';
import { md } from '../src/utils/markdown.js';
import type { Post } from '../src/utils/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load all posts from src/posts/ directory
 * Compatible with Node.js environment (can't use Vite's import.meta.glob)
 */
export function loadPosts(includeDrafts = false, limit?: number): Post[] {
  const postsDir = path.join(__dirname, '../src/posts');

  // Read all .md files from posts directory
  const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.md'));

  const posts: Post[] = files
    .filter((filename) => {
      // Only include files with date prefix (YYYY-MM-DD-) for feeds
      return /^\d{4}-\d{2}-\d{2}-/.test(filename);
    })
    .map((filename) => {
      const filepath = path.join(postsDir, filename);
      const content = fs.readFileSync(filepath, 'utf-8');

      // Extract slug from filename (remove date prefix and .md extension)
      const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');

      // Parse frontmatter and content
      const { frontmatter, content: markdownContent } = parseFrontmatter(content);

      // Render markdown to HTML
      const html = md.render(markdownContent);

      return {
        slug,
        frontmatter,
        content: markdownContent,
        html,
      };
    });

  // Filter drafts if not including them
  const filteredPosts = includeDrafts
    ? posts
    : posts.filter((post) => !post.frontmatter.draft);

  // Sort by date (newest first)
  const sortedPosts = filteredPosts.sort((a, b) => {
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
  });

  // Apply limit if specified
  return limit ? sortedPosts.slice(0, limit) : sortedPosts;
}
