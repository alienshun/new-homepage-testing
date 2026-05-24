#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCAN_ROOT = path.join(REPO_ROOT, 'assets');

const GENERATED_WEBP_RE = /\.(png|jpe?g|bmp|tiff?)\.webp$/i;

const APPLY = process.argv.includes('--apply');

let matched = 0;
let removed = 0;

function toRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

function walk(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      return;
    }

    if (!entry.isFile()) return;

    if (!GENERATED_WEBP_RE.test(entry.name)) return;

    matched += 1;

    if (APPLY) {
      fs.unlinkSync(fullPath);
      removed += 1;
      console.log('Removed:', toRelative(fullPath));
    } else {
      console.log('Matched:', toRelative(fullPath));
    }
  });
}

if (!fs.existsSync(SCAN_ROOT)) {
  console.error('assets directory was not found.');
  process.exit(1);
}

walk(SCAN_ROOT);

console.log('');

if (APPLY) {
  console.log(`Done. Removed ${removed} generated WebP sidecar file(s).`);
} else {
  console.log(`Dry run complete. Found ${matched} generated WebP sidecar file(s).`);
  console.log('Run again with --apply to delete them.');
}
