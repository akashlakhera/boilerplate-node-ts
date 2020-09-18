import { SmsPayload } from './sms-payload';

export interface Messenger {
  sendSMS: (payload: SmsPayload) => Promise<any>;
}
