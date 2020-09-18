import config from 'config';
import mail from '@sendgrid/mail';
import { Mailer } from './mailer';
import { EmailPayload } from './email-payload';

export class SendGridMailProvider implements Mailer {
  constructor() {
    mail.setApiKey(config.get('sendgrid.apiKey'));
  }

  sendMail(payload: EmailPayload): Promise<any> {
    return mail.send({ ...payload, dynamicTemplateData: payload.data });
  }
}
