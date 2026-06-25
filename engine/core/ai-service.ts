/**
 * Segundo AI Service
 * Unified LLM completion interface with multi-provider support.
 * Routes through ModelRouter for dynamic model selection.
 * Falls back gracefully: Ollama -> Anthropic -> simulation.
 */
import Anthropic from '@anthropic-ai/sdk';
import { ModelRouter, IntelligenceLevel } from './model-router.js';

const DEFAULT_SYSTEM = 'You are a senior B2B sales intelligence engine. Be precise, commercial, and direct.';

let ollamaAvailable: boolean | null = null;

async function checkOllama(): Promise<boolean> {
  if (ollamaAvailable !== null) return ollamaAvailable;
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000),
    });
    ollamaAvailable = res.ok;
  } catch {
    ollamaAvailable = false;
  }
  return ollamaAvailable;
}

export class AIService {
  private client: Anthropic | null = null;

  constructor(private router: ModelRouter = new ModelRouter()) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'your_api_key') {
      this.client = new Anthropic({ apiKey });
    }
  }

  async complete(
    prompt: string,
    level: IntelligenceLevel = IntelligenceLevel.FAST_FORMATTING,
    systemPrompt?: string,
    maxTokens?: number
  ): Promise<string> {
    // Route zero-cost tasks to Ollama if available
    if (level === IntelligenceLevel.ZERO_COST_LOCAL) {
      const available = await checkOllama();
      if (available) {
        return this.completeLocal(prompt, 'mistral:latest', systemPrompt);
      }
      level = IntelligenceLevel.FAST_FORMATTING;
    }

    if (!this.client) {
      return this.simulate(prompt);
    }

    const model = this.router.resolveModel(level, 'anthropic');

    try {
      const response = await this.client.messages.create({
        model: model.replace('ollama/', ''),
        max_tokens: maxTokens ?? 1024,
        system: systemPrompt ?? DEFAULT_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      });

      const block = response.content[0];
      if (block.type !== 'text') throw new Error('Unexpected response type');
      return block.text;
    } catch (err: any) {
      console.error(`[AIService] API failure for ${model}: ${err.message || err}`);
      return this.simulate(prompt);
    }
  }

  private async completeLocal(
    prompt: string,
    model: string,
    systemPrompt?: string
  ): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt ?? DEFAULT_SYSTEM}\n\nUSER: ${prompt}`,
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await response.json() as { response: string };
      return data.response;
    } catch {
      ollamaAvailable = false;
      return this.simulate(prompt);
    }
  }

  private simulate(prompt: string): string {
    return `[SIMULATION - no API key configured] ${prompt.substring(0, 100)}...`;
  }

  async evaluate(context: {
    prompt: string;
    level?: IntelligenceLevel;
    systemPrompt?: string;
  }): Promise<string> {
    return this.complete(
      context.prompt,
      context.level || IntelligenceLevel.STANDARD_EXECUTION,
      context.systemPrompt
    );
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    return this.complete(fullPrompt, IntelligenceLevel.STANDARD_EXECUTION);
  }
}

// Export singleton for convenience
const router = new ModelRouter();
export const aiService = new AIService(router);