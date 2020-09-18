import { model, Schema } from 'mongoose';

const accountVerificationInfo = new Schema(
  {
    method: String,
    secret: String,
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

const accountSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: false },
    password: { type: String, required: false },
    phone: { type: String, required: false },
    verificationInfos: [accountVerificationInfo],
  },
  {
    collection: 'accounts',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);
const account = model('Account', accountSchema);
export default account;
