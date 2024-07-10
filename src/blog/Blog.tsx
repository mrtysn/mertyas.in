import { Link } from "wouter";

function Blog() {
  return (
    <div>
      <h2>Posts</h2>
      <ul>
        <li>
          <Link href="/blog/thirty">Thirty</Link>
        </li>
      </ul>
    </div>
  );
}

export default Blog;
