import { Messenger } from '@services';

export class MockMessenger implements Messenger.Messenger {
  public sendSMS(payload: Messenger.SmsPayload): Promise<any> {
    return Promise.resolve('sms sent');
  }
}
