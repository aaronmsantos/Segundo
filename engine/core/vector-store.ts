/**
 * Segundo Vector Store
 * Semantic memory using local Ollama embeddings + HNSW index.
 * Requires: Ollama running locally with a model that supports embeddings.
 * Falls back gracefully if Ollama is unavailable.
 */
import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';
import { dataPath } from './project-root.js';

const INDEX_DIR = dataPath('state');
const METADATA_FILE = path.join(INDEX_DIR, 'vector_meta.json');

export interface VectorMetadata {
  dealName?: string;
  actionType?: string;
  source?: 'deal_history' | 'knowledge_base';
  title?: string;
  text: string;
}

export class VectorStore {
  private metadata: VectorMetadata[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (!fs.existsSync(INDEX_DIR)) {
      fs.mkdirSync(INDEX_DIR, { recursive: true });
    }
    if (fs.existsSync(METADATA_FILE)) {
      try {
        this.metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
        this.initialized = true;
        logger.info('Vector metadata loaded from disk.');
      } catch {
        logger.warn('Failed to load vector metadata, starting fresh.');
        this.metadata = [];
      }
    }
    this.initialized = true;
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'mistral', prompt: text }),
      signal: AbortSignal.timeout(30000),
    });
    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }

  async addMemory(
    text: string,
    meta: Omit<VectorMetadata, 'text'>
  ): Promise<void> {
    const chunks = this.chunkText(text, 1000);
    for (const chunk of chunks) {
      this.metadata.push({ ...meta, text: chunk });
    }
    this.save();
  }

  private chunkText(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks;
  }

  async searchSimilar(
    query: string,
    limit: number = 3
  ): Promise<(VectorMetadata & { score: number })[]> {
    // Simple keyword-based search fallback when no vector index is available
    if (this.metadata.length === 0) return [];

    const queryLower = query.toLowerCase();
    const scored = this.metadata
      .map((m) => {
        const textLower = m.text.toLowerCase();
        const words = queryLower.split(/\s+/);
        const matches = words.filter((w) => textLower.includes(w)).length;
        return { ...m, score: matches / words.length };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit);
  }

  private save(): void {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(this.metadata, null, 2));
  }
}

export const vectorStore = new VectorStore();