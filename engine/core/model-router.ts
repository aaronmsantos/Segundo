/**
 * Segundo Model Router
 * Dynamic LLM arbitration. Routes tasks to the appropriate model tier
 * based on intelligence level required. Avoids hardcoding model names
 * throughout the codebase.
 */

export enum IntelligenceLevel {
  ZERO_COST_LOCAL = 'ZERO_COST_LOCAL',     // Ollama / Mistral (free, local)
  FAST_FORMATTING = 'FAST_FORMATTING',     // Haiku / Gemini Flash (cheap, fast)
  STANDARD_EXECUTION = 'STANDARD_EXECUTION', // Sonnet (balanced)
  ADVANCED_REASONING = 'ADVANCED_REASONING', // Legacy alias for deep strategy
  DEEP_STRATEGY = 'DEEP_STRATEGY',         // Opus / o1 (max intelligence)
}

export class ModelRouter {
  resolveModel(
    level: IntelligenceLevel,
    provider: 'anthropic' | 'google' = 'anthropic'
  ): string {
    if (provider === 'google') {
      switch (level) {
        case IntelligenceLevel.FAST_FORMATTING:
          return 'gemini-2.5-flash';
        case IntelligenceLevel.STANDARD_EXECUTION:
        case IntelligenceLevel.DEEP_STRATEGY:
        case IntelligenceLevel.ADVANCED_REASONING:
          return 'gemini-2.5-pro';
        default:
          return 'gemini-2.5-flash';
      }
    }

    switch (level) {
      case IntelligenceLevel.ZERO_COST_LOCAL:
        return 'ollama/mistral:latest';
      case IntelligenceLevel.FAST_FORMATTING:
        return 'claude-haiku-4-5';
      case IntelligenceLevel.STANDARD_EXECUTION:
        return 'claude-sonnet-4-5';
      case IntelligenceLevel.ADVANCED_REASONING:
      case IntelligenceLevel.DEEP_STRATEGY:
        return 'claude-opus-4';
      default:
        return 'claude-sonnet-4-5';
    }
  }
}