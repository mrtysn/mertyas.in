import { Link } from "wouter";
import { FULL_NAME } from "../utils/constants";

function Header() {
  return (
    <nav>
      <ul>
        <li>{FULL_NAME}</li>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/blog">Blog</Link>
        </li>
        <li>
          <Link href="/projects">Projects</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
