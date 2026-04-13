import fs from "node:fs";
import path from "node:path";

const PUBLIC_PREFIXES = ["/images/", "/logos/", "/placeholders/"] as const;

/**
 * Recursively collects site-root asset URLs under `public/` that appear in config.
 */
function collectPublicAssetPaths(value: unknown, out: Set<string>): void {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    if (PUBLIC_PREFIXES.some((prefix) => value.startsWith(prefix))) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPublicAssetPaths(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) collectPublicAssetPaths(v, out);
  }
}

/**
 * Throws if any referenced `/images/…`, `/logos/…`, or `/placeholders/…` path is missing under `public/`.
 *
 * @param siteConfig - Same object shape as `config` from `@/config`
 * @param repoRoot - Repository root (directory containing `public/`)
 */
export function assertSiteConfigPublicAssets(
  siteConfig: unknown,
  repoRoot: string = process.cwd()
): void {
  const paths = new Set<string>();
  collectPublicAssetPaths(siteConfig, paths);
  const missing: string[] = [];
  for (const urlPath of paths) {
    const rel = urlPath.slice(1);
    const abs = path.join(repoRoot, "public", rel);
    if (!fs.existsSync(abs)) missing.push(urlPath);
  }
  if (missing.length > 0)
    throw new Error(`Missing public assets referenced in config: ${missing.join(", ")}`);
}
