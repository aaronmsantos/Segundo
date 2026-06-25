/**
 * Segundo Salesforce Connector
 * Fetches active pipeline from Salesforce via jsforce.
 * Credentials read from environment variables.
 */
import { Connection } from 'jsforce';

export interface PipelineDeal {
  account: string;
  stage: string;
  amount: number;
  closeDate: string;
  lastActivityDate: string;
  owner: string;
  nextStep: string;
  daysSinceActivity: number;
  contactEmail?: string;
}

export class SalesforceClient {
  private conn: Connection;

  constructor() {
    this.conn = new Connection({
      loginUrl:
        process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    });
  }

  async authenticate(): Promise<void> {
    const username = process.env.SF_USERNAME;
    const password = process.env.SF_PASSWORD;
    const token = process.env.SF_TOKEN;

    if (!username || !password || !token) {
      throw new Error(
        'Missing Salesforce credentials (SF_USERNAME, SF_PASSWORD, SF_TOKEN)'
      );
    }

    await this.conn.login(username, password + token);
    console.log('[Salesforce] Authenticated.');
  }

  async fetchActivePipeline(): Promise<PipelineDeal[]> {
    const soql = `
      SELECT Name, StageName, Amount, CloseDate, LastActivityDate,
             NextStep, Next_Steps__c, Owner.Name,
             (SELECT Contact.Email, Contact.Title, Role
              FROM OpportunityContactRoles)
      FROM Opportunity
      WHERE IsClosed = false
        AND Owner.Username = '${process.env.SF_USERNAME}'
    `;

    const result = await this.conn.query(soql);

    return result.records.map((record: any) => {
      let daysSinceActivity = 999;
      if (record.LastActivityDate) {
        const last = new Date(record.LastActivityDate);
        const now = new Date();
        if (!isNaN(last.getTime())) {
          daysSinceActivity = Math.floor(
            (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      }

      let contactEmail: string | undefined;
      if (
        record.OpportunityContactRoles?.records?.length > 0
      ) {
        const primary = record.OpportunityContactRoles.records.find(
          (r: any) => r.IsPrimary
        );
        contactEmail = primary
          ? primary.Contact?.Email
          : record.OpportunityContactRoles.records[0].Contact?.Email;
      }

      return {
        account: record.Name,
        stage: record.StageName,
        amount: record.Amount || 0,
        closeDate: record.CloseDate || 'Unknown',
        lastActivityDate: record.LastActivityDate || 'Unknown',
        owner: record.Owner?.Name || 'Unknown',
        nextStep: record.Next_Steps__c || record.NextStep || '',
        daysSinceActivity,
        contactEmail,
      };
    });
  }
}