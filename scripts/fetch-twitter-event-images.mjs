/**
 * One-off / maintenance: find pbs.twimg.com URLs in `src/data/events/*.md`,
 * download JPEGs to `public/images/events/<event-id>/<mediaId>.jpg`, replace
 * URLs in-place with `/images/events/<event-id>/<mediaId>.jpg`.
 *
 * Usage: node scripts/fetch-twitter-event-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eventsDir = path.join(root, "src/data/events");

/** Matches Twitter image URLs used in frontmatter and markdown. */
const TWIMG_RE =
  /https:\/\/pbs\.twimg\.com\/media\/([A-Za-z0-9_-]+)\?(?:format=jpg)(?:&name=[A-Za-z0-9]+)?/g;

async function fetchToFile(url, destPath) {
  if (fs.existsSync(destPath)) {
    console.log("exists", destPath);
    return;
  }
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CursorSaudiSite/1.0; +https://cursorsaudi.com)",
      Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  console.log("wrote", destPath, `(${buf.length} bytes)`);
}

async function main() {
  for (const name of fs.readdirSync(eventsDir)) {
    if (!name.endsWith(".md")) continue;
    const eventId = name.replace(/\.md$/, "");
    const fp = path.join(eventsDir, name);
    let text = fs.readFileSync(fp, "utf8");

    const matches = [...text.matchAll(new RegExp(TWIMG_RE.source, "g"))];
    if (matches.length === 0) continue;

    const uniqueUrls = [...new Set(matches.map((m) => m[0]))];
    for (const url of uniqueUrls) {
      const idMatch = url.match(/\/media\/([A-Za-z0-9_-]+)\?/);
      if (!idMatch) continue;
      const mediaId = idMatch[1];
      const dest = path.join(root, "public/images/events", eventId, `${mediaId}.jpg`);
      await fetchToFile(url, dest);
      const local = `/images/events/${eventId}/${mediaId}.jpg`;
      text = text.split(url).join(local);
    }

    fs.writeFileSync(fp, text);
    console.log("updated", fp);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
