/**
 * Segundo Event Bus
 * Pub/Sub event system for decoupled module communication.
 * Modules emit events; other modules subscribe independently.
 */
import { EventEmitter } from 'events';

export enum AppEvent {
  BROWSER_TELEMETRY_RECEIVED = 'BROWSER_TELEMETRY_RECEIVED',
  DRAFT_DETECTED = 'DRAFT_DETECTED',
  CRITIQUE_GENERATED = 'CRITIQUE_GENERATED',
  WIN_LOSS_ANALYSIS_COMPLETED = 'WIN_LOSS_ANALYSIS_COMPLETED',
  LEAD_SCORED = 'LEAD_SCORED',
  DRAFT_GENERATED = 'DRAFT_GENERATED',
  CALL_TRANSCRIPT_READY = 'CALL_TRANSCRIPT_READY',
  DEAL_UPDATED = 'DEAL_UPDATED',
  POST_CALL_CHAIN_COMPLETE = 'POST_CALL_CHAIN_COMPLETE',
  DRIFT_DETECTED = 'DRIFT_DETECTED',
  DEAL_MEMORY_UPDATED = 'DEAL_MEMORY_UPDATED',
  CALL_SCORES_SYNCED = 'CALL_SCORES_SYNCED',
  CALL_SYNC_FAILED = 'CALL_SYNC_FAILED',
}

export class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  emitEvent(event: AppEvent, data: unknown): void {
    console.log(`[EventBus] EMIT: ${event}`);
    this.emitter.emit(event, data);
  }

  on(event: AppEvent, listener: (data: any) => void): void {
    this.emitter.on(event, listener);
  }

  off(event: AppEvent, listener: (data: any) => void): void {
    this.emitter.off(event, listener);
  }
}

export const eventBus = new EventBus();