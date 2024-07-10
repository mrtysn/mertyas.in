import { Link } from "wouter";

function Header() {
  return (
    <nav>
      <ul>
        <li>Mert Yaşin</li>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/blog">Blog</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
