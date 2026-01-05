import { Link } from "wouter";
import { getAllTags } from "../utils/posts";

function Tags() {
  const tags = getAllTags();

  return (
    <div>
      <h2>Tags</h2>
      {tags.length === 0 ? (
        <p>No tags yet.</p>
      ) : (
        <ul>
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link href={`/tags/${tag}`}>
                <strong>{tag}</strong>
              </Link>{" "}
              <small>({count} {count === 1 ? "post" : "posts"})</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Tags;
