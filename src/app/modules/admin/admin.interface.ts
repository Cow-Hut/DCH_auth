/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IRole = 'admin';

export type IAdmin = {
  email?: string;
  phoneNumber: string;
  role: IRole;
  password: string;
  name: {
    firstName: string;
    lastName: string;
  };
  address: string;
};

// welcome back

export type AdminModel = {
  isUserExist(
    phoneNumber: string
  ): Promise<Pick<IUser, 'email' | 'phoneNumber' | 'role' | 'password'>>;
  isPasswordMatch(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
} & Model<IAdmin>;
