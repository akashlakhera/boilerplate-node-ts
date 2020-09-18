import { EmailPayload } from './email-payload';

export interface Mailer {
  sendMail: (payload: EmailPayload) => Promise<any>;
}
