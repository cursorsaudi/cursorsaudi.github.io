#!/usr/bin/env node

/**
 * Syncs event files from the Obsidian vault (cursorsaudi/events/) to the Astro site (src/data/events/).
 *
 * - Reads all .md files in VAULT_EVENTS_DIR (skips _ prefixed files)
 * - Parses frontmatter with gray-matter
 * - Strips Obsidian-only fields, keeps Astro-required fields
 * - Writes clean events to src/data/events/
 *
 * Usage: node scripts/sync-vault-events.mjs [--vault-path /path/to/vault]
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// --- Config ---

const args = process.argv.slice(2);
const vaultFlagIndex = args.indexOf("--vault-path");
const VAULT_PATH = vaultFlagIndex !== -1 ? args[vaultFlagIndex + 1] : null;

if (!VAULT_PATH) {
  throw new Error(
    "Usage: node scripts/sync-vault-events.mjs --vault-path /path/to/vault"
  );
}

const VAULT_EVENTS_DIR = path.join(VAULT_PATH, "cursorsaudi", "events");
const EVENTS_OUTPUT_DIR = path.resolve("src/data/events");

// Obsidian-only fields to strip from final frontmatter
// Note: "type" and "status" are Astro-required fields for events, NOT Obsidian metadata
const OBSIDIAN_FIELDS = ["created", "modified", "status_obs", "published"];

// --- Helpers ---

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function serializeValue(val, indent = "") {
  if (val instanceof Date) {
    // Dates without time → YYYY-MM-DD
    const iso = val.toISOString();
    if (iso.endsWith("T00:00:00.000Z")) return iso.slice(0, 10);
    return iso;
  }
  if (typeof val === "string") {
    // Quote strings that contain special YAML chars
    if (/[:#{}[\],&*?|>!%@`"'\n]/.test(val) || val === "" || val === "true" || val === "false") {
      return JSON.stringify(val);
    }
    return val;
  }
  if (typeof val === "boolean" || typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    return "\n" + val.map(v => `${indent}  - ${serializeValue(v, indent + "  ")}`).join("\n");
  }
  return JSON.stringify(val);
}

function serializeEvent(fm, content) {
  let yaml = "---\n";
  for (const [key, val] of Object.entries(fm)) {
    if (val == null) continue;
    yaml += `${key}: ${serializeValue(val)}\n`;
  }
  yaml += "---\n";
  return yaml + content;
}

// --- Main ---

function syncEvents() {
  ensureDir(EVENTS_OUTPUT_DIR);

  // Clean existing events (full replace)
  for (const entry of fs.readdirSync(EVENTS_OUTPUT_DIR, { withFileTypes: true })) {
    const fullPath = path.join(EVENTS_OUTPUT_DIR, entry.name);
    if (entry.isFile() && entry.name.endsWith(".md")) {
      fs.unlinkSync(fullPath);
    }
  }

  if (!fs.existsSync(VAULT_EVENTS_DIR)) {
    process.stdout.write("No vault events directory found, nothing to sync.\n");
    return;
  }

  const eventFiles = fs
    .readdirSync(VAULT_EVENTS_DIR)
    .filter(f => f.endsWith(".md") && !f.startsWith("_"));

  let synced = 0;
  let skipped = 0;

  for (const file of eventFiles) {
    const filepath = path.join(VAULT_EVENTS_DIR, file);
    const raw = fs.readFileSync(filepath, "utf-8");
    const { data: fm, content } = matter(raw);

    // Skip if explicitly unpublished
    if (fm.published === false) {
      skipped++;
      continue;
    }

    // Build clean Astro frontmatter (strip Obsidian-only fields)
    const astroFm = {};
    for (const [key, val] of Object.entries(fm)) {
      if (OBSIDIAN_FIELDS.includes(key)) continue;
      astroFm[key] = val;
    }

    // Write transformed event
    const outputContent = serializeEvent(astroFm, content);
    fs.writeFileSync(path.join(EVENTS_OUTPUT_DIR, file), outputContent);
    synced++;
  }

  const summary = `Synced ${synced} events, skipped ${skipped}.`;
  process.stdout.write(summary + "\n");
}

syncEvents();
