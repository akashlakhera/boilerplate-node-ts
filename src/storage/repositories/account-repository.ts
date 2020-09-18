import config from 'config';
import lodash from 'lodash';

import { BaseRepository } from './base-repository';
import { RepositoryContext } from './repository-context';
import { OtpHelper } from '@helpers';
import { Model } from '@storage';

export class AccountRepository extends BaseRepository<Model.Account> {
  constructor(context: RepositoryContext) {
    super(context);
  }

  public async createAccountVerificationToken(account: Model.Account) {
    if (account.email) {
      return this.createEmailVerification(account);
    }  if (account.phone) {
      return this.createPhoneVerification(account);
    }
  }

  public async createEmailVerification(
    account: Model.Account,
  ): Promise<Model.AccountVerificationInfo> {
    const secret = OtpHelper.generateSecret();
    const token = OtpHelper.generateOtp(secret).otp;
    const updatedAccount = await super.update(
      { _id: account._id },
      {
        $push:
        {
          verificationInfos:
          {
            secret,
            method: 'email',
          },
        },
      },
    );
    const emailVerificationInfo = updatedAccount.emailVerificationInfo();
    const accountConfirmationLink = `${config.get(
      'webApp.baseUrl',
    )}/#/register/email-verification?account_id=${encodeURIComponent(
      updatedAccount._id,
    )}&verification_id=${encodeURIComponent(
      emailVerificationInfo._id,
    )}&token=${encodeURIComponent(token)}`;
    try {
      await this.context.mailer.sendMail({
        from: config.get('email.accounts.fromEmail'),
        to: account.email,
        data: {
          accountConfirmationLink,
          firstName: account.firstName,
        },
        templateId: 'd-7ff76537d3b8463f8a57f1a27e0a6d0c',
      });
    } catch (e) {
      this.context.logger.error(
        `Unable to send account activation email. Error: ${JSON.stringify(e)}`,
      );
    }
    return emailVerificationInfo;
  }

  public async createPhoneVerification(
    account: Model.Account,
  ): Promise<Model.AccountVerificationInfo> {
    const secret = OtpHelper.generateSecret();
    const token = OtpHelper.generateOtp(secret).otp;
    const updatedAccount = await super.update(
      { _id: account._id },
      {
        $push:
        {
          verificationInfos:
          {
            secret,
            method: 'phone',
          },
        },
      },
    );
    const phoneVerificationInfo = updatedAccount.phoneVerificationInfo();
    try {
      const body = lodash.clone(
        this.context.translate('PHONE_VERIFICATION_MESSAGE'),
      ).replace('#{otp}', token).replace('#{firstName}', account.firstName);
      await this.context.messenger.sendSMS({
        body,
        from: config.get('email.accounts.fromPhone'),
        to: account.phone,
      });
    } catch (e) {
      this.context.logger.error(
        `Unable to send account activation SMS. Error: ${JSON.stringify(e)}`,
      );
    }
    return phoneVerificationInfo;
  }

  public save(entity: Model.Account): Promise<Model.Account> {
    return new Promise(async (resolve, reject) => {
      try {
        let account = await super.save(entity);
        await this.createAccountVerificationToken(account);
        // refresh as verification token would insert verification object
        account = await this.findOne({ _id: account._id });
        resolve(account);
      } catch (e) {
        reject(e);
      }
    });
  }

  public async verifyVerificationToken(
    accountId: string,
    verificationId: string,
    verificationToken: string,
    verificationMethod: Model.AccountVerificationMethod,
  ): Promise<boolean> {
    const accountObjectId = this.toObjectId(accountId);
    const account = await this.findOne({
      _id: accountObjectId,
    });
    if (lodash.isEmpty(account)) {
      return false;
    }
    const verificationInfo = account.verificationInfos.find(
      info => (
        info._id.toString() === verificationId &&
        info.method === verificationMethod &&
        !info.verified
      ),
    );
    if (!verificationInfo ||
      !OtpHelper.verifyOtp(verificationToken, verificationInfo.secret)) {
      return false;
    }

    const verificationObjectId = this.toObjectId(verificationId);
    await this.update(
      {
        _id: accountObjectId,
        'verificationInfos._id': verificationObjectId,
      },
      {
        $set:
        {
          'verificationInfos.$.verified': true,
        },
      });
    return true;
  }

  protected modelFactory(): Model.ModelFactory<Model.Account> {
    return {
      getType() {
        return typeof Model.Account;
      },
      create(json: any) {
        return new Model.Account(json);
      },
    };
  }
}
