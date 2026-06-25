/**
 * Segundo DI Container
 * Manual dependency injection wiring. Avoids reliance on
 * emitDecoratorMetadata which is unreliable in tsx/esbuild.
 *
 * Boot sequence: instantiate core services, register them,
 * then wire up orchestrators and watchers.
 */
import { AIService } from './ai-service.js';
import { ModelRouter } from './model-router.js';
import { EventBus, eventBus } from './event-bus.js';
import { Database } from './database.js';

// Simple service registry (no tsyringe dependency for open-source version)
const registry = new Map<string, unknown>();

export function registerService<T>(key: string, instance: T): void {
  registry.set(key, instance);
}

export function resolveService<T>(key: string): T {
  const instance = registry.get(key);
  if (!instance) throw new Error(`Service not registered: ${key}`);
  return instance as T;
}

export function bootContainer(): void {
  console.log('[DI] Boot sequence starting...');

  // 1. Core Services
  const router = new ModelRouter();
  const ai = new AIService(router);
  const bus = eventBus;
  const db = new Database();

  // 2. Register
  registerService('ModelRouter', router);
  registerService('AIService', ai);
  registerService('EventBus', bus);
  registerService('Database', db);

  console.log('[DI] Boot sequence complete.');
}