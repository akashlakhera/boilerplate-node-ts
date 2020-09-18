import { LooseObject } from '@typings';

export type EmailPayload = {
  from: string;
  to: string;
  subject?: string;
  data: LooseObject;
  templateId: string;
};
