import { BaseModel } from './base-model';
import { AccountVerificationInfo } from './account-verification-info';
import { LooseObject } from '@typings';
import { AccountVerificationMethod } from '.';

export class Account extends BaseModel {
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
  phone?: string;
  verificationInfos: AccountVerificationInfo[];

  constructor(json?: any) {
    super(json);
    if (json) {
      this.firstName = json.firstName;
      this.lastName = json.lastName;
      this.email = json.email;
      this.password = json.password;
      this.phone = json.phone;
      if (json.verificationInfos) {
        this.verificationInfos = json.verificationInfos.map(
          (info: LooseObject) => new AccountVerificationInfo(info),
        );
      }
    }
  }

  public emailVerificationInfo(): AccountVerificationInfo | undefined {
    return this.verificationInfos
      ? this.verificationInfos.find(info => info.isVerificationByEmail())
      : undefined;
  }

  public phoneVerificationInfo(): AccountVerificationInfo | undefined {
    return this.verificationInfos
      ? this.verificationInfos.find(info => info.isVerificationByPhone())
      : undefined;
  }

  public verificationInfoByMethod(
    method: AccountVerificationMethod,
  ): AccountVerificationInfo | undefined {
    return this.verificationInfos
      ? this.verificationInfos.find(info => info.method === method)
      : undefined;
  }

  public serialize(): LooseObject {
    return {
      id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      verificationInfos: this.verificationInfos
        ? this.verificationInfos.map(info => info.serialize())
        : undefined,
    };
  }
}
