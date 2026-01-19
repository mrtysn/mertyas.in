import { Link } from "wouter";
import ThemeSelector from "../utils/ThemeSelector";
import { FULL_NAME } from "../utils/constants";

function Header() {
  return (
    <nav>
      <ul>
        <li>{FULL_NAME}</li>
        <li className="float-right sticky no-select">
          <ThemeSelector />
        </li>
        <li>
          <Link href="/">About</Link>
        </li>
        <li>
          <Link href="/posts">Posts</Link>
        </li>
        <li>
          <Link href="/projects">Projects</Link>
        </li>
        <li>
          <Link href="/bookmarks">Bookmarks</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
