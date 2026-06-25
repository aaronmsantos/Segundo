import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const cliPath = join(repoRoot, 'scripts', 'cli.ts');
const tsxPath = join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const tempDirs: string[] = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), 'segundo-cli-'));
  tempDirs.push(dir);
  return dir;
}

function makeConfiguredCwd() {
  const cwd = makeTempDir();
  mkdirSync(join(cwd, 'config'), { recursive: true });
  writeFileSync(
    join(cwd, 'config', 'company.yaml'),
    [
      'company:',
      '  name: "Smoke Labs"',
      'methodology:',
      '  framework: bant',
      '',
    ].join('\n')
  );
  return cwd;
}

function addDeal(cwd: string) {
  mkdirSync(join(cwd, 'data', 'deals'), { recursive: true });
  writeFileSync(
    join(cwd, 'data', 'deals', 'acme.json'),
    JSON.stringify(
      {
        name: 'Acme Corp',
        stage: 'Discovery',
        acv: 50000,
        champion: 'Jane Doe',
        economicBuyer: 'John Smith',
        closeDateTarget: '2026-09-30',
        competitors: ['IncumbentCo'],
        scores: {
          budget: { score: 'yellow', evidence: 'Budget range discussed but not approved.' },
          authority: { score: 'yellow', evidence: 'CFO identified but not engaged.' },
          need: { score: 'green', evidence: 'Champion described a clear operational problem.' },
          timeline: { score: 'yellow', evidence: 'Target close date exists; consequence not validated.' },
        },
      },
      null,
      2
    )
  );
}

function runSegundo(args: string[], cwd = repoRoot) {
  return spawnSync(process.execPath, [tsxPath, cliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      NO_COLOR: '1',
    },
  });
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('segundo CLI smoke behavior', () => {
  test('prints help without requiring local config', () => {
    const result = runSegundo(['help'], makeTempDir());

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('local-first sales OS');
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('npx segundo <command> [options]');
    expect(result.stdout).toContain('brief');
    expect(result.stdout).toContain('init');
    expect(result.stdout).toContain('No external API calls are made by these commands.');
  });

  test('prints package version without requiring local config', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf-8'));
    const result = runSegundo(['version'], makeTempDir());

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout.trim()).toBe(`segundo v${pkg.version}`);
  });

  test('loads config from current working directory for a command path', () => {
    const result = runSegundo(['brief'], makeConfiguredCwd());

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('SEGUNDO BRIEF');
    expect(result.stdout).toContain('Company: Smoke Labs');
    expect(result.stdout).toContain('Methodology: BANT');
    expect(result.stdout).toContain('Pipeline state is empty');
    expect(result.stdout).toContain('Create your first deal');
  });

  test('inspects a local deal fixture without external services', () => {
    const cwd = makeConfiguredCwd();
    addDeal(cwd);

    const result = runSegundo(['inspect', '--deal', 'Acme'], cwd);

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('DEAL INSPECTION | Acme Corp');
    expect(result.stdout).toContain('SCORE:');
    expect(result.stdout).toContain('NEXT BEST ACTION:');
    expect(result.stdout).toContain('data/deals/acme.json');
  });

  test('fails fast when a command requires missing config', () => {
    const result = runSegundo(['inspect'], makeTempDir());

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Segundo is not initialized here.');
    expect(result.stdout).toContain('Missing: config/company.yaml');
    expect(result.stdout).toContain('Run: npx segundo init');
  });
});
