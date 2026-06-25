/**
 * Segundo Slack Connector
 * Sends alerts and notifications to Slack via incoming webhooks.
 * Webhook URL read from environment variable.
 */
import { logger } from '../core/logger.js';

export async function sendSlackAlert(
  message: string,
  blocks?: unknown[]
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn(
      'SLACK_WEBHOOK_URL not set. Skipping Slack alert.'
    );
    return;
  }

  try {
    const payload: Record<string, unknown> = { text: message };
    if (blocks) {
      payload.blocks = blocks;
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Slack webhook returned ${res.status}`);
    }

    logger.info(`Slack alert sent: ${message.substring(0, 50)}...`);
  } catch (err: any) {
    logger.error(`Failed to send Slack alert: ${err.message}`);
  }
}

/**
 * Build a standard Morning Briefing Block Kit payload.
 */
export function buildMorningBriefingBlocks(stats: {
  totalDeals: number;
  atRiskDeals: string[];
}): unknown[] {
  const blocks: unknown[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Segundo: Morning Pipeline Briefing',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Deals Analyzed:* ${stats.totalDeals}`,
      },
    },
    { type: 'divider' },
  ];

  if (stats.atRiskDeals.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*At-Risk Deals:*\n${stats.atRiskDeals.map((d) => `- ${d}`).join('\n')}`,
      },
    });
  } else {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'All clear. No critical risks detected.',
      },
    });
  }

  return blocks;
}