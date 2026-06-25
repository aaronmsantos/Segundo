/**
 * Segundo Database
 * Prisma-based SQLite persistence for deal data, logs, and analytics.
 * Uses the project's local memory.db file.
 */
import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Prisma Client singleton -- initialized lazily
let _prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient();
  }
  return _prisma;
}

export const prisma = getPrisma();

export class Database {
  public client = prisma;

  async logAction(
    dealName: string,
    actionType: string,
    summary: string
  ): Promise<void> {
    const deal = await this.client.deal.upsert({
      where: { name: dealName },
      update: {},
      create: {
        name: dealName,
        stage: 'Prospecting',
        acv: 0.0,
      },
    });

    await this.client.dealLog.create({
      data: {
        dealId: deal.id,
        actionType,
        contextSummary: summary,
      },
    });

    logger.info(`Memory logged: ${actionType} for ${dealName}`);
  }

  async getDealHistory(dealName: string): Promise<string> {
    const deal = await this.client.deal.findUnique({
      where: { name: dealName },
      include: {
        dealLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    if (!deal || deal.dealLogs.length === 0) {
      return 'No previous history for this deal.';
    }

    return deal.dealLogs
      .map(
        (r: any) =>
          `[${r.timestamp.toISOString()}] ${r.actionType}: ${r.contextSummary}`
      )
      .join('\n');
  }
}

// Legacy function exports for backward compatibility
export async function initDatabase(): Promise<PrismaClient> {
  logger.info('Prisma Database connection initialized.');
  return prisma;
}

export async function logAction(
  dealName: string,
  actionType: string,
  summary: string
): Promise<void> {
  const db = new Database();
  return db.logAction(dealName, actionType, summary);
}

export async function getDealHistory(dealName: string): Promise<string> {
  const db = new Database();
  return db.getDealHistory(dealName);
}

export async function getAnalytics(): Promise<
  { action_type: string; count: number }[]
> {
  const groups = await prisma.dealLog.groupBy({
    by: ['actionType'],
    _count: { actionType: true },
    orderBy: { _count: { actionType: 'desc' } },
  });

  return groups.map((g: any) => ({
    action_type: g.actionType,
    count: g._count.actionType,
  }));
}