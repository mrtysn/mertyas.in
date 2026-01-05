import { Link } from "wouter";
import { getAllPosts } from "../utils/posts";

function Posts() {
  const posts = getAllPosts();

  return (
    <div>
      <h2>Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/${post.slug}`}>
                <strong>{post.frontmatter.title}</strong>
              </Link>
              <br />
              <small>
                {post.frontmatter.date ? `${post.frontmatter.date} - ` : ''}
                {post.frontmatter.description}
              </small>
              {post.frontmatter.tags.length > 0 && (
                <>
                  <br />
                  <small>Tags: {post.frontmatter.tags.join(", ")}</small>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Posts;
