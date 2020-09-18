import lodash from 'lodash';
import { check, ValidationChain } from 'express-validator';
import { AppContext } from '@typings';
import mobilePhoneSanitizer from './mobile-phone-sanitizer';

const createAccessTokenValidator = (
  appContext: AppContext,
): ValidationChain[] => [
  check('email')
    .optional()
    .isEmail()
    .withMessage('VALIDATION_ERRORS.INVALID_EMAIL')
    .custom(async (email) => {
      const account = await appContext.accountRepository.findOne({
        email,
      });
      if (lodash.isEmpty(account)) {
        return Promise.reject();
      }
    })
    .withMessage('DEFAULT_ERRORS.LOGIN_AUTHENTICATION_FAILED'),
  check('phone')
    .optional()
    .isMobilePhone('en-US')
    .withMessage('VALIDATION_ERRORS.INVALID_MOBILE_PHONE')
    .customSanitizer(mobilePhoneSanitizer)
    .custom(async (phone) => {
      const account = await appContext.accountRepository.findOne({
        phone,
      });
      if (lodash.isEmpty(account)) {
        return Promise.reject();
      }
    })
    .withMessage('DEFAULT_ERRORS.LOGIN_AUTHENTICATION_FAILED'),
  check('password', 'VALIDATION_ERRORS.PASSWORD_MISSING').notEmpty(),
];

export default createAccessTokenValidator;
