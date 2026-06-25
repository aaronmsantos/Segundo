/**
 * Segundo Logger
 * Structured logging to file + console.
 * Logs are written to data/state/system.log.
 */
import fs from 'fs';
import path from 'path';
import { segundoRoot, dataPath } from './project-root.js';

const logDir = dataPath('state');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'system.log');

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function writeLog(level: LogLevel, message: string): void {
  const line = `[${formatTimestamp()}] [${level}] ${message}\n`;
  fs.appendFileSync(logFile, line);
  if (level === 'ERROR') {
    console.error(line.trim());
  } else {
    console.log(line.trim());
  }
}

export const logger = {
  info: (message: string) => writeLog('INFO', message),
  warn: (message: string) => writeLog('WARN', message),
  error: (message: string) => writeLog('ERROR', message),
  debug: (message: string) => writeLog('DEBUG', message),
};