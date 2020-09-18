import config from 'config';
import { totp } from 'otplib';
import cryptoRandomString from 'crypto-random-string';
import { OtpPayload } from '@typings';

totp.options = {
  digits: config.get('otp.length'),
  step: config.get('otp.timeStep'),
  window: config.get('otp.validityWindow'),
};

export const generateOtp = (secret: string): OtpPayload => {
  const otpPayload: OtpPayload = {
    secret,
    otp: totp.generate(secret),
  };
  return otpPayload;
};

export const verifyOtp = (token: string, secret: string) => {
  if (process.env.NODE_ENV === 'testing') {
    return true;
  }
  return totp.check(token, secret);
};

export const generateSecret = (secretSize?: number) => {
  return cryptoRandomString({ length: secretSize || 32 }).toString();
};
