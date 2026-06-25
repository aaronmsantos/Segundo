/**
 * Segundo HubSpot Connector
 * Fetches pipeline deals and contacts from HubSpot CRM API.
 * API token read from environment variable.
 */

export interface HubSpotDeal {
  id: string;
  name: string;
  amount: number;
  stage: string;
  closeDate: string;
}

export interface HubSpotContact {
  name: string;
  email: string;
  title: string;
  company: string;
}

export class HubSpotClient {
  private baseURL = 'https://api.hubapi.com';

  private getHeaders(): Record<string, string> {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        'Missing HubSpot credentials (HUBSPOT_ACCESS_TOKEN)'
      );
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchPipeline(): Promise<HubSpotDeal[]> {
    const url = `${this.baseURL}/crm/v3/objects/deals?properties=dealname,amount,dealstage,closedate&limit=50&archived=false`;
    const res = await fetch(url, { headers: this.getHeaders() });

    if (!res.ok) {
      throw new Error(
        `HubSpot API error: ${res.status} ${res.statusText}`
      );
    }

    const data = (await res.json()) as { results: any[] };
    return (data.results || []).map((deal: any) => ({
      id: deal.id,
      name: deal.properties.dealname || 'Unnamed',
      amount: parseFloat(deal.properties.amount || '0'),
      stage: deal.properties.dealstage || 'Unknown',
      closeDate: deal.properties.closedate || 'N/A',
    }));
  }

  async searchContacts(query: string): Promise<HubSpotContact[]> {
    const url = `${this.baseURL}/crm/v3/objects/contacts/search`;
    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'firstname',
              operator: 'CONTAINS_TOKEN',
              value: query,
            },
          ],
        },
        {
          filters: [
            {
              propertyName: 'email',
              operator: 'CONTAINS_TOKEN',
              value: query,
            },
          ],
        },
      ],
      properties: [
        'firstname',
        'lastname',
        'email',
        'jobtitle',
        'company',
      ],
      limit: 10,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(
        `HubSpot API error: ${res.status} ${res.statusText}`
      );
    }

    const data = (await res.json()) as { results: any[] };
    return (data.results || []).map((c: any) => ({
      name:
        `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim() ||
        'Unknown',
      email: c.properties.email || '',
      title: c.properties.jobtitle || '',
      company: c.properties.company || '',
    }));
  }
}