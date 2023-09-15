/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type IRole = 'seller' | 'buyer';

export type IUser = {
  email: string;
  phoneNumber: string;
  role: IRole;
  password: string;
  name: {
    firstName: string;
    lastName: string;
  };
  address: string;
  budget: number;
  income: number;
};

export type UserModel = {
  isUserExist(
    phoneNumber: string
  ): Promise<Pick<IUser, 'email' | 'phoneNumber' | 'role' | 'password'>>;
  isPasswordMatch(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
} & Model<IUser>;

export type IUserFilters = {
  searchTerm?: string;
  role?: string;
  phoneNumber?: string;
  email?: string;
  budget?: number;
  income?: number;
};
