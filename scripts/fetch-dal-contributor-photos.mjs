#!/usr/bin/env node
/**
 * Downloads Dal contributor avatars from LinkedIn CDN URLs.
 *
 * LinkedIn profile pages block unauthenticated scrapers, so paste direct
 * `https://media.licdn.com/dms/image/...` URLs (from DevTools → Network while
 * viewing the profile when logged in, or from “Copy image address” on the photo).
 *
 * 1. cp scripts/data/dal-photo-urls.example.json scripts/data/dal-photo-urls.json
 * 2. Fill in URLs (gitignored)
 * 3. pnpm fetch-dal-photos
 */

import {
  readFileSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "data", "dal-photo-urls.json");
const outDir = path.join(__dirname, "..", "public", "images", "partners", "dal");

if (!existsSync(jsonPath)) {
  console.error(
    "Missing scripts/data/dal-photo-urls.json — copy dal-photo-urls.example.json and add media.licdn.com URLs."
  );
  process.exit(1);
}

const map = JSON.parse(readFileSync(jsonPath, "utf8"));
mkdirSync(outDir, { recursive: true });

function isPng(buf) {
  return buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
}

for (const [slug, url] of Object.entries(map)) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) continue;
  if (!url.includes("licdn.com")) {
    console.warn(`Skip ${slug}: expected a LinkedIn CDN URL (media.licdn.com)`);
    continue;
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    console.warn(`Skip ${slug}: HTTP ${res.status}`);
    continue;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const destJpg = path.join(outDir, `${slug}.jpg`);
  const tmp = path.join(outDir, `.tmp-${slug}`);

  if (isPng(buf)) {
    writeFileSync(tmp, buf);
    try {
      execFileSync("magick", [tmp, "-quality", "90", destJpg]);
    } catch {
      console.warn(
        `Skip ${slug}: install ImageMagick (magick) to convert PNG, or provide a JPEG URL`
      );
    } finally {
      try {
        unlinkSync(tmp);
      } catch {
        /* ignore */
      }
    }
  } else {
    writeFileSync(destJpg, buf);
  }

  if (existsSync(destJpg)) console.log("Wrote", destJpg);
}
