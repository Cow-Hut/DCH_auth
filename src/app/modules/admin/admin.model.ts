/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt, { hash } from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../../config';
import { AdminModel, IAdmin } from './admin.interface';

const AdminSchema = new Schema<IAdmin, AdminModel>(
  {
    email: { type: String },
    phoneNumber: { type: String, unique: true, required: true },
    role: { type: String, enum: ['admin'], required: true },
    password: { type: String, required: true, select: 0 },
    name: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

AdminSchema.statics.isUserExist = async function (
  phoneNumber: string
): Promise<Pick<IAdmin, 'email' | 'phoneNumber' | 'role' | 'password'> | null> {
  return await Admin.findOne(
    { phoneNumber },
    { phoneNumber: 1, role: 1, password: 1 }
  );
};

AdminSchema.statics.isPasswordMatch = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

AdminSchema.pre('save', async function (next) {
  const user = this;
  //hash password
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bycrypt_salt_rounds)
  );
  console.log('password  and Hash 💡', this.password, hash);

  next();
});

export const Admin = model<IAdmin, AdminModel>('Admin', AdminSchema);
