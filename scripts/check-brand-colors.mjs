// Fails when a .tsx file uses a hard-coded hex color or a Tailwind color family outside the
// approved brand baseline (PO-33). Run with: npm run check:brand
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../src/', import.meta.url).pathname;
const ALLOWED_FAMILIES = new Set(['brand', 'accent', 'success', 'warning', 'danger', 'dark', 'slate']);
const UTILITIES = 'bg|text|border|from|to|via|ring|fill|stroke|outline|divide|placeholder|shadow|decoration|accent|caret';
const FAMILY_PATTERN = new RegExp(`\\b(?:${UTILITIES})-([a-z]+)-\\d{2,3}\\b`, 'g');
const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;

function* tsxFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* tsxFiles(path);
    else if (path.endsWith('.tsx')) yield path;
  }
}

const problems = [];
for (const file of tsxFiles(ROOT)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const where = `src/${relative(ROOT, file)}:${i + 1}`;
    for (const [hex] of line.matchAll(HEX_PATTERN)) problems.push(`${where} hard-coded color ${hex}`);
    for (const [cls, family] of line.matchAll(FAMILY_PATTERN)) {
      if (!ALLOWED_FAMILIES.has(family)) problems.push(`${where} color outside the brand baseline: ${cls}`);
    }
  });
}

if (problems.length) {
  console.error(`Brand check failed (PO-33):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('Brand check passed: no hard-coded colors and no colors outside the brand baseline.');
