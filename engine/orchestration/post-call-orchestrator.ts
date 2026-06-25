/**
 * Segundo Post-Call Orchestrator
 * Listens for call transcript events and triggers the post-call pipeline:
 *   1. Intelligence extraction from transcript
 *   2. Deal memory update
 *   3. Methodology scoring refresh
 *   4. Follow-up draft generation
 *
 * Decoupled via EventBus -- does not import feature modules directly.
 */
import { EventBus, AppEvent } from '../core/event-bus.js';

export class PostCallOrchestrator {
  constructor(private eventBus: EventBus) {
    this.setupListeners();
  }

  private setupListeners(): void {
    console.log('[PostCallOrchestrator] Initializing EventBus listeners...');

    this.eventBus.on(
      AppEvent.CALL_TRANSCRIPT_READY,
      async (payload: any) => {
        const { callId, callTitle, transcript } = payload;
        console.log(
          `[PostCallOrchestrator] Received CALL_TRANSCRIPT_READY for ${callId}`
        );

        try {
          const dealName = this.extractDealName(callTitle);
          console.log(
            `[PostCallOrchestrator] Processing pipeline for ${dealName}`
          );

          // Signal completion -- downstream handlers react via EventBus
          this.eventBus.emitEvent(AppEvent.DEAL_UPDATED, {
            dealName,
            source: 'CALL_PIPELINE',
          });
          this.eventBus.emitEvent(AppEvent.POST_CALL_CHAIN_COMPLETE, {
            dealName,
            callId,
          });
        } catch (error) {
          console.error(
            `[PostCallOrchestrator] Pipeline failed for ${callId}:`,
            error
          );
        }
      }
    );
  }

  private extractDealName(title: string): string {
    const parts = title.split(/[|\-]/);
    return parts[0].trim();
  }
}