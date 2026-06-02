#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE_FONTS_FILE = path.join(ROOT, 'assets/js/Config/SiteFonts.js');
const SITE_RESOURCES_FILE = path.join(ROOT, 'assets/js/Config/SiteResources.js');

const ROUTE_ENTRY_ROUTES = [
  'about',
  'schedule',
  'social',
  'life'
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

function evaluateConfigFile(file, sandbox, requiredGlobalName) {
  if (!fs.existsSync(file)) {
    fail(`Missing config file: ${rel(file)}`);
    return false;
  }

  const code = readText(file);

  try {
    vm.runInNewContext(code, sandbox, {
      filename: file,
      timeout: 1000
    });
  } catch (e) {
    fail(`Failed to evaluate ${rel(file)}: ${e.message}`);
    return false;
  }

  if (requiredGlobalName && !sandbox.window[requiredGlobalName]) {
    fail(`${rel(file)} did not define window.${requiredGlobalName}.`);
    return false;
  }

  return true;
}

function loadSiteResources() {
  const sandbox = {
    window: {},
    console: {
      log() {},
      warn() {},
      error() {}
    }
  };

  evaluateConfigFile(SITE_FONTS_FILE, sandbox, 'SiteFonts');

  if (!evaluateConfigFile(SITE_RESOURCES_FILE, sandbox, 'SiteResources')) {
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

function collectAssetList(assets, value, origin, kind) {
  if (!value) return;

  if (typeof value === 'string') {
    addAsset(assets, value, origin, kind);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectAssetList(assets, item, `${origin}[${index}]`, kind);
    });
    return;
  }

  if (typeof value !== 'object') return;

  if (typeof value.href === 'string') {
    addAsset(assets, value.href, `${origin}.href`, kind);
  }

  if (typeof value.src === 'string') {
    addAsset(assets, value.src, `${origin}.src`, kind);
  }

  if (typeof value.fallbackHref === 'string') {
    addAsset(assets, value.fallbackHref, `${origin}.fallbackHref`, 'style');
  }

  Object.keys(value).forEach((key) => {
    if (key === 'href' || key === 'src' || key === 'fallbackHref' || key === 'attrs' || key === 'timeout') return;

    collectAssetList(assets, value[key], `${origin}.${key}`, kind);
  });
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

        addAsset(assets, localCoverDir + file, `${here}[${index}]`, 'image');
      });

      return;
    }

    if (typeof value === 'string') {
      addAsset(assets, value, here, 'image');
      return;
    }

    if (value && typeof value === 'object') {
      collectImages(assets, value, here, localCoverDir);
    }
  });
}

function coverVideoFileFromImageFile(imageFile, extension) {
  if (typeof imageFile !== 'string') return null;

  const ext = typeof extension === 'string' && extension
    ? extension
    : '.mp4';

  return imageFile.replace(/\.[^/.]+$/, '') + ext;
}

function collectCoverVideos(assets, resources) {
  if (!resources || !resources.coverVideo) return;

  const coverVideo = resources.coverVideo;

  if (coverVideo.enabled === false) return;

  const images = resources.images || {};
  const coverFiles = images.coverFiles;
  const videoDir = coverVideo.dir;
  const extension = coverVideo.extension || '.mp4';

  if (!Array.isArray(coverFiles)) {
    fail('coverVideo is enabled, but images.coverFiles is not defined.');
    return;
  }

  if (typeof videoDir !== 'string' || !videoDir.trim()) {
    fail('coverVideo.dir must be a non-empty string when coverVideo is enabled.');
    return;
  }

  if (typeof extension !== 'string' || !extension.trim()) {
    fail('coverVideo.extension must be a non-empty string when coverVideo is enabled.');
    return;
  }

  addAsset(assets, videoDir, 'coverVideo.dir', 'dir');

  coverFiles.forEach((imageFile, index) => {
    if (typeof imageFile !== 'string') {
      fail(`images.coverFiles[${index}] must be a string before checking cover video.`);
      return;
    }

    const videoFile = coverVideoFileFromImageFile(imageFile, extension);

    if (!videoFile) {
      fail(`Could not derive cover video file from images.coverFiles[${index}].`);
      return;
    }

    addAsset(
      assets,
      videoDir + videoFile,
      `coverVideo derived from images.coverFiles[${index}]`,
      'video'
    );
  });
}

function collectPageAssets(assets, pages) {
  if (!pages || typeof pages !== 'object') return;

  Object.keys(pages).forEach((pageKey) => {
    const page = pages[pageKey];

    if (!page || typeof page !== 'object') {
      fail(`pages.${pageKey} must be an object.`);
      return;
    }

    if (typeof page.route !== 'string' || !page.route.trim()) {
      fail(`pages.${pageKey}.route must be a non-empty string.`);
    }

    if (typeof page.domId !== 'string' || !page.domId.trim()) {
      fail(`pages.${pageKey}.domId must be a non-empty string.`);
    }

    if (typeof page.mountId !== 'string' || !page.mountId.trim()) {
      fail(`pages.${pageKey}.mountId must be a non-empty string.`);
    }

    collectAssetList(assets, page.styles || [], `pages.${pageKey}.styles`, 'style');
    collectAssetList(assets, page.scripts || [], `pages.${pageKey}.scripts`, 'script');
  });
}

function collectAssets(resources) {
  const assets = [];

  if (resources.site && resources.site.favicon && typeof resources.site.favicon.href === 'string') {
    addAsset(assets, resources.site.favicon.href, 'site.favicon.href', 'image');
  }

  collectAssetList(assets, resources.external && resources.external.styles, 'external.styles', 'external');
  collectAssetList(assets, resources.external && resources.external.analytics, 'external.analytics', 'external');

  if (resources.external && resources.external.libraries) {
    collectAssetList(assets, resources.external.libraries, 'external.libraries', 'external');
  }

  collectAssetList(assets, resources.styles, 'styles', 'style');
  collectAssetList(assets, resources.scripts, 'scripts', 'script');

  collectPageAssets(assets, resources.pages);

  if (resources.images) {
    collectImages(assets, resources.images, 'images');
  }

  collectCoverVideos(assets, resources);

  return assets;
}

function checkAssetExists(asset) {
  if (asset.kind === 'external') return;

  const abs = path.join(ROOT, asset.path);

  if (!fs.existsSync(abs)) {
    fail(`Missing ${asset.kind}: ${asset.path}    from ${asset.origin}`);
    return;
  }

  const stat = fs.statSync(abs);

  if (asset.kind === 'dir' && !stat.isDirectory()) {
    fail(`Expected directory but found file: ${asset.path}    from ${asset.origin}`);
  }

  if (asset.kind !== 'dir' && !stat.isFile()) {
    fail(`Expected file but found directory: ${asset.path}    from ${asset.origin}`);
  }
}

function checkDuplicateLocalScriptsAndStyles(assets) {
  const map = new Map();

  assets.forEach((asset) => {
    if (asset.kind !== 'style' && asset.kind !== 'script') return;

    const key = `${asset.kind}:${asset.path}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(asset.origin);
  });

  Array.from(map.entries()).forEach(([key, origins]) => {
    if (origins.length <= 1) return;

    const [, assetPath] = key.split(':');
    warn(`Duplicate configured ${key.startsWith('style:') ? 'stylesheet' : 'script'}: ${assetPath}\n  used by: ${origins.join(', ')}`);
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

function checkRouteEntries(resources) {
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

  const pages = resources && resources.pages ? resources.pages : {};

  Object.keys(pages).forEach((pageKey) => {
    const page = pages[pageKey];
    if (!page || typeof page !== 'object') return;

    if (pageKey === 'toolkit') return;

    const route = page.route;

    if (typeof route === 'string' && route && !ROUTE_ENTRY_ROUTES.includes(route)) {
      warn(`pages.${pageKey}.route is "${route}", but ${route}/index.html is not included in ROUTE_ENTRY_ROUTES.`);
    }
  });
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
    checkDuplicateLocalScriptsAndStyles(assets);
    checkForbiddenConfiguredAssets(assets);
    checkRouteEntries(resources);
  } else {
    checkRouteEntries(null);
  }

  checkForbiddenTextReferences();

  printResult();
}

main();
