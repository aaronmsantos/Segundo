/**
 * Segundo Gong Connector
 * Fetches call recordings and transcripts from the Gong API.
 * Credentials read from environment variables.
 */

interface GongCall {
  id: string;
  title: string;
  duration: number;
  started: string;
}

export class GongClient {
  private baseURL = 'https://api.gong.io/v2';

  private getAuthHeader(): string {
    const key = process.env.GONG_ACCESS_KEY;
    const secret = process.env.GONG_ACCESS_SECRET;
    if (!key || !secret) {
      throw new Error(
        'Missing Gong credentials (GONG_ACCESS_KEY, GONG_ACCESS_SECRET)'
      );
    }
    return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
  }

  async fetchRecentCalls(daysBack: number = 7): Promise<GongCall[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const url = `${this.baseURL}/calls?fromDateTime=${fromDate.toISOString()}`;
    const res = await fetch(url, {
      headers: { Authorization: this.getAuthHeader() },
    });

    if (!res.ok) {
      throw new Error(`Gong API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { calls: GongCall[] };
    return data.calls || [];
  }

  async searchCalls(keyword: string, daysBack: number = 30): Promise<GongCall[]> {
    const calls = await this.fetchRecentCalls(daysBack);
    return calls.filter(
      (c) => c.title && c.title.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}