import { Meta } from 'express-validator';

import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const mobilePhoneSanitizer = (input: any, meta: Meta): any => {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumber = phoneUtil.parse(input, 'US');
  return phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
};

export default mobilePhoneSanitizer;
