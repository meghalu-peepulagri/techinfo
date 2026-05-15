#!/usr/bin/env node
/**
 * new-release.js — create a release from a filled-in template file
 *
 * Usage:
 *   node scripts/new-release.js release.txt
 *
 * Copy scripts/release-template.txt, fill in the fields, then run.
 */

const fs = require("fs");
const path = require("path");

// ── load template file ────────────────────────────────────────────────────────
const templatePath = process.argv[2];
if (!templatePath) {
  console.error("Error: provide a template file.\n");
  console.error("  node scripts/new-release.js release.txt");
  console.error("\nCopy scripts/release-template.txt, fill it in, then run.");
  process.exit(1);
}
if (!fs.existsSync(templatePath)) {
  console.error(`Error: file not found: ${templatePath}`);
  process.exit(1);
}

const raw = fs.readFileSync(templatePath, "utf8");

// ── split header / body on first "---" line ───────────────────────────────────
const separatorIndex = raw.search(/^---\s*$/m);
if (separatorIndex === -1) {
  console.error('Error: template must contain a "---" line separating fields from changelog.');
  process.exit(1);
}
const headerText = raw.slice(0, separatorIndex);
const changelog = raw.slice(separatorIndex + 4).trim(); // skip past "---\n"

// ── parse key: value fields ───────────────────────────────────────────────────
const fields = {};
for (const line of headerText.split("\n")) {
  const m = line.match(/^(\w+)\s*:\s*(.+)/);
  if (m) fields[m[1].toLowerCase()] = m[2].trim();
}

const product = fields.product;
const version = fields.version;
const apkSrc = fields.apk && fields.apk !== "(optional)" ? fields.apk : null;
const releaseDate = fields.date || new Date().toISOString().slice(0, 10);
const typeArg = fields.type || "Internal Release";

// ── validate ──────────────────────────────────────────────────────────────────
const missing = [];
if (!product) missing.push("product");
if (!version) missing.push("version");
if (missing.length) {
  console.error(`Error: missing required field(s): ${missing.join(", ")}`);
  process.exit(1);
}

const PRODUCTS = ["idhara", "apfc", "orc", "demetercloud"];
if (!PRODUCTS.includes(product.toLowerCase())) {
  console.error(`Error: unknown product "${product}". Must be one of: ${PRODUCTS.join(", ")}`);
  process.exit(1);
}

const REPO_ROOT = path.resolve(__dirname, "..");
const releaseDir = path.join(REPO_ROOT, "docs", product.toLowerCase(), "release-notes");
const staticReleasesDir = path.join(REPO_ROOT, "static", "releases");

// ── copy APK ──────────────────────────────────────────────────────────────────
let apkFilename = null;
if (apkSrc) {
  const resolvedApk = path.resolve(apkSrc);
  if (!fs.existsSync(resolvedApk)) {
    console.error(`Error: APK not found: ${resolvedApk}`);
    process.exit(1);
  }
  apkFilename = path.basename(resolvedApk);
  const apkDest = path.join(staticReleasesDir, apkFilename);
  fs.mkdirSync(staticReleasesDir, { recursive: true });
  fs.copyFileSync(resolvedApk, apkDest);
  console.log(`✓ Copied APK → static/releases/${apkFilename}`);
}

// ── bump sidebar_position on existing release notes ───────────────────────────
fs.mkdirSync(releaseDir, { recursive: true });
const existingFiles = fs.readdirSync(releaseDir).filter((f) => f.endsWith(".md"));

for (const file of existingFiles) {
  const filePath = path.join(releaseDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  content = content.replace(/^(sidebar_position:\s*)(\d+)/m, (_, prefix, num) => {
    return `${prefix}${parseInt(num, 10) + 1}`;
  });
  fs.writeFileSync(filePath, content, "utf8");
}
if (existingFiles.length > 0) {
  console.log(`✓ Bumped sidebar_position on ${existingFiles.length} existing file(s)`);
}

// ── build markdown ────────────────────────────────────────────────────────────
const DISPLAY = { idhara: "iDhara", apfc: "APFC", orc: "ORC", demetercloud: "DemeterCloud" };
const productDisplay = DISPLAY[product.toLowerCase()] || product;
const versionTag = version.startsWith("v") ? version : `v${version}`;

const apkLine = apkFilename
  ? `📦 **Download:** [${apkFilename}](pathname:///releases/${apkFilename})  \n*(Play Store link will replace this once published)*`
  : `📦 **Download:** *(APK not provided — add link manually)*`;

const mdContent = `---
title: ${versionTag} — ${typeArg}
sidebar_position: 1
---

# ${productDisplay} ${versionTag} — ${typeArg}

**Release Date:** ${releaseDate}

---

## Mobile App (${versionTag})

${apkLine}

${changelog || "<!-- Add release notes here -->"}

---

## Known Issues

_None at this time._
`;

// ── write release note ────────────────────────────────────────────────────────
const noteFilename = `${versionTag}.md`;
const notePath = path.join(releaseDir, noteFilename);

if (fs.existsSync(notePath)) {
  console.error(`Error: docs/${product}/release-notes/${noteFilename} already exists. Aborting.`);
  process.exit(1);
}

fs.writeFileSync(notePath, mdContent, "utf8");
console.log(`✓ Created docs/${product}/release-notes/${noteFilename}`);
console.log(`\nDone. Review the file, then:\n  git add . && git commit -m "release: ${productDisplay} ${versionTag}"`);
