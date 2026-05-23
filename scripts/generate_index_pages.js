#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const config = require('./index_pages.config.js');

const repoRoot = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));

const flags = {
  check: args.has('--check'),
  dryRun: args.has('--dry-run'),
  list: args.has('--list')
};

function toRepoPath(filePath) {
  return path.join(repoRoot, filePath);
}

function toPosix(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function normalizeOutputPath(value) {
  let p = toPosix(value || '').trim();

  p = p.replace(/^\/+/, '');

  if (!p || p === '.') {
    return 'index.html';
  }

  if (p.endsWith('/')) {
    p += 'index.html';
  }

  if (!p.endsWith('index.html')) {
    p = p.replace(/\/+$/, '') + '/index.html';
  }

  p = path.posix.normalize(p);

  if (p === '.') {
    p = 'index.html';
  }

  if (p.startsWith('../') || path.posix.isAbsolute(p)) {
    throw new Error(`Unsafe output path: ${value}`);
  }

  return p;
}

function routeToIndexPath(route) {
  const cleaned = String(route || '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  return cleaned ? `${cleaned}/index.html` : 'index.html';
}

function getBaseHref(outputPath) {
  const normalized = normalizeOutputPath(outputPath);
  const dir = path.posix.dirname(normalized);

  if (dir === '.') {
    return './';
  }

  const depth = dir.split('/').filter(Boolean).length;
  return '../'.repeat(depth);
}

function loadSiteResources() {
  const siteResourcesPath = config.siteResourcesPath || 'assets/js/Config/SiteResources.js';
  const abs = toRepoPath(siteResourcesPath);

  if (!fs.existsSync(abs)) {
    throw new Error(`SiteResources file not found: ${siteResourcesPath}`);
  }

  const code = fs.readFileSync(abs, 'utf8');

  const sandbox = {
    console,
    window: {
      SiteFonts: {
        externalStyles: []
      }
    }
  };

  sandbox.global = sandbox.window;

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, {
    filename: siteResourcesPath
  });

  if (!sandbox.window.SiteResources) {
    throw new Error(`window.SiteResources was not created by ${siteResourcesPath}`);
  }

  return sandbox.window.SiteResources;
}

function makeEntry(outputPath, options) {
  const opts = options || {};
  const normalized = normalizeOutputPath(outputPath);

  return {
    outputPath: normalized,
    baseHref: opts.baseHref || getBaseHref(normalized),
    routeEntry: typeof opts.routeEntry === 'boolean'
      ? opts.routeEntry
      : normalized !== 'index.html',
    title: opts.title || config.title || 'Joker Chen'
  };
}

function collectEntries() {
  const siteResources = loadSiteResources();
  const entries = [];

  const rawEntries = Array.isArray(config.entries) ? config.entries : [];

  rawEntries.forEach((item) => {
    if (!item) return;

    if (item.sitePage) {
      const pages = siteResources.pages || {};
      const pageConfig = pages[item.sitePage];

      if (!pageConfig || !pageConfig.route) {
        throw new Error(`Missing route for SiteResources.pages.${item.sitePage}`);
      }

      entries.push(makeEntry(routeToIndexPath(pageConfig.route), item));
      return;
    }

    if (Object.prototype.hasOwnProperty.call(item, 'path')) {
      entries.push(makeEntry(item.path, item));
      return;
    }

    if (Object.prototype.hasOwnProperty.call(item, 'route')) {
      entries.push(makeEntry(routeToIndexPath(item.route), item));
      return;
    }

    throw new Error(`Invalid entry in scripts/index_pages.config.js: ${JSON.stringify(item)}`);
  });

  const activityConfig = config.activityMomentDetailEntries || {};

  if (activityConfig.enabled) {
    const baseRoute = String(activityConfig.baseRoute || 'life/activities_moments')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');

    const dates = siteResources.activitiesMoments &&
      Array.isArray(siteResources.activitiesMoments.dates)
      ? siteResources.activitiesMoments.dates
      : [];

    dates.forEach((dateKey) => {
      entries.push(makeEntry(`${baseRoute}/${dateKey}/index.html`, {
        routeEntry: true
      }));
    });
  }

  const deduped = [];
  const seen = new Map();

  entries.forEach((entry) => {
    if (seen.has(entry.outputPath)) {
      const previous = seen.get(entry.outputPath);

      if (
        previous.baseHref !== entry.baseHref ||
        previous.routeEntry !== entry.routeEntry ||
        previous.title !== entry.title
      ) {
        throw new Error(`Conflicting entry for ${entry.outputPath}`);
      }

      return;
    }

    seen.set(entry.outputPath, entry);
    deduped.push(entry);
  });

  return deduped;
}

function getRouteEntryHead(routeEntry) {
  if (!routeEntry) return '';

  return `<script>
  document.documentElement.classList.add('route-entry');
</script>

<style>
  html.route-entry #mount-cover,
  html.route-entry #cover {
    display: none !important;
  }
</style>`;
}

function renderTemplate(template, entry) {
  return template
    .replace(/\{\{GENERATED_NOTICE\}\}/g, config.generatedNotice || '')
    .replace(/\{\{BASE_HREF\}\}/g, entry.baseHref)
    .replace(/\{\{ROUTE_ENTRY_HEAD\}\}/g, getRouteEntryHead(entry.routeEntry))
    .replace(/\{\{TITLE\}\}/g, entry.title);
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function writeOrCheckEntry(entry, content) {
  const abs = toRepoPath(entry.outputPath);
  const exists = fs.existsSync(abs);
  const current = exists ? fs.readFileSync(abs, 'utf8') : null;

  if (current === content) {
    return {
      status: 'skip',
      path: entry.outputPath
    };
  }

  if (flags.check) {
    return {
      status: exists ? 'stale' : 'missing',
      path: entry.outputPath
    };
  }

  if (flags.dryRun) {
    return {
      status: exists ? 'would-update' : 'would-create',
      path: entry.outputPath
    };
  }

  fs.mkdirSync(path.dirname(abs), {
    recursive: true
  });

  fs.writeFileSync(abs, content, 'utf8');

  return {
    status: exists ? 'updated' : 'created',
    path: entry.outputPath
  };
}

function printList(entries) {
  entries.forEach((entry) => {
    const type = entry.routeEntry ? 'route-entry' : 'root';
    console.log(`${entry.outputPath}  [${type}, base=${entry.baseHref}]`);
  });
}

function printSummary(results) {
  const counts = results.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  console.log('\nIndex page generation summary');
  console.log('=============================');

  Object.keys(counts).sort().forEach((status) => {
    console.log(`${status}: ${counts[status]}`);
  });

  const changed = results.filter((item) => {
    return [
      'created',
      'updated',
      'missing',
      'stale',
      'would-create',
      'would-update'
    ].includes(item.status);
  });

  if (changed.length) {
    console.log('\nDetails');
    console.log('-------');

    changed.forEach((item) => {
      console.log(`${item.status}: ${item.path}`);
    });
  }
}

function main() {
  const entries = collectEntries();

  if (flags.list) {
    printList(entries);
    return;
  }

  const templatePath = config.templatePath || 'scripts/templates/index.template.html';
  const templateAbs = toRepoPath(templatePath);

  if (!fs.existsSync(templateAbs)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  const template = fs.readFileSync(templateAbs, 'utf8');
  const results = [];

  entries.forEach((entry) => {
    const content = ensureTrailingNewline(renderTemplate(template, entry));
    results.push(writeOrCheckEntry(entry, content));
  });

  printSummary(results);

  if (flags.check) {
    const hasDiff = results.some((item) => {
      return item.status === 'missing' || item.status === 'stale';
    });

    if (hasDiff) {
      console.error('\nGenerated index pages are not up to date.');
      console.error('Run: node scripts/generate_index_pages.js');
      process.exitCode = 1;
    }
  }
}

try {
  main();
} catch (err) {
  console.error('[generate_index_pages] Failed.');
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
}
