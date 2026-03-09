#!/usr/bin/env node
import { access, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = process.cwd();

const requiredModules = ['next/package.json', 'leaflet/package.json', 'date-fns/package.json'];
const args = new Set(process.argv.slice(2));
const shouldFix = args.has('--fix');

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function removeIfExists(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (await exists(absolutePath)) {
    await rm(absolutePath, { recursive: true, force: true });
    console.log(`Removed stale ${relativePath}`);
  }
}

const missing = [];
for (const modulePath of requiredModules) {
  try {
    require.resolve(modulePath, { paths: [root] });
  } catch {
    missing.push(modulePath.split('/')[0]);
  }
}

if (shouldFix) {
  await removeIfExists('.next/dev/lock');
  await removeIfExists('.next/cache');
}

if (missing.length > 0) {
  console.error('\nMissing runtime dependencies:', [...new Set(missing)].join(', '));
  console.error('Run a clean reinstall before starting the app:');
  console.error('  1) python -c "import shutil; shutil.rmtree(\'node_modules\', ignore_errors=True)"');
  console.error('  2) npm install');
  console.error('  3) npx prisma generate');
  process.exit(1);
}

console.log('Local dependency check passed.');
