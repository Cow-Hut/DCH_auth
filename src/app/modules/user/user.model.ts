/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt, { hash } from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../../config';
import { role } from './user.constance';
import { IUser, UserModel } from './user.interface';

const UserSchema: Schema<IUser, UserModel> = new Schema<IUser>(
  {
    email: { type: String },
    phoneNumber: { type: String, required: true, unique: true },
    role: { type: String, enum: role, required: true },
    password: { type: String, required: true, select: 0 },
    name: {
      type: String,
      required: true,
    },
    address: { type: String, required: true },
    budget: { type: Number, required: true },
    income: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

UserSchema.statics.isUserExist = async function (
  phoneNumber: string
): Promise<Pick<IUser, 'email' | 'phoneNumber' | 'role' | 'password'> | null> {
  return await User.findOne(
    { phoneNumber },
    { _id: 1, email: 1, phoneNumber: 1, role: 1, password: 1 }
  );
};

UserSchema.statics.isPasswordMatch = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

UserSchema.pre('save', async function (next) {
  const user = this;
  //hash password
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bycrypt_salt_rounds)
  );
  console.log('password  and Hash 💡', this.password, hash);

  next();
});

export const User = model<IUser, UserModel>('User', UserSchema);
