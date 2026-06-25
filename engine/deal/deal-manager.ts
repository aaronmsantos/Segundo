/**
 * Segundo Deal Manager
 * CRUD operations for deal configurations stored as JSON files.
 * Syncs to Prisma SQLite for relational queries.
 * Emits events on deal changes for downstream orchestration.
 */
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { prisma } from '../core/database.js';
import { dataPath } from '../core/project-root.js';

const dealEventEmitter = new EventEmitter();

export function onDealUpdated(callback: (deal: DealConfig) => void): void {
  dealEventEmitter.on('deal_updated', callback);
}

export function onDealScored(
  callback: (data: { dealId: string; scores: Record<string, string> }) => void
): void {
  dealEventEmitter.on('methodology_scored', callback);
}

export function emitDealEvent(eventType: string, data: unknown): void {
  dealEventEmitter.emit(eventType, data);
}

export interface DealConfig {
  name: string;
  domain: string;
  stage: string;
  acv: number;
  champion: string;
  economicBuyer: string;
  closeDateTarget: string;
  competitors: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export class DealManager {
  private static dealsDir = dataPath('deals');

  private static ensureDir(): void {
    if (!fs.existsSync(this.dealsDir)) {
      fs.mkdirSync(this.dealsDir, { recursive: true });
    }
  }

  private static filePath(name: string): string {
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_');
    return path.join(this.dealsDir, `${sanitized}.json`);
  }

  /** Load a deal config by name. */
  static load(name: string): DealConfig | null {
    const fp = this.filePath(name);
    if (!fs.existsSync(fp)) return null;
    try {
      return JSON.parse(fs.readFileSync(fp, 'utf8')) as DealConfig;
    } catch {
      return null;
    }
  }

  /** Save a deal config. */
  static save(config: DealConfig): string {
    this.ensureDir();
    config.updatedAt = new Date().toISOString();
    const fp = this.filePath(config.name);
    fs.writeFileSync(fp, JSON.stringify(config, null, 2), 'utf8');

    const competitorNames = config.competitors || [];
    const stakeholders = [
      config.champion ? { name: config.champion, role: 'Champion' } : null,
      config.economicBuyer
        ? { name: config.economicBuyer, role: 'Economic Buyer' }
        : null,
    ].filter(
      (s): s is { name: string; role: string } => s !== null
    );

    // Non-blocking sync to Prisma
    prisma.deal
      .upsert({
        where: { name: config.name },
        update: {
          stage: config.stage,
          acv: config.acv,
          stakeholders: {
            deleteMany: { role: { in: ['Champion', 'Economic Buyer'] } },
            create: stakeholders,
          },
          competitors: {
            deleteMany: {},
            create: competitorNames.map((c) => ({ competitorName: c })),
          },
          closeDateTarget: config.closeDateTarget,
        },
        create: {
          name: config.name,
          stage: config.stage,
          acv: config.acv,
          stakeholders: { create: stakeholders },
          competitors: {
            create: competitorNames.map((c) => ({ competitorName: c })),
          },
          closeDateTarget: config.closeDateTarget,
        },
      })
      .catch((err: any) => {
        console.error(`[Prisma] Failed to sync ${config.name}: ${err.message}`);
      });

    dealEventEmitter.emit('deal_updated', {
      deal_id: config.name,
      changes: config,
      timestamp: new Date().toISOString(),
    });

    return fp;
  }

  /** List all saved deal configs. */
  static list(): DealConfig[] {
    this.ensureDir();
    const files = fs
      .readdirSync(this.dealsDir)
      .filter((f: string) => f.endsWith('.json'));
    return files
      .map((f: string) => {
        try {
          return JSON.parse(
            fs.readFileSync(path.join(this.dealsDir, f), 'utf8')
          ) as DealConfig;
        } catch {
          return null;
        }
      })
      .filter(
        (d: DealConfig | null): d is DealConfig =>
          d !== null &&
          typeof d.name === 'string' &&
          typeof d.stage === 'string'
      );
  }
}