# Connectors Guide

Connectors bridge Segundo to external systems: CRMs, call recording platforms, email, and any other data source your sales workflow touches.

## What Connectors Do

A connector handles three concerns:
1. **Authentication** -- OAuth flows, API keys, token refresh
2. **Sync** -- Pull data from the external system into Segundo's memory
3. **Writeback** -- Push updates from Segundo back to the external system

## Built-In Connectors

### Salesforce
- Syncs Opportunities, Contacts, and Activities
- Writes back: Next Steps, MEDDPICC scores, custom fields
- Auth: OAuth 2.0 with refresh token

### HubSpot
- Syncs Deals, Contacts, and Engagement data
- Writes back: Deal properties, notes
- Auth: OAuth 2.0 or private app token

### CSV Import
- Bulk import deals from a CSV file
- No writeback (read-only)
- No auth required

## Connector Interface

Every connector implements the `Connector` interface:

```typescript
interface Connector {
  /** Unique identifier for this connector */
  readonly id: string;

  /** Display name */
  readonly name: string;

  /** Run the authentication flow */
  authenticate(config: ConnectorConfig): Promise<AuthResult>;

  /** Refresh an expired token */
  refreshAuth(auth: AuthResult): Promise<AuthResult>;
  /** Pull deals from the external system */
  syncDeals(options?: SyncOptions): Promise<Deal[]>;

  /** Pull contacts associated with deals */
  syncContacts(dealIds: string[]): Promise<Contact[]>;

  /** Write data back to the external system */
  writeback(dealId: string, updates: WritebackPayload): Promise<WritebackResult>;

  /** Check if the connector is properly configured and authenticated */
  healthCheck(): Promise<HealthStatus>;
}
```

## Building a Custom Connector

### Step 1: Create the Directory

```
connectors/
  my-connector/
    index.ts          # Connector implementation
    config.ts         # Configuration schema
    mapper.ts         # Field mapping logic
```

### Step 2: Implement the Interface

```typescript
import { Connector, ConnectorConfig, AuthResult, Deal } from '../types.js';

export class MyConnector implements Connector {
  readonly id = 'my-connector';
  readonly name = 'My CRM';

  async authenticate(config: ConnectorConfig): Promise<AuthResult> {
    // Implement auth flow
    // Store tokens securely
    return { success: true, expiresAt: new Date() };
  }

  async refreshAuth(auth: AuthResult): Promise<AuthResult> {
    // Refresh expired tokens
    return { success: true, expiresAt: new Date() };
  }

  async syncDeals(options?: SyncOptions): Promise<Deal[]> {
    // Fetch deals from external system
    // Map external fields to Segundo's Deal schema
    return [];
  }