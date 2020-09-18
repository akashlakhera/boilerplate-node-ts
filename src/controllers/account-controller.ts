import { Response, Router, NextFunction } from 'express';

import { BaseController } from './base-controller';

import { AuthHelper, Validation } from '@helpers';
import { Model } from '@storage';
import {
  AppContext,
  Errors,
  ExtendedRequest,
  ValidationFailure,
} from '@typings';
import {
  createAccessTokenValidator,
  createAccountValidator,
} from '@validators';
import lodash from 'lodash';

export class AccountController extends BaseController {
  public basePath: string = '/account';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.basePath}`,
      createAccountValidator(this.appContext),
      this.createAccount,
    );
    this.router.post(
      `${this.basePath}/:account_id/email_verification/:verification_id/verify`,
      this.verifyEmailVerificationToken,
    );
    this.router.post(
      `${this.basePath}/:account_id/phone_verification/:verification_id/verify`,
      this.verifyPhoneVerificationToken,
    );
    this.router.post(
      `${this.basePath}/access_token`,
      createAccessTokenValidator(this.appContext),
      this.createAccessToken,
    );
  }

  private createAccount = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // TODO jjalan: Find a way to do this not in each action
    const failures: ValidationFailure[] = Validation.extractValidationErrors(
      req,
    );
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures,
      );
      return next(valError);
    }

    const { email, firstName, lastName, password, phone } = req.body;
    const hashedPassword = await AuthHelper.encryptPassword(password);
    const account = await this.appContext.accountRepository.save(
      new Model.Account({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      }),
    );
    res.status(201).json(account.serialize());
  }

  private createAccessToken = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // TODO jjalan: Find a way to do this not in each action
    const failures: ValidationFailure[] = Validation.extractValidationErrors(
      req,
    );
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures,
      );
      return next(valError);
    }

    const { email, password, phone } = req.body;
    let account;
    if (!lodash.isEmpty(email)) {
      account = await this.appContext.accountRepository.findOne({ email });
    } else if (!lodash.isEmpty(phone)) {
      account = await this.appContext.accountRepository.findOne({ phone });
    }

    const accountPassword = account ? account.password : undefined;
    const isPasswordValid = await AuthHelper.comparePassword(
      password,
      accountPassword,
    );
    if (!isPasswordValid) {
      return next(
        new Errors.AuthenticationError(
          res.__('DEFAULT_ERRORS.LOGIN_AUTHENTICATION_FAILED'),
        ),
      );
    }
    const token = AuthHelper.createAccessToken({ accountId: account._id });
    res.json({ token, id: account._id });
  }

  private verifyEmailVerificationToken = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    return this.verifyVerificationToken(
      req,
      res,
      next,
      'email',
      new Errors.EmailVerificationError(
        res.__('DEFAULT_ERRORS.EMAIL_VERIFICATION_FAILED'),
      ),
    );
  }

  private verifyPhoneVerificationToken = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    return this.verifyVerificationToken(
      req,
      res,
      next,
      'phone',
      new Errors.PhoneVerificationError(
        res.__('DEFAULT_ERRORS.PHONE_VERIFICATION_FAILED'),
      ),
    );
  }

  private verifyVerificationToken = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
    verificationMethod: Model.AccountVerificationMethod,
    verificationError: Errors.AppError,
  ) => {
    const verified = await this.appContext.accountRepository.verifyVerificationToken(
      req.params.account_id,
      req.params.verification_id,
      req.body.token,
      verificationMethod,
    );

    if (!verified) {
      return next(verificationError);
    }

    const token = AuthHelper.createAccessToken({ accountId: req.params.account_id });
    res.json({ token, id: req.params.account_id });
  }
}
