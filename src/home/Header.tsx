import { Link } from "wouter";
import ThemeSelector from "../utils/ThemeSelector";
import { FULL_NAME } from "../utils/Constants";

function Header() {
  return (
    <nav>
      <ul>
        <li>{FULL_NAME}</li>
        <li className="float-right sticky">
          <ThemeSelector />
        </li>
        <li>
          <Link href="/">About</Link>
        </li>
        <li>
          <Link href="/blog">Blog</Link>
        </li>
        <li>
          <Link href="/projects">Projects</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
