/**
 * Segundo Deal Memory Watcher
 * Watches deal memory markdown files for changes and emits events.
 * Memory files follow the pattern: deal_*.md in the configured memory directory.
 */
import path from 'path';
import fs from 'fs';
import { EventBus, AppEvent } from '../core/event-bus.js';
import { dataPath } from '../core/project-root.js';

const DEAL_MEMORY_DIR = dataPath('memory', 'deals');

export interface DealMemoryUpdatePayload {
  dealName: string;
  filePath: string;
  timestamp: string;
  changeType: 'add' | 'change';
}

export class DealMemoryWatcher {
  private watching = false;
  private watchAbort: AbortController | null = null;

  constructor(private eventBus: EventBus) {}

  /**
   * Parse deal name from filename.
   * e.g. deal_evolve.md -> Evolve, deal_ava_labs.md -> Ava Labs
   */
  private parseDealName(filePath: string): string {
    const basename = path.basename(filePath, '.md');
    const raw = basename.replace(/^deal_/, '');
    return raw
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Start watching deal memory files.
   * Uses Node.js fs.watch (no chokidar dependency).
   */
  start(): void {
    if (this.watching) {
      console.log('[DealMemoryWatcher] Already running.');
      return;
    }

    if (!fs.existsSync(DEAL_MEMORY_DIR)) {
      fs.mkdirSync(DEAL_MEMORY_DIR, { recursive: true });
    }

    console.log(`[DealMemoryWatcher] Watching ${DEAL_MEMORY_DIR}`);
    this.watching = true;
    this.watchAbort = new AbortController();

    fs.watch(
      DEAL_MEMORY_DIR,
      { signal: this.watchAbort.signal },
      (eventType, filename) => {
        if (!filename || !filename.startsWith('deal_') || !filename.endsWith('.md')) {
          return;
        }
        const filePath = path.join(DEAL_MEMORY_DIR, filename);
        const changeType = eventType === 'rename' ? 'add' : 'change';
        this.handleFileEvent(filePath, changeType);
      }
    );
  }

  private handleFileEvent(
    filePath: string,
    changeType: 'add' | 'change'
  ): void {
    const dealName = this.parseDealName(filePath);
    const payload: DealMemoryUpdatePayload = {
      dealName,
      filePath,
      timestamp: new Date().toISOString(),
      changeType,
    };

    console.log(
      `[DealMemoryWatcher] ${changeType === 'add' ? 'New' : 'Updated'}: ${dealName}`
    );

    this.eventBus.emitEvent(AppEvent.DEAL_MEMORY_UPDATED, payload);
  }

  async stop(): Promise<void> {
    if (this.watchAbort) {
      this.watchAbort.abort();
      this.watchAbort = null;
    }
    this.watching = false;
    console.log('[DealMemoryWatcher] Stopped.');
  }
}