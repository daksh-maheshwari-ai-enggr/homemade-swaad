declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mail: MailOptions): Promise<SendMailResult>;
    /** Checks the SMTP connection (used as a boot-time health check). */
    verify(): Promise<boolean>;
    /** Closes all pooled connections. */
    close(): void;
  }

  export interface MailOptions {
    from?: string;
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Attachment[];
  }

  export interface Attachment {
    filename?: string;
    content?: string | Buffer;
    path?: string;
    href?: string;
  }

  export interface SendMailResult {
    messageId: string;
    envelope?: { to: string[]; from: string };
    accepted?: string[];
    rejected?: string[];
    timestamp?: number;
    response?: string;
  }

  export function createTransport(config: any): Transporter;
}