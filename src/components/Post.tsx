import { useRoute, Link } from "wouter";
import { getPostBySlug } from "../utils/posts";

function Post() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug;

  if (!slug) {
    return <div>Invalid post URL</div>;
  }

  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div>
        <h2>Post not found</h2>
        <p>
          <Link href="/posts">← Back to all posts</Link>
        </p>
      </div>
    );
  }

  return (
    <article>
      <header>
        <h1>{post.frontmatter.title}</h1>
        <p>
          <small>{post.frontmatter.date}</small>
        </p>
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      {post.frontmatter.tags.length > 0 && (
        <p>
          <small>Tags: {post.frontmatter.tags.join(", ")}</small>
        </p>
      )}
      <footer>
        <Link href="/posts">← Back to all posts</Link>
      </footer>
    </article>
  );
}

export default Post;
