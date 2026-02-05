import { useRoute, Link } from "wouter";
import { useEffect } from "react";
import { getPostBySlug } from "../utils/posts";
import { updateMetaTags } from "../utils/meta";

function Post() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug;
  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => {
    if (post) {
      updateMetaTags({
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        url: `https://mertyas.in/${post.slug}`,
        type: 'article',
        date: post.frontmatter.date,
        image: post.frontmatter.image,
      });
    }
  }, [post]);

  if (!slug) {
    return <div>Invalid post URL</div>;
  }

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
        {post.frontmatter.date && (
          <p>
            <small>{post.frontmatter.date}</small>
          </p>
        )}
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
