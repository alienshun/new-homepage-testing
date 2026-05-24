#!/usr/bin/env node

/*
  Generate lossless WebP sidecar files and a manifest for the Stardust Math site.

  Usage:
    node scripts/generate_lossless_webp.js
    node scripts/generate_lossless_webp.js --force
    node scripts/generate_lossless_webp.js assets/images
    node scripts/generate_lossless_webp.js assets/images assets/other-images --force

  Converter priority:
    1. sharp Node package, if installed
    2. cwebp command line tool, if available
    3. ImageMagick magick command, if available
    4. ImageMagick convert command, if available

  Runtime policy:
    The website does not perform image size checks at runtime.
    This script decides whether a generated lossless WebP is worth using.
    Only smaller WebP files are written into assets/generated/webp-manifest.js.
*/

'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_SCAN_ROOTS = ['assets'];

const MANIFEST_PATH = path.join(REPO_ROOT, 'assets', 'generated', 'webp-manifest.js');

const SOURCE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.bmp',
  '.tif',
  '.tiff'
]);

const SKIPPED_DIR_NAMES = new Set([
  '.git',
  '.github',
  'node_modules',
  '.next',
  'dist',
  'build'
]);

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const CLEAN_UNPREFERRED = args.includes('--clean-unpreferred');

const scanRoots = args
  .filter((arg) => arg !== '--force' && arg !== '--clean-unpreferred')
  .map((arg) => arg.trim())
  .filter(Boolean);

const roots = scanRoots.length ? scanRoots : DEFAULT_SCAN_ROOTS;

let sharpModule = null;
let sharpChecked = false;

function log(message) {
  process.stdout.write(message + '\n');
}

function warn(message) {
  process.stderr.write('[warn] ' + message + '\n');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function toSitePath(filePath) {
  const rel = path.relative(REPO_ROOT, filePath);
  return '/' + toPosixPath(rel);
}

function isSupportedSource(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SOURCE_EXTENSIONS.has(ext);
}

function isGeneratedWebp(filePath) {
  return /\.webp$/i.test(filePath);
}

function shouldSkipDirectory(dirPath) {
  const base = path.basename(dirPath);

  if (SKIPPED_DIR_NAMES.has(base)) return true;

  const rel = toPosixPath(path.relative(REPO_ROOT, dirPath));

  return (
    rel === 'assets/generated' ||
    rel.startsWith('assets/generated/')
  );
}

function walk(dirPath, output) {
  if (!fs.existsSync(dirPath)) return;
  if (shouldSkipDirectory(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, output);
      return;
    }

    if (!entry.isFile()) return;
    if (isGeneratedWebp(fullPath)) return;
    if (!isSupportedSource(fullPath)) return;

    output.push(fullPath);
  });
}

function commandExists(command) {
  const checkCommand = process.platform === 'win32' ? 'where' : 'command';
  const checkArgs = process.platform === 'win32' ? [command] : ['-v', command];

  const result = childProcess.spawnSync(checkCommand, checkArgs, {
    stdio: 'ignore',
    shell: process.platform !== 'win32'
  });

  return result.status === 0;
}

function runCommand(command, commandArgs) {
  const result = childProcess.spawnSync(command, commandArgs, {
    stdio: 'pipe',
    encoding: 'utf-8'
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.trim() : '';
    const stdout = result.stdout ? result.stdout.trim() : '';
    throw new Error(stderr || stdout || `${command} exited with status ${result.status}`);
  }
}

function getSharp() {
  if (sharpChecked) return sharpModule;

  sharpChecked = true;

  try {
    // Optional dependency. The repository does not require it unless the user chooses this converter.
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    sharpModule = require('sharp');
  } catch (e) {
    sharpModule = null;
  }

  return sharpModule;
}

async function convertWithSharp(inputPath, outputPath) {
  const sharp = getSharp();

  if (!sharp) {
    throw new Error('sharp is not installed');
  }

  await sharp(inputPath)
    .webp({
      lossless: true,
      quality: 100,
      effort: 6
    })
    .toFile(outputPath);
}

function convertWithCwebp(inputPath, outputPath) {
  if (!commandExists('cwebp')) {
    throw new Error('cwebp is not available');
  }

  runCommand('cwebp', [
    '-quiet',
    '-lossless',
    '-exact',
    '-z',
    '9',
    inputPath,
    '-o',
    outputPath
  ]);
}

function convertWithMagick(inputPath, outputPath) {
  if (!commandExists('magick')) {
    throw new Error('magick is not available');
  }

  runCommand('magick', [
    inputPath,
    '-define',
    'webp:lossless=true',
    '-quality',
    '100',
    outputPath
  ]);
}

function convertWithConvert(inputPath, outputPath) {
  if (!commandExists('convert')) {
    throw new Error('convert is not available');
  }

  runCommand('convert', [
    inputPath,
    '-define',
    'webp:lossless=true',
    '-quality',
    '100',
    outputPath
  ]);
}

async function convertLosslessWebp(inputPath, outputPath) {
  ensureDir(path.dirname(outputPath));

  const converters = [
    {
      name: 'sharp',
      run: () => convertWithSharp(inputPath, outputPath)
    },
    {
      name: 'cwebp',
      run: () => convertWithCwebp(inputPath, outputPath)
    },
    {
      name: 'magick',
      run: () => convertWithMagick(inputPath, outputPath)
    },
    {
      name: 'convert',
      run: () => convertWithConvert(inputPath, outputPath)
    }
  ];

  const errors = [];

  for (const converter of converters) {
    try {
      await converter.run();

      if (!fs.existsSync(outputPath)) {
        throw new Error('converter finished but output file was not created');
      }

      return converter.name;
    } catch (err) {
      errors.push(`${converter.name}: ${err.message || String(err)}`);

      try {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch (e) {}
    }
  }

  throw new Error(
    'No available lossless WebP converter.\n' +
    'Install one of the following and rerun the script:\n' +
    '  npm install --save-dev sharp\n' +
    '  or install cwebp\n' +
    '  or install ImageMagick\n\n' +
    errors.join('\n')
  );
}

function isOutputFresh(inputPath, outputPath) {
  if (!fs.existsSync(outputPath)) return false;

  const inputStat = fs.statSync(inputPath);
  const outputStat = fs.statSync(outputPath);

  return outputStat.mtimeMs >= inputStat.mtimeMs;
}

function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function buildManifestContent(manifest) {
  return `(function (root) {
  'use strict';

  root.SiteWebpManifest = ${JSON.stringify(manifest, null, 2)};
})(typeof self !== 'undefined' ? self : window);
`;
}

async function main() {
  const sourceFiles = [];

  roots.forEach((root) => {
    const absRoot = path.resolve(REPO_ROOT, root);

    if (!fs.existsSync(absRoot)) {
      warn(`Scan root does not exist: ${root}`);
      return;
    }

    walk(absRoot, sourceFiles);
  });

  sourceFiles.sort((a, b) => {
    return toSitePath(a).localeCompare(toSitePath(b));
  });

  const manifest = {
    version: 'lossless-webp-manifest-v1',
    generatedAt: new Date().toISOString(),
    strategy: {
      quality: 'lossless',
      runtimeSizeCheck: false,
      preferredOnly: true,
      generatedWebpSuffix: '.webp',
      sourceExtensions: Array.from(SOURCE_EXTENSIONS).sort(),
      skippedExtensions: ['.svg', '.gif', '.webp']
    },
    images: {}
  };

  const summary = {
    scanned: sourceFiles.length,
    converted: 0,
    reused: 0,
    preferred: 0,
    unpreferred: 0,
    failed: 0,
    originalBytes: 0,
    preferredWebpBytes: 0
  };

  log(`Scanning ${sourceFiles.length} image source file(s)...`);

  for (const inputPath of sourceFiles) {
    const outputPath = inputPath + '.webp';
    const sourceSitePath = toSitePath(inputPath);
    const webpSitePath = toSitePath(outputPath);

    try {
      let converter = 'existing';

      if (FORCE || !isOutputFresh(inputPath, outputPath)) {
        converter = await convertLosslessWebp(inputPath, outputPath);
        summary.converted += 1;
      } else {
        summary.reused += 1;
      }

      const originalBytes = getFileSize(inputPath);
      const webpBytes = getFileSize(outputPath);

      const isPreferred = webpBytes < originalBytes;

      if (isPreferred) {
        const savingsPercent = Number(((1 - webpBytes / originalBytes) * 100).toFixed(2));

        manifest.images[sourceSitePath] = {
          webp: webpSitePath,
          originalBytes,
          webpBytes,
          savingsPercent
        };

        summary.preferred += 1;
        summary.originalBytes += originalBytes;
        summary.preferredWebpBytes += webpBytes;

        log(`+ ${sourceSitePath} -> ${webpSitePath} (${converter}, ${savingsPercent}% smaller)`);
      } else {
        summary.unpreferred += 1;

        if (CLEAN_UNPREFERRED) {
          try {
            fs.unlinkSync(outputPath);
          } catch (e) {}
        }

        log(`- ${sourceSitePath} kept as original (${formatBytes(originalBytes)} original, ${formatBytes(webpBytes)} webp)`);
      }
    } catch (err) {
      summary.failed += 1;
      warn(`${sourceSitePath} failed: ${err.message || String(err)}`);
    }
  }

  ensureDir(path.dirname(MANIFEST_PATH));
  fs.writeFileSync(MANIFEST_PATH, buildManifestContent(manifest), 'utf-8');

  const totalSavings = summary.originalBytes > 0
    ? Number(((1 - summary.preferredWebpBytes / summary.originalBytes) * 100).toFixed(2))
    : 0;

  log('');
  log('Done.');
  log(`Scanned: ${summary.scanned}`);
  log(`Converted: ${summary.converted}`);
  log(`Reused: ${summary.reused}`);
  log(`Preferred WebP entries: ${summary.preferred}`);
  log(`Unpreferred WebP files: ${summary.unpreferred}`);
  log(`Failed: ${summary.failed}`);
  log(`Preferred original size: ${formatBytes(summary.originalBytes)}`);
  log(`Preferred WebP size: ${formatBytes(summary.preferredWebpBytes)}`);
  log(`Total preferred saving: ${totalSavings}%`);
  log(`Manifest written to: ${toSitePath(MANIFEST_PATH)}`);

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + '\n');
  process.exit(1);
});
