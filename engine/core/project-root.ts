/**
 * Segundo Project Root Resolver
 * Derives the project root reliably regardless of where the process was started.
 *
 * Priority:
 *   1. SEGUNDO_ROOT env var (explicit override)
 *   2. This file's own location (engine/core/project-root.ts -> ../..)
 *   3. process.cwd() as last-resort fallback
 */
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

function resolveRoot(): string {
  if (process.env.SEGUNDO_ROOT) {
    return process.env.SEGUNDO_ROOT;
  }
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    // engine/core/ -> ../.. = project root
    const candidate = path.resolve(here, '..', '..');
    if (
      fs.existsSync(path.join(candidate, 'package.json')) ||
      fs.existsSync(path.join(candidate, 'data'))
    ) {
      return candidate;
    }
  } catch {
    // ignore and fall through
  }
  return process.cwd();
}

export const segundoRoot: string = resolveRoot();

export function dataPath(...segments: string[]): string {
  return path.join(segundoRoot, 'data', ...segments);
}

export function projectPath(...segments: string[]): string {
  return path.join(segundoRoot, ...segments);
}