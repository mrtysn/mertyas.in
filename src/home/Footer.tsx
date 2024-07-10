import { Link } from "wouter";
import Outlink from "../utils/Outlink";

function Footer() {
  return (
    <footer>
      <hr className="mt-1 mb-1" />
      <small>
        Made with <span className="p-0 colorHeart">❤</span> in{" "}
        <span className="text-secondary">İstanbul, Turkey</span> by{" "}
        <Link href="/about">Mert Yaşin</Link>
      </small>
      <div className="text-right float-right sticky">
        <small>
          <Outlink text="source" link="https://github.com/mrtysn/mertyas.in" />
        </small>
      </div>
    </footer>
  );
}

export default Footer;
