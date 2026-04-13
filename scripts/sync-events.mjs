#!/usr/bin/env node
/**
 * Bidirectional event sync between an Obsidian Vault (local-only) and the
 * cursorsaudi.com repo. Both sides are kept in sync using mtime-wins
 * conflict resolution.
 *
 * Sources:
 *   Vault markdown : ~/Vault/cursorsaudi/events/<slug>.md
 *   Vault media    : ~/Vault/__media/<filename>          (flat folder)
 *   Repo markdown  : src/data/events/<slug>.md
 *   Repo media     : public/events/<slug>/<filename>     (per-event folder)
 *
 * For each event slug:
 *   - vault only → vault → repo (transform: wikilinks → md, populate photos)
 *   - repo only  → repo → vault (transform: md → wikilinks, drop photos)
 *   - both       → newer mtime wins
 *   - in-sync    → no-op
 *
 * After every successful sync, both sides' mtimes are aligned so subsequent
 * runs see them as in-sync (no churn).
 *
 * Flags:
 *   --soft                   exit 0 silently if the Vault path does not exist
 *                            (used by `pnpm dev` so the script never blocks
 *                             local dev or CI machines without the Vault).
 *   --vault-path <path>      override the Vault root (default: ~/Vault).
 *   --dry-run                print planned actions without writing.
 *   --vault-wins             ignore mtime, force vault → repo for every slug.
 *   --repo-wins              ignore mtime, force repo → vault for every slug.
 *
 * The script is intentionally not invoked from any CI workflow — committed
 * markdown is the source of truth on GitHub. The sync is purely a local
 * convenience for editing events in Obsidian.
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";

const args = process.argv.slice(2);
const SOFT = args.includes("--soft");
const DRY = args.includes("--dry-run");
const VAULT_WINS = args.includes("--vault-wins");
const REPO_WINS = args.includes("--repo-wins");
const vaultIdx = args.indexOf("--vault-path");
const VAULT_ROOT =
  vaultIdx !== -1 ? args[vaultIdx + 1] : path.join(os.homedir(), "Vault");

const VAULT_EVENTS_DIR = path.join(VAULT_ROOT, "cursorsaudi", "events");
const VAULT_MEDIA_DIR = path.join(VAULT_ROOT, "__media");
const REPO_EVENTS_DIR = path.resolve("src/data/events");
const REPO_MEDIA_ROOT = path.resolve("public/events");

/** Frontmatter keys that exist only in the Vault and must be stripped on import. */
const OBSIDIAN_ONLY_FIELDS = ["created", "modified", "status_obs", "published"];
/** Frontmatter keys auto-populated on the repo side; must be stripped on export. */
const AUTOGEN_FIELDS = ["photos", "coverPhoto", "videos"];

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);
const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov", ".m4v"]);

/** Schema enums from src/content.config.ts. */
const VALID_TYPES = new Set(["meetup", "hackathon", "workshop", "build", "talk", "interview"]);
const VALID_STATUSES = new Set([
  "backlog",
  "informed",
  "venue-pending",
  "register-open",
  "register-closed",
  "concluded",
  "canceled",
]);

const COLOR = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(prefix, msg, color = "") {
  console.log(`${color}[sync-events] ${prefix}${COLOR.reset} ${msg}`);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listMarkdown(dir) {
  if (!(await exists(dir))) return [];
  const entries = await fs.readdir(dir);
  return entries
    .filter(
      (f) =>
        f.endsWith(".md") &&
        !f.startsWith("_") &&
        !f.startsWith(".")
    )
    .map((f) => path.basename(f, ".md"));
}

function isImage(name) {
  return IMAGE_EXTS.has(path.extname(name).toLowerCase());
}
function isVideo(name) {
  return VIDEO_EXTS.has(path.extname(name).toLowerCase());
}

/**
 * Match a markdown image link `![alt](/events/<slug>/<filename>)`. Filenames
 * can contain balanced parentheses (e.g. `image (5).png`), so the URL portion
 * is matched as one-or-more "(non-paren-non-space char) or (balanced (...))".
 */
function imageLinkRegex(slug) {
  return new RegExp(
    `!\\[[^\\]]*\\]\\(/events/${slug}/((?:[^()\\s]|\\([^)]*\\))+)\\)`,
    "g"
  );
}

/** Match an Obsidian wikilink image: `![[file]]` or `![[file|alt]]`. */
const WIKILINK_RE = /!\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]/g;

/**
 * Reduce a markdown body to a canonical form for content comparison.
 *
 * - Image wikilinks and markdown image links collapse to `[[name]]`.
 * - Video wikilinks are stripped entirely. The repo only carries videos in
 *   the `videos` frontmatter field, never in the body, so leaving them in
 *   the comparison would always show false drift.
 * - Trailing whitespace and runs of blank lines are normalized.
 */
function normalizeBodyForCompare(body, slug) {
  return body
    .replace(WIKILINK_RE, (_m, fname) => {
      const trimmed = fname.trim();
      if (isVideo(trimmed)) return "";
      return `[[${trimmed}]]`;
    })
    .replace(imageLinkRegex(slug), (_m, encoded) => {
      let fname;
      try {
        fname = decodeURIComponent(encoded);
      } catch {
        fname = encoded;
      }
      return `[[${fname}]]`;
    })
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Treat empty values (null, undefined, empty string, empty array) as
 * equivalent so YAML quirks like `tags:` vs `tags: []` don't cause spurious
 * sync churn.
 */
function isEmpty(v) {
  if (v == null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

/** Stable JSON for deep-equals comparison; sorts object keys. */
function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(",")}}`;
}

/**
 * True when applying the Vault → repo transformation to the Vault file
 * produces the same data and body as the existing repo file. This is the
 * symmetric "are these in sync?" check: if the next vault → repo run would
 * be a no-op, the files are already in sync (regardless of mtime drift).
 */
async function isContentEquivalent(slug) {
  const vaultRaw = await fs.readFile(
    path.join(VAULT_EVENTS_DIR, `${slug}.md`),
    "utf8"
  );
  const repoRaw = await fs.readFile(
    path.join(REPO_EVENTS_DIR, `${slug}.md`),
    "utf8"
  );
  const transformed = transformVaultToRepo(slug, vaultRaw);
  const repoParsed = matter(repoRaw);

  // Compare bodies via the canonical normalizer (so e.g. parenthesized image
  // filenames compare equal to wikilinks).
  if (
    normalizeBodyForCompare(transformed.body, slug) !==
    normalizeBodyForCompare(repoParsed.content, slug)
  ) {
    return false;
  }

  const skip = new Set(OBSIDIAN_ONLY_FIELDS);
  const allKeys = new Set([
    ...Object.keys(transformed.data),
    ...Object.keys(repoParsed.data),
  ]);
  for (const key of allKeys) {
    if (skip.has(key)) continue;
    const t = transformed.data[key];
    const r = repoParsed.data[key];
    if (isEmpty(t) && isEmpty(r)) continue;
    if (stableStringify(t) !== stableStringify(r)) return false;
  }
  return true;
}

/**
 * Both files describe the same event but their mtimes drifted. Anchor both
 * sides to the older mtime so future runs treat them as in-sync without
 * touching the contents.
 */
async function alignMtimes(slug) {
  const vaultPath = path.join(VAULT_EVENTS_DIR, `${slug}.md`);
  const repoPath = path.join(REPO_EVENTS_DIR, `${slug}.md`);
  const [vs, rs] = await Promise.all([fs.stat(vaultPath), fs.stat(repoPath)]);
  if (Math.abs(vs.mtimeMs - rs.mtimeMs) < 1500) return;
  const target = vs.mtimeMs < rs.mtimeMs ? vs : rs;
  if (DRY) return;
  await fs.utimes(vaultPath, target.atime, target.mtime);
  await fs.utimes(repoPath, target.atime, target.mtime);
}

/**
 * Title-case fallback derived from a filename slug. Strips a leading
 * `YYYY-MM-DD-` date prefix if present.
 */
function slugToTitle(slug) {
  return slug
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Coerce `date` to a `YYYY-MM-DD` Date, falling back to the slug prefix. */
function coerceDate(value, slug) {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return new Date(`${m[1]}T00:00:00.000Z`);
  }
  const slugMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/);
  if (slugMatch) return new Date(`${slugMatch[1]}T00:00:00.000Z`);
  return new Date();
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * `gray-matter` (via js-yaml) writes Date objects as full ISO timestamps,
 * but the project's convention — and Obsidian's — is plain `YYYY-MM-DD`.
 * Rewrite midnight-UTC timestamps in the YAML frontmatter back to the
 * date-only form.
 */
function postProcessYaml(out) {
  return out.replace(
    /^(\s*[A-Za-z_][\w-]*:\s*)(['"]?)(\d{4}-\d{2}-\d{2})T00:00:00\.000Z\2(\s*)$/gm,
    "$1$3$4"
  );
}

/**
 * Pure (no I/O) Vault → repo transform. Returns the post-transform
 * frontmatter, body, and the list of referenced media filenames. Used by
 * both `syncVaultToRepo` (which writes the file) and `isContentEquivalent`
 * (which compares without writing).
 */
function transformVaultToRepo(slug, raw) {
  const parsed = matter(raw);
  const data = { ...parsed.data };

  // Strip Obsidian-only fields.
  for (const k of OBSIDIAN_ONLY_FIELDS) delete data[k];

  // Required fields with sensible fallbacks (matches the prior sync script).
  if (!nonEmptyString(data.title)) data.title = slugToTitle(slug);
  if (!nonEmptyString(data.location)) data.location = "TBD";
  if (!nonEmptyString(data.description)) data.description = data.title;
  data.date = coerceDate(data.date, slug);
  if (!VALID_TYPES.has(data.type)) data.type = "meetup";
  if (!VALID_STATUSES.has(data.status)) data.status = "backlog";

  // Convert wikilinks → markdown links. Image links are inlined; video
  // wikilinks are removed from the body (videos live in frontmatter only).
  const referenced = [];
  let body = parsed.content.replace(WIKILINK_RE, (_m, fname) => {
    const trimmed = fname.trim();
    referenced.push(trimmed);
    if (isVideo(trimmed)) return "";
    return `![](/events/${slug}/${encodeURI(trimmed)})`;
  });
  // Collapse blank lines left behind after stripping video references.
  body = body.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");

  const photos = referenced.filter(isImage);
  const videos = referenced.filter(isVideo);
  if (photos.length > 0) {
    data.photos = [...new Set(photos)];
    if (!nonEmptyString(data.coverPhoto)) data.coverPhoto = data.photos[0];
  } else {
    delete data.photos;
    delete data.coverPhoto;
  }
  if (videos.length > 0) {
    data.videos = [...new Set(videos)];
  } else {
    delete data.videos;
  }

  return { data, body, referenced };
}

/**
 * Vault → repo: rewrite the body and frontmatter, copy media into the
 * per-event folder under public/events/<slug>/.
 */
async function syncVaultToRepo(slug) {
  const src = path.join(VAULT_EVENTS_DIR, `${slug}.md`);
  const dst = path.join(REPO_EVENTS_DIR, `${slug}.md`);
  const srcStat = await fs.stat(src);
  const raw = await fs.readFile(src, "utf8");
  const { data, body, referenced } = transformVaultToRepo(slug, raw);

  // Copy referenced media from ~/Vault/__media/ → public/events/<slug>/
  if (referenced.length > 0) {
    const dstDir = path.join(REPO_MEDIA_ROOT, slug);
    if (!DRY) await fs.mkdir(dstDir, { recursive: true });
    for (const fname of new Set(referenced)) {
      const from = path.join(VAULT_MEDIA_DIR, fname);
      const to = path.join(dstDir, fname);
      if (await exists(from)) {
        if (!DRY) await fs.copyFile(from, to);
      } else if (!(await exists(to))) {
        log("warn", `vault media missing: ${fname} (referenced by ${slug})`, COLOR.yellow);
      }
    }
  }

  const out = postProcessYaml(matter.stringify(body, data, { lineWidth: -1 }));
  if (!DRY) {
    await fs.writeFile(dst, out, "utf8");
    await fs.utimes(dst, srcStat.atime, srcStat.mtime);
  }
  log("vault → repo", slug, COLOR.cyan);
}

/**
 * Repo → vault: rewrite the body and frontmatter, copy media into __media/.
 * Existing Obsidian-only fields on the destination are preserved so we don't
 * stomp `created`/`modified` on round-trips.
 */
async function syncRepoToVault(slug) {
  const src = path.join(REPO_EVENTS_DIR, `${slug}.md`);
  const dst = path.join(VAULT_EVENTS_DIR, `${slug}.md`);
  const srcStat = await fs.stat(src);
  const raw = await fs.readFile(src, "utf8");
  const parsed = matter(raw);

  const data = { ...parsed.data };
  for (const k of AUTOGEN_FIELDS) delete data[k];

  // Preserve Obsidian-only fields from the existing vault file, if any.
  if (await exists(dst)) {
    try {
      const existing = matter(await fs.readFile(dst, "utf8"));
      for (const k of OBSIDIAN_ONLY_FIELDS) {
        if (k in existing.data) data[k] = existing.data[k];
      }
    } catch {
      /* ignore parse errors on the destination */
    }
  }

  // Convert ![](/events/<slug>/<encoded>) → ![[<decoded>]] and collect filenames.
  const referenced = [];
  const body = parsed.content.replace(imageLinkRegex(slug), (_m, encoded) => {
    let fname;
    try {
      fname = decodeURIComponent(encoded);
    } catch {
      fname = encoded;
    }
    referenced.push(fname);
    return `![[${fname}]]`;
  });

  // Copy media from public/events/<slug>/ → ~/Vault/__media/
  if (referenced.length > 0) {
    if (!DRY) await fs.mkdir(VAULT_MEDIA_DIR, { recursive: true });
    for (const fname of new Set(referenced)) {
      const from = path.join(REPO_MEDIA_ROOT, slug, fname);
      const to = path.join(VAULT_MEDIA_DIR, fname);
      if (!(await exists(from))) {
        log("warn", `repo media missing: ${fname} (referenced by ${slug})`, COLOR.yellow);
        continue;
      }
      if (await exists(to)) {
        // Avoid overwriting an existing media file in the flat __media folder
        // unless contents differ in size — then warn about a name collision.
        const [s1, s2] = await Promise.all([fs.stat(from), fs.stat(to)]);
        if (s1.size !== s2.size) {
          log(
            "warn",
            `media name collision in __media: ${fname} (sizes differ; not overwriting)`,
            COLOR.yellow
          );
        }
      } else if (!DRY) {
        await fs.copyFile(from, to);
      }
    }
  }

  const out = postProcessYaml(matter.stringify(body, data, { lineWidth: -1 }));
  if (!DRY) {
    await fs.writeFile(dst, out, "utf8");
    await fs.utimes(dst, srcStat.atime, srcStat.mtime);
  }
  log("repo → vault", slug, COLOR.green);
}

async function main() {
  if (!(await exists(VAULT_EVENTS_DIR))) {
    if (SOFT) {
      log(
        "skip",
        `vault not found at ${VAULT_EVENTS_DIR} (soft mode)`,
        COLOR.dim
      );
      return;
    }
    log("error", `vault events dir not found: ${VAULT_EVENTS_DIR}`, COLOR.red);
    process.exit(1);
  }

  if (!DRY) {
    await fs.mkdir(VAULT_MEDIA_DIR, { recursive: true });
    await fs.mkdir(REPO_EVENTS_DIR, { recursive: true });
    await fs.mkdir(REPO_MEDIA_ROOT, { recursive: true });
  }

  const [vaultSlugs, repoSlugs] = await Promise.all([
    listMarkdown(VAULT_EVENTS_DIR),
    listMarkdown(REPO_EVENTS_DIR),
  ]);
  const slugs = [...new Set([...vaultSlugs, ...repoSlugs])].sort();

  const counts = { v2r: 0, r2v: 0, inSync: 0 };

  for (const slug of slugs) {
    const vaultPath = path.join(VAULT_EVENTS_DIR, `${slug}.md`);
    const repoPath = path.join(REPO_EVENTS_DIR, `${slug}.md`);
    const inVault = await exists(vaultPath);
    const inRepo = await exists(repoPath);

    if (VAULT_WINS && inVault) {
      await syncVaultToRepo(slug);
      counts.v2r++;
      continue;
    }
    if (REPO_WINS && inRepo) {
      await syncRepoToVault(slug);
      counts.r2v++;
      continue;
    }

    if (inVault && !inRepo) {
      await syncVaultToRepo(slug);
      counts.v2r++;
    } else if (inRepo && !inVault) {
      await syncRepoToVault(slug);
      counts.r2v++;
    } else {
      // Both exist. First check whether they describe the same event already
      // (content-equivalent modulo formatting). If so, don't churn — just
      // align mtimes so this state is sticky across runs.
      if (await isContentEquivalent(slug)) {
        await alignMtimes(slug);
        counts.inSync++;
        continue;
      }
      // Genuine difference: newer mtime wins.
      const [vs, rs] = await Promise.all([fs.stat(vaultPath), fs.stat(repoPath)]);
      if (vs.mtimeMs >= rs.mtimeMs) {
        await syncVaultToRepo(slug);
        counts.v2r++;
      } else {
        await syncRepoToVault(slug);
        counts.r2v++;
      }
    }
  }

  log(
    "done",
    `vault → repo: ${counts.v2r}, repo → vault: ${counts.r2v}, in-sync: ${counts.inSync}${DRY ? " (dry-run)" : ""}`,
    COLOR.dim
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
