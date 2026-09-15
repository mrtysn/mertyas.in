#!/usr/bin/env python3
# DESC: Copy each bookmark's favicon out of the local Firefox profile into public/favicons
"""Favicons for the bookmarks page, taken from Firefox's own icon cache.

Firefox already holds an icon for most bookmarked sites, so nothing is fetched
from the network: no request per site, and no third-party favicon service that
would learn every bookmarked domain from each visitor.

Writes:
  public/favicons/<hash>.<ext>        one file per distinct icon, deduplicated
  src/bookmarks/data/favicons.json    {"icons": {bookmark URL: icon path},
                                       "fadesOn": {icon path: "dark" | "light"}}

"fadesOn" names the theme whose page background most of an icon's visible
pixels would disappear into — a black logo on the dark theme, a white one on
the light theme — so the page can give just those icons a contrasting tile.

Both are owned by this script; re-running replaces them and removes icons no
bookmark uses any more. Re-run after importing bookmarks.
"""

import argparse
import glob
import hashlib
import json
import os
import shutil
import sqlite3
import sys
import struct
import tempfile
import zlib
from urllib.parse import urlsplit

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(REPO, "src", "bookmarks", "data", "bookmarks.json")
MAP = os.path.join(REPO, "src", "bookmarks", "data", "favicons.json")
OUT_DIR = os.path.join(REPO, "public", "favicons")

# Where Firefox keeps profiles, per platform; the default-release profile is the
# one a normal install uses.
PROFILE_GLOBS = [
    "~/Library/Application Support/Firefox/Profiles/*.default-release",
    "~/.mozilla/firefox/*.default-release",
]

VECTOR_WIDTH = 65535  # Firefox's width for SVG icons

# The site's page backgrounds (classless.css --cbg), which icons sit on.
GROUNDS = {"dark": (0x25, 0x22, 0x20), "light": (0xFF, 0xFF, 0xFF)}
# An icon fades on a ground when at least this share of its visible pixels sit
# below this contrast ratio against it.
FADE_CONTRAST = 1.6
FADE_SHARE = 0.7


def find_profile(explicit: str | None) -> str:
    if explicit:
        return os.path.expanduser(explicit)
    found = [p for g in PROFILE_GLOBS for p in glob.glob(os.path.expanduser(g))]
    if len(found) != 1:
        listing = "\n  ".join(found) or "(none)"
        sys.exit(f"expected one default-release Firefox profile, found:\n  {listing}\npass --profile")
    return found[0]


def extension(blob: bytes) -> str | None:
    if blob.startswith(b"\x89PNG"):
        return "png"
    if blob.startswith(b"\x00\x00\x01\x00"):
        return "ico"
    if blob.startswith(b"\xff\xd8"):
        return "jpg"
    if blob.startswith(b"GIF8"):
        return "gif"
    if blob[:4] == b"RIFF" and blob[8:12] == b"WEBP":
        return "webp"
    head = blob[:256].lstrip().lower()
    if head.startswith(b"<svg") or (head.startswith(b"<?xml") and b"<svg" in blob[:1024].lower()):
        return "svg"
    return None


def luminance(rgb: tuple[int, int, int]) -> float:
    def channel(v: int) -> float:
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def png_pixels(blob: bytes) -> list[tuple[int, int, int, int]] | None:
    """RGBA pixels of a non-interlaced PNG, standard library only. None for
    anything this does not decode; such an icon just gets no tile."""
    if not blob.startswith(b"\x89PNG\r\n\x1a\n"):
        return None
    pos, idat, palette, trns = 8, b"", None, None
    width = height = depth = ctype = interlace = None
    while pos + 8 <= len(blob):
        length, kind = struct.unpack(">I4s", blob[pos:pos + 8])
        data = blob[pos + 8:pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            width, height, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", data)
        elif kind == b"PLTE":
            palette = [tuple(data[i:i + 3]) for i in range(0, len(data), 3)]
        elif kind == b"tRNS":
            trns = data
        elif kind == b"IDAT":
            idat += data
        elif kind == b"IEND":
            break
    if width is None or interlace or depth not in (1, 2, 4, 8, 16) or width * height > 512 * 512:
        return None
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(ctype)
    if channels is None or (depth < 8 and ctype not in (0, 3)):
        return None
    try:
        raw = zlib.decompress(idat)
    except zlib.error:
        return None
    bits = channels * depth
    stride = (width * bits + 7) // 8
    bpp = max(1, bits // 8)
    rows, prev, i = [], bytearray(stride), 0
    for _ in range(height):
        if i + 1 + stride > len(raw):
            return None
        kind, line = raw[i], bytearray(raw[i + 1:i + 1 + stride])
        i += 1 + stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if kind == 1:
                line[x] = (line[x] + a) & 255
            elif kind == 2:
                line[x] = (line[x] + b) & 255
            elif kind == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif kind == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line)
        prev = line

    def samples(line: bytearray) -> list[int]:
        if depth == 8:
            return list(line)
        if depth == 16:
            return list(line[0::2])
        out, mask = [], (1 << depth) - 1
        for byte in line:
            for shift in range(8 - depth, -1, -depth):
                out.append((byte >> shift) & mask)
        return out

    pixels = []
    for line in rows:
        v = samples(line)
        for x in range(width):
            px = v[x * channels:(x + 1) * channels]
            if ctype == 6:
                pixels.append(tuple(px))
            elif ctype == 2:
                pixels.append((*px, 255))
            elif ctype == 4:
                pixels.append((px[0], px[0], px[0], px[1]))
            elif ctype == 0:
                g = px[0] * 255 // ((1 << depth) - 1)
                pixels.append((g, g, g, 255))
            elif ctype == 3:
                if palette is None or px[0] >= len(palette):
                    return None
                alpha = trns[px[0]] if trns is not None and px[0] < len(trns) else 255
                pixels.append((*palette[px[0]], alpha))
    return pixels


NAMED = {"black": (0, 0, 0), "white": (255, 255, 255)}


def svg_colors(blob: bytes) -> list[tuple[int, int, int, int]] | None:
    """Painted colours of an SVG icon, one entry per declaration. None when it
    cannot be judged: it adapts to the colour scheme itself, or paints with a
    colour this does not read (gradients, currentColor, other names)."""
    import re

    text = blob.decode("utf-8", "replace")
    if "prefers-color-scheme" in text:
        return None
    colors = []
    for value in re.findall(r'(?:fill|stroke)\s*[:=]\s*["\']?\s*([^;"\'\s>]+)', text):
        v = value.strip().lower()
        if v in ("none", "transparent"):
            continue
        if v in NAMED:
            colors.append((*NAMED[v], 255))
        elif re.fullmatch(r"#[0-9a-f]{3}", v):
            colors.append((*(int(c * 2, 16) for c in v[1:]), 255))
        elif re.fullmatch(r"#[0-9a-f]{6}", v):
            colors.append((int(v[1:3], 16), int(v[3:5], 16), int(v[5:7], 16), 255))
        else:
            return None
    # A shape with no fill anywhere paints black, the SVG default.
    return colors or [(0, 0, 0, 255)]


def fades_on(blob: bytes) -> str | None:
    """The theme whose background would swallow this icon, if any."""
    svg = extension(blob) == "svg"
    pixels = svg_colors(blob) if svg else png_pixels(blob)
    if not pixels:
        return None
    visible = [p for p in pixels if p[3] >= 128]
    if len(visible) < len(pixels) * 0.05:
        return None
    # A PNG is judged by area, pixel by pixel. An SVG's colours come without
    # area — one orange square can outweigh three white details — so it fades
    # only when every colour it paints does.
    share = 1.0 if svg else FADE_SHARE
    for theme, ground in GROUNDS.items():
        g = luminance(ground)
        faint = 0
        for r, gr, b, _ in visible:
            l = luminance((r, gr, b))
            hi, lo = max(l, g), min(l, g)
            if (hi + 0.05) / (lo + 0.05) < FADE_CONTRAST:
                faint += 1
        if faint >= len(visible) * share:
            return theme
    return None


def best(rows: list[tuple[int, bytes]]) -> bytes:
    """Vector if there is one, else the smallest at least 32px — sharp at 16px on
    a 2x screen without shipping a large image — else the largest there is."""
    vector = [b for w, b in rows if w == VECTOR_WIDTH]
    if vector:
        return vector[0]
    big_enough = sorted((w, b) for w, b in rows if (w or 0) >= 32)
    if big_enough:
        return big_enough[0][1]
    return max(rows, key=lambda r: r[0] or 0)[1]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--profile", help="Firefox profile directory (default: the one default-release profile)")
    args = ap.parse_args()

    profile = find_profile(args.profile)
    source = os.path.join(profile, "favicons.sqlite")
    if not os.path.exists(source):
        sys.exit(f"no favicons.sqlite in {profile}")

    with open(DATA) as f:
        urls = sorted({b["url"] for b in json.load(f)["flatBookmarks"]})

    with tempfile.TemporaryDirectory() as tmp:
        # Firefox holds the database open; read a copy, WAL included.
        for suffix in ("", "-wal"):
            if os.path.exists(source + suffix):
                shutil.copy2(source + suffix, os.path.join(tmp, "favicons.sqlite" + suffix))
        con = sqlite3.connect(os.path.join(tmp, "favicons.sqlite"))
        query = """
            SELECT i.width, i.data FROM moz_pages_w_icons p
            JOIN moz_icons_to_pages ip ON ip.page_id = p.id
            JOIN moz_icons i ON i.id = ip.icon_id
            WHERE p.page_url = ? AND i.data IS NOT NULL
        """

        mapping: dict[str, str] = {}
        fades: dict[str, str] = {}
        written: set[str] = set()
        os.makedirs(OUT_DIR, exist_ok=True)
        for url in urls:
            rows = con.execute(query, (url,)).fetchall()
            if not rows:
                # Most icons are recorded against the site root, not each page.
                parts = urlsplit(url)
                if parts.scheme in ("http", "https") and parts.netloc:
                    rows = con.execute(query, (f"{parts.scheme}://{parts.netloc}/",)).fetchall()
            if not rows:
                continue
            blob = best(rows)
            ext = extension(blob)
            if not ext:
                continue
            name = f"{hashlib.sha1(blob).hexdigest()[:16]}.{ext}"
            path = os.path.join(OUT_DIR, name)
            if name not in written and not os.path.exists(path):
                with open(path, "wb") as out:
                    out.write(blob)
            if name not in written:
                theme = fades_on(blob)
                if theme:
                    fades[f"/favicons/{name}"] = theme
            written.add(name)
            mapping[url] = f"/favicons/{name}"
        con.close()

    for stale in sorted(set(os.listdir(OUT_DIR)) - written):
        os.remove(os.path.join(OUT_DIR, stale))

    with open(MAP, "w") as f:
        json.dump({"icons": mapping, "fadesOn": fades}, f, indent=1, sort_keys=True, ensure_ascii=False)
        f.write("\n")

    size = sum(os.path.getsize(os.path.join(OUT_DIR, n)) for n in written)
    by_theme = {t: sum(1 for v in fades.values() if v == t) for t in GROUNDS}
    print(f"{len(mapping)} of {len(urls)} bookmarks have a favicon; {len(written)} files, {size / 1024:.0f} KB")
    print(f"icons that would fade into the page: {by_theme['dark']} on dark, {by_theme['light']} on light")


if __name__ == "__main__":
    main()
