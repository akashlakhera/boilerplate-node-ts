import { BaseModel } from './base-model';
import { LooseObject } from '@typings';

export type AccountVerificationMethod = 'email' | 'phone';

export class AccountVerificationInfo extends BaseModel {
  createdAt: Date;
  method: AccountVerificationMethod;
  secret: string;
  verified: boolean;

  constructor(json?: any) {
    super(json);
    if (json) {
      this.createdAt = new Date(json.createdAt);
      this.method = json.method;
      this.secret = json.secret;
      this.verified = json.verified;
    }
  }

  public isVerificationByEmail(): boolean {
    return this.method === 'email';
  }

  public isVerificationByPhone(): boolean {
    return this.method === 'phone';
  }

  public serialize(): LooseObject {
    return {
      id: this._id,
      method: this.method,
      verified: this.verified,
    };
  }
}
