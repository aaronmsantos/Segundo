#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

const commands: Record<string, string> = {
  brief: 'Generate your morning briefing',
  inspect: 'Run a deal health inspection',
  review: 'Review your full pipeline',
  prep: 'Generate a pre-call brief',
  'post-call': 'Process a completed call',
  research: 'Research a company',
  init: 'Set up Segundo for your company',
};

const [, , command, ...args] = process.argv;

if (!command || command === 'help') {
  console.log('\n  segundo - Sales AI Operating System\n');
  console.log('  Usage: npx segundo <command> [options]\n');
  console.log('  Commands:');
  for (const [cmd, desc] of Object.entries(commands)) {
    console.log(`    ${cmd.padEnd(15)} ${desc}`);
  }
  console.log('\n  Get started: npx segundo init\n');
  process.exit(0);
}

if (command === 'version') {
  const pkg = JSON.parse(
    readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf-8')
  );
  console.log(`segundo v${pkg.version}`);
  process.exit(0);
}

// Load company config
const configPath = join(process.cwd(), 'config', 'company.yaml');
try {
  const config = parse(readFileSync(configPath, 'utf-8'));
  console.log(
    `\n  Segundo loaded for: ${config.company?.name || 'Unknown Company'}`
  );
  console.log(
    `  Methodology: ${config.methodology?.framework || 'meddpicc'}`
  );
  console.log(`  Running: ${command} ${args.join(' ')}\n`);
} catch {
  console.log(
    '\n  No config found. Run "npx segundo init" to get started.\n'
  );
  process.exit(1);
}

console.log(`  Command "${command}" is ready for implementation.`);
console.log('  Skills will be loaded from ./skills/ directory.\n');