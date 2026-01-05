export interface PostFrontmatter {
  title: string;
  date?: string;
  description: string;
  tags: string[];
  draft?: boolean;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  html: string;
}
