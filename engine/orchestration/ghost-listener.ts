/**
 * Segundo Ghost Listener
 * HTTP webhook server + WebSocket broadcaster for real-time deal telemetry.
 * Receives signals from browser extensions, CRM webhooks, and call platforms.
 * Broadcasts events to connected UI clients and routes to the EventBus.
 *
 * Start with: npx segundo listen
 */
import { AppEvent, eventBus } from '../core/event-bus.js';
import { logger } from '../core/logger.js';
import { DealManager, DealConfig } from '../deal/deal-manager.js';
import { DealMemoryWatcher } from '../deal/deal-memory-watcher.js';

const DEFAULT_PORT = 3001;

export class GhostListener {
  private port = Number(process.env.SEGUNDO_PORT || DEFAULT_PORT);

  /**
   * Match an active deal from recipient email domain or company name.
   */
  private matchDealFromContext(
    recipient: string | undefined,
    searchText: string
  ): DealConfig | null {
    const deals = DealManager.list();
    if (deals.length === 0) return null;

    // 1. Match by recipient email domain
    if (recipient && recipient.includes('@')) {
      const recipientDomain = recipient.split('@')[1].toLowerCase();
      const domainMatch = deals.find(
        (d) =>
          d.domain &&
          recipientDomain.endsWith(
            d.domain.toLowerCase().replace(/^www\./, '')
          )
      );
      if (domainMatch) return domainMatch;
    }

    // 2. Match by deal name or domain root in text
    const text = searchText.toLowerCase();
    const nameMatch = deals.find((d) => {
      const nameLower = d.name.toLowerCase();
      const domainRoot = d.domain?.toLowerCase().split('.')[0] || '';
      return (
        text.includes(nameLower) ||
        (domainRoot.length > 2 && text.includes(domainRoot))
      );
    });

    return nameMatch || null;
  }

  /**
   * Start the telemetry listener.
   * Note: This is a minimal HTTP server. For production use with
   * WebSockets, add express + socket.io as optional dependencies.
   */
  async start(): Promise<void> {
    const { createServer } = await import('http');

    const server = createServer((req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/api/deal-domains') {
        const domains = DealManager.list()
          .filter((d) => d.domain)
          .map((d) => d.domain.toLowerCase().replace(/^www\./, ''));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ domains }));
        return;
      }

      if (req.method === 'POST' && req.url === '/api/webhook/browser') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            const { platform, action, context, timestamp } = JSON.parse(body);
            console.log(`[TELEMETRY] ${platform?.toUpperCase()} -> ${action}`);
            logger.info(
              `Browser Telemetry: ${platform} - ${action} - ${JSON.stringify(context)}`
            );

            // Route draft updates through the EventBus
            if (platform === 'gmail' && action === 'draft_update' && context?.body) {
              const deal = this.matchDealFromContext(
                context?.recipient,
                context.body
              );
              eventBus.emitEvent(AppEvent.BROWSER_TELEMETRY_RECEIVED, {
                platform,
                action,
                context,
                dealName: deal?.name || 'General',
              });
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'Telemetry Received.' }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    // Start deal memory watcher
    const watcher = new DealMemoryWatcher(eventBus);
    watcher.start();

    server.listen(this.port, () => {
      console.log(`[Ghost Listener] Telemetry server on port ${this.port}`);
      console.log(
        `[Ghost Listener] Active deals: ${DealManager.list().length}`
      );
    });
  }
}