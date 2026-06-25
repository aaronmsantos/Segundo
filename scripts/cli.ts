#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runSegundoCommand } from '../engine/cli/local-runtime.js';

const [, , command, ...args] = process.argv;

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(here);
const result = runSegundoCommand({
  command,
  args,
  cwd: process.cwd(),
  packageRoot,
});

process.stdout.write(result.output);
process.exit(result.code);

function findPackageRoot(start: string): string {
  let dir = path.resolve(start);
  while (true) {
    const candidate = path.join(dir, 'package.json');
    if (exists(candidate)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start, '..');
    dir = parent;
  }
}

function exists(file: string): boolean {
  return fs.existsSync(file);
}
