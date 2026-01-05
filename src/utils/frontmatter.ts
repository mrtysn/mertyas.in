import { PostFrontmatter } from './types';

export function parseFrontmatter(content: string): {
  frontmatter: PostFrontmatter;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found');
  }

  const [, yamlContent, markdownContent] = match;

  const frontmatter: Partial<PostFrontmatter> = {};
  const lines = yamlContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (key === 'tags') {
      // Parse array: ["tag1", "tag2"] or [tag1, tag2]
      const arrayMatch = value.match(/\[(.*)\]/);
      if (arrayMatch) {
        frontmatter.tags = arrayMatch[1]
          .split(',')
          .map((t) => t.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
    } else if (key === 'draft') {
      frontmatter.draft = value === 'true';
    } else {
      // Remove quotes from strings
      frontmatter[key as keyof PostFrontmatter] = value.replace(
        /^["']|["']$/g,
        ''
      ) as never;
    }
  }

  return {
    frontmatter: frontmatter as PostFrontmatter,
    content: markdownContent,
  };
}
