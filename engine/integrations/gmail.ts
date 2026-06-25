/**
 * Segundo Gmail Connector
 * Creates draft emails via the Gmail API using OAuth2.
 * Credentials read from environment variables.
 *
 * Requires: googleapis as an optional dependency.
 * Install: npm install googleapis
 */

export class GmailClient {
  private oauth2Client: any;
  private initialized = false;

  async init(): Promise<void> {
    let google: any;
    try {
      const googleapis = await import('googleapis');
      google = googleapis.google;
    } catch {
      console.warn(
        '[Gmail] googleapis not installed. Run: npm install googleapis'
      );
      return;
    }

    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const redirectUri =
      process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

    if (!clientId || !clientSecret) {
      console.warn(
        '[Gmail] Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET.'
      );
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    if (refreshToken) {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      this.initialized = true;
    }
  }

  async authenticate(): Promise<void> {
    if (!this.initialized) await this.init();
    if (!this.oauth2Client?.credentials?.refresh_token) {
      throw new Error(
        'No GMAIL_REFRESH_TOKEN found. Run OAuth flow first.'
      );
    }
    await this.oauth2Client.getAccessToken();
    console.log('[Gmail] Authenticated.');
  }

  async createDraft(
    to: string,
    subject: string,
    body: string
  ): Promise<string> {
    if (!this.initialized) await this.init();

    let google: any;
    try {
      const googleapis = await import('googleapis');
      google = googleapis.google;
    } catch {
      throw new Error('googleapis not installed');
    }

    const gmail = google.gmail({
      version: 'v1',
      auth: this.oauth2Client,
    });

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: { message: { raw: encodedMessage } },
    });

    return res.data.id || '';
  }
}