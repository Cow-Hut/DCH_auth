import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { IAdmin } from '../admin/admin.interface';
import { Admin } from '../admin/admin.model';
import { IUser } from './user.interface';
import { User } from './user.model';

// Define a function to create a user
const createUser = async (user: IUser): Promise<IUser | null> => {
  let newUserAllData = null;

  // Start a Mongoose session
  const session = await mongoose.startSession();

  try {
    // Begin a transaction within the session
    session.startTransaction();

    // Depending on the user's role, set default values for budget and income
    if (user.role === 'seller') {
      if (!user.budget || user.budget === 0) {
        user.budget = 0;
        user.income = 0;
      }
    } else {
      if (!user.income || user.income === 0) {
        user.income = 0;
      }
    }

    // Check if the user's role is 'buyer' and if their budget is zero, throw an error
    if (user.role === 'buyer' && user.budget === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Buyer must have a minimum range budget'
      );
    }

    // Create a new user document in the database using the provided user data
    const newUser = await User.create([user], { session });

    // Check if user creation was successful
    if (!newUser.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create User');
    }

    // Retrieve the created user's data
    newUserAllData = newUser[0];

    // Commit the transaction
    await session.commitTransaction();

    // End the session
    await session.endSession();
  } catch (error) {
    // If an error occurs, abort the transaction and end the session
    await session.abortTransaction();
    await session.endSession();

    // Rethrow the error for higher-level error handling
    throw error;
  }
  // Return the user data of the created user
  return newUserAllData;
};

// get a single user
const getSingleUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findById(id);
  return result;
};

// updated User
const updatedUser = async (
  id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  const isExist = await User.findById(id);

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
  }

  const { name, ...UserData } = payload;

  const updatedUserData: Partial<IUser> = { ...UserData };

  //dynamic handling
  if (name && Object.keys(name).length > 0) {
    Object.keys(name).forEach(key => {
      const nameKey = `name.${key}` as keyof Partial<IUser>;
      (updatedUserData as any)[nameKey] = name[key as keyof typeof name];
    });
  }

  const result = await User.findByIdAndUpdate({ _id: id }, updatedUserData, {
    new: true,
  });

  return result;
};

// Delete User
const deleteUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findByIdAndDelete({ _id: id }, { new: true });
  return result;
};

// Get Profile Data
const getMyProfile = async (
  token: JwtPayload
): Promise<IUser | IAdmin | null> => {
  const { phone, role } = token;
  console.log('PHONE 📞', phone);

  const result =
    role !== 'admin'
      ? await User.findOne({ phoneNumber: phone })
      : await Admin.findOne({ phoneNumber: phone });

  return result;
};

// update profile Data
const updateMyProfile = async (
  payload: Partial<IUser | IAdmin>,
  token: JwtPayload
): Promise<IUser | IAdmin | null> => {
  console.log(payload);

  const { phone, role } = token;
  console.log('PHONE 📞', phone);

  const userDetails =
    role !== 'admin'
      ? await User.findOne({ phoneNumber: phone })
      : await Admin.findOne({ phoneNumber: phone });

  console.log('userDetails', userDetails);

  if (!userDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is invalid');
  }

  if (userDetails?.phoneNumber !== phone || userDetails?.role !== role) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'You are UnAuthorized to update this profile'
    );
  }

  const result =
    role !== 'admin'
      ? await User.findOneAndUpdate({ phoneNumber: phone }, payload, {
          new: true,
        })
      : await Admin.findOneAndUpdate({ phoneNumber: phone }, payload, {
          new: true,
        });

  console.log(result, 'updated result');

  return result;
};

export const UserService = {
  createUser,
  updatedUser,
  getSingleUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
};
