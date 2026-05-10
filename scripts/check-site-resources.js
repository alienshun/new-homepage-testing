#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE_RESOURCES_FILE = path.join(ROOT, 'assets/js/Config/SiteResources.js');

const ROUTE_ENTRY_ROUTES = [
  'about',
  'schedule',
  'social',
  'meditations'
];

const FORBIDDEN_PATH_PATTERNS = [
  {
    label: 'removed fav/ directory',
    pattern: /(?:^|['"`(=\s])(?:\.\/)?fav\//i
  },
  {
    label: 'removed cursor.css file',
    pattern: /cursor\.css/i
  }
];

const SCANNED_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js',
  '.json',
  '.yml',
  '.yaml'
]);

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  '.cache',
  '.next',
  'dist',
  'build'
]);

const SELF_FILE = path.normalize(__filename);

let errors = [];
let warnings = [];

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function isExternalUrl(value) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value) ||
    /^(?:data:|mailto:|tel:|#)/i.test(value);
}

function stripQueryAndHash(value) {
  return String(value).split(/[?#]/)[0];
}

function toRepoPath(value) {
  let clean = stripQueryAndHash(value).trim();

  if (!clean || isExternalUrl(clean)) {
    return null;
  }

  if (clean.startsWith('./')) {
    clean = clean.slice(2);
  }

  if (clean.startsWith('/')) {
    clean = clean.slice(1);
  }

  return clean.replace(/\\/g, '/');
}

function loadSiteResources() {
  if (!fs.existsSync(SITE_RESOURCES_FILE)) {
    fail(`Missing SiteResources.js: ${rel(SITE_RESOURCES_FILE)}`);
    return null;
  }

  const code = readText(SITE_RESOURCES_FILE);

  const sandbox = {
    window: {},
    console: {
      log() {},
      warn() {},
      error() {}
    }
  };

  try {
    vm.runInNewContext(code, sandbox, {
      filename: SITE_RESOURCES_FILE,
      timeout: 1000
    });
  } catch (e) {
    fail(`Failed to evaluate SiteResources.js: ${e.message}`);
    return null;
  }

  if (!sandbox.window.SiteResources) {
    fail('SiteResources.js did not define window.SiteResources.');
    return null;
  }

  return sandbox.window.SiteResources;
}

function addAsset(assets, value, origin, kind) {
  if (typeof value !== 'string') return;

  const repoPath = toRepoPath(value);
  if (!repoPath) return;

  assets.push({
    path: repoPath,
    origin,
    kind: kind || 'file'
  });
}

function collectFromResourceList(assets, value, origin, keyName) {
  if (!value) return;

  if (typeof value === 'string') {
    addAsset(assets, value, origin, 'file');
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectFromResourceList(assets, item, `${origin}[${index}]`, keyName);
    });
    return;
  }

  if (typeof value === 'object') {
    if (typeof value.href === 'string') {
      addAsset(assets, value.href, `${origin}.href`, 'file');
    }

    if (typeof value.src === 'string') {
      addAsset(assets, value.src, `${origin}.src`, 'file');
    }

    Object.keys(value).forEach((key) => {
      if (key === 'href' || key === 'src' || key === 'attrs') return;
      collectFromResourceList(assets, value[key], `${origin}.${key}`, keyName);
    });
  }
}

function collectImages(assets, obj, origin, inheritedCoverDir) {
  if (!obj || typeof obj !== 'object') return;

  const localCoverDir = typeof obj.coverDir === 'string'
    ? obj.coverDir
    : inheritedCoverDir;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const here = `${origin}.${key}`;

    if (key === 'coverDir' && typeof value === 'string') {
      addAsset(assets, value, here, 'dir');
      return;
    }

    if (key === 'coverFiles' && Array.isArray(value)) {
      if (!localCoverDir) {
        fail(`${here} exists, but coverDir is not defined.`);
        return;
      }

      value.forEach((file, index) => {
        if (typeof file !== 'string') {
          fail(`${here}[${index}] must be a string.`);
          return;
        }

        addAsset(assets, localCoverDir + file, `${here}[${index}]`, 'file');
      });

      return;
    }

    if (typeof value === 'string') {
      addAsset(assets, value, here, 'file');
      return;
    }

    if (value && typeof value === 'object') {
      collectImages(assets, value, here, localCoverDir);
    }
  });
}

function collectAssets(resources) {
  const assets = [];

  if (resources.site && resources.site.favicon) {
    collectFromResourceList(assets, resources.site.favicon, 'site.favicon');
  }

  collectFromResourceList(assets, resources.external, 'external');
  collectFromResourceList(assets, resources.styles, 'styles');
  collectFromResourceList(assets, resources.scripts, 'scripts');
  collectFromResourceList(assets, resources.pages, 'pages');

  if (resources.images) {
    collectImages(assets, resources.images, 'images');
  }

  return assets;
}

function checkAssetExists(asset) {
  const abs = path.join(ROOT, asset.path);

  if (!fs.existsSync(abs)) {
    fail(`Missing ${asset.kind}: ${asset.path}    from ${asset.origin}`);
    return;
  }

  const stat = fs.statSync(abs);

  if (asset.kind === 'dir' && !stat.isDirectory()) {
    fail(`Expected directory but found file: ${asset.path}    from ${asset.origin}`);
  }

  if (asset.kind === 'file' && !stat.isFile()) {
    fail(`Expected file but found directory: ${asset.path}    from ${asset.origin}`);
  }
}

function checkDuplicateAssets(assets) {
  const map = new Map();

  assets.forEach((asset) => {
    const key = `${asset.kind}:${asset.path}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(asset.origin);
  });

  Array.from(map.entries()).forEach(([key, origins]) => {
    if (origins.length <= 1) return;

    const [, assetPath] = key.split(':');
    warn(`Duplicate configured resource: ${assetPath}\n  used by: ${origins.join(', ')}`);
  });
}

function checkForbiddenConfiguredAssets(assets) {
  assets.forEach((asset) => {
    FORBIDDEN_PATH_PATTERNS.forEach((item) => {
      if (item.pattern.test(asset.path)) {
        fail(`Forbidden old path reference (${item.label}): ${asset.path}    from ${asset.origin}`);
      }
    });
  });
}

function walkFiles(dir, out) {
  if (!fs.existsSync(dir)) return out;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const abs = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) return;
      walkFiles(abs, out);
      return;
    }

    if (!entry.isFile()) return;

    const ext = path.extname(entry.name).toLowerCase();
    if (!SCANNED_EXTENSIONS.has(ext)) return;

    if (path.normalize(abs) === SELF_FILE) return;

    out.push(abs);
  });

  return out;
}

function checkForbiddenTextReferences() {
  const files = walkFiles(ROOT, []);

  files.forEach((file) => {
    const text = readText(file);

    FORBIDDEN_PATH_PATTERNS.forEach((item) => {
      if (item.pattern.test(text)) {
        fail(`Forbidden old path reference (${item.label}) found in ${rel(file)}`);
      }
    });
  });
}

function checkRouteEntries() {
  const rootIndex = path.join(ROOT, 'index.html');

  if (!fs.existsSync(rootIndex)) {
    fail('Missing root index.html');
  }

  ROUTE_ENTRY_ROUTES.forEach((route) => {
    const entry = path.join(ROOT, route, 'index.html');

    if (!fs.existsSync(entry)) {
      fail(`Missing route entry: ${route}/index.html`);
    }
  });

  const toolkitEntry = path.join(ROOT, 'toolkit', 'index.html');

  if (fs.existsSync(toolkitEntry)) {
    warn('toolkit/index.html exists. If Toolkit is intended to stay hidden, check whether this file is intentional.');
  }
}

function printResult() {
  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach((message) => {
      console.log(`- ${message}`);
    });
  }

  if (errors.length) {
    console.error('\nErrors:');
    errors.forEach((message) => {
      console.error(`- ${message}`);
    });

    console.error('\nSite resource check failed.');
    process.exit(1);
  }

  console.log('Site resource check passed.');
}

function main() {
  const resources = loadSiteResources();

  if (resources) {
    const assets = collectAssets(resources);

    assets.forEach(checkAssetExists);
    checkDuplicateAssets(assets);
    checkForbiddenConfiguredAssets(assets);
  }

  checkRouteEntries();
  checkForbiddenTextReferences();

  printResult();
}

main();
