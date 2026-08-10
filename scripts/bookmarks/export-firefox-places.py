import sqlite3, json, shutil, sys, os, glob, datetime

prof = glob.glob(os.path.expanduser("~/Library/Application Support/Firefox/Profiles/*.default-release"))
if not prof: sys.exit("no default-release profile found")
src = os.path.join(prof[0], "places.sqlite")
tmp = "/private/tmp/claude-501/-Users-mrtysn-dev/3ea2faad-85cf-41fa-b4df-80d15e82cf40/scratchpad/places-copy.sqlite"
for suffix in ("", "-wal", "-shm"):
    if os.path.exists(src + suffix): shutil.copy2(src + suffix, tmp + suffix)

con = sqlite3.connect(f"file:{tmp}?immutable=0", uri=True)
con.row_factory = sqlite3.Row
rows = con.execute("""
  SELECT b.id, b.type, b.parent, b.position, b.title, b.dateAdded, b.lastModified, b.guid, p.url
  FROM moz_bookmarks b LEFT JOIN moz_places p ON b.fk = p.id
  ORDER BY b.parent, b.position
""").fetchall()
con.close()

by_parent = {}
node_of = {}
for r in rows:
    by_parent.setdefault(r["parent"], []).append(r)
    node_of[r["id"]] = r

def build(r):
    n = {"guid": r["guid"], "title": r["title"] or "",
         "index": r["position"], "dateAdded": r["dateAdded"],
         "lastModified": r["lastModified"], "id": r["id"]}
    if r["type"] == 1:
        n["typeCode"] = 1; n["type"] = "text/x-moz-place"; n["uri"] = r["url"]
    elif r["type"] == 2:
        n["typeCode"] = 2; n["type"] = "text/x-moz-place-container"
        n["children"] = [build(c) for c in by_parent.get(r["id"], [])]
    else:
        n["typeCode"] = 3; n["type"] = "text/x-moz-place-separator"
    return n

root_row = node_of.get(1)
root = build(root_row) if root_row else {"children": []}
root["title"] = ""; root["root"] = "placesRoot"

stamp = datetime.datetime.now().strftime("%Y-%m-%d_%H%M")
out = os.path.expanduser(f"~/Downloads/firefox-bookmarks-{stamp}.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(root, f, ensure_ascii=False)

def count(n):
    if n.get("typeCode") == 1: return 1
    return sum(count(c) for c in n.get("children", []))
def folders(n):
    return (1 if n.get("typeCode") == 2 else 0) + sum(folders(c) for c in n.get("children", []))

print(f"{out}")
print(f"bookmarks: {count(root)}  folders: {folders(root)}  bytes: {os.path.getsize(out)}")
for c in root.get("children", []):
    print(f"  {c.get('guid'):<14} {c.get('title') or '(untitled)':<20} {count(c):>5} bookmarks")
