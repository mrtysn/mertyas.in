import { useRoute, Link } from "wouter";
import { getPostsByTag } from "../utils/posts";

function Tag() {
  const [, params] = useRoute("/tags/:tag");
  const tag = params?.tag;

  if (!tag) {
    return <div>Invalid tag</div>;
  }

  const posts = getPostsByTag(tag);

  return (
    <div>
      <h2>Posts tagged "{tag}"</h2>
      {posts.length === 0 ? (
        <p>No posts found with this tag.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/${post.slug}`}>
                <strong>{post.frontmatter.title}</strong>
              </Link>
              <br />
              <small>
                {post.frontmatter.date} - {post.frontmatter.description}
              </small>
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link href="/tags">← All tags</Link> | <Link href="/posts">← All posts</Link>
      </p>
    </div>
  );
}

export default Tag;
