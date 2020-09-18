import config from 'config';
import twilio, { Twilio } from 'twilio';

import { Messenger } from './messenger';
import { SmsPayload } from './sms-payload';

export class TwilioMessenger implements Messenger {
  private client: Twilio;

  constructor() {
    const accId: string = config.get('twilio.accountId');
    const authToken: string = config.get('twilio.authToken');
    this.client = twilio(accId, authToken);
  }
  public sendSMS(payload: SmsPayload): Promise<any> {
    return this.client.messages.create(payload);
  }
}
