import { Mail } from '@services';

export class MockMailer implements Mail.Mailer {
  sendMail(payload: Mail.EmailPayload): Promise<any> {
    return Promise.resolve('email sent');
  }
}
