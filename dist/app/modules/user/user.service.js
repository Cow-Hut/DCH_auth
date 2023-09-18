"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const admin_model_1 = require("../admin/admin.model");
const user_model_1 = require("./user.model");
// Define a function to create a user
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let newUserAllData = null;
    // Start a Mongoose session
    const session = yield mongoose_1.default.startSession();
    try {
        // Begin a transaction within the session
        session.startTransaction();
        // Depending on the user's role, set default values for budget and income
        if (user.role === 'seller') {
            if (!user.budget || user.budget === 0) {
                user.budget = 0;
                user.income = 0;
            }
        }
        else {
            if (!user.income || user.income === 0) {
                user.income = 0;
            }
        }
        // Check if the user's role is 'buyer' and if their budget is zero, throw an error
        if (user.role === 'buyer' && user.budget === 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Buyer must have a minimum range budget');
        }
        // Create a new user document in the database using the provided user data
        const newUser = yield user_model_1.User.create([user], { session });
        // Check if user creation was successful
        if (!newUser.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create User');
        }
        // Retrieve the created user's data
        newUserAllData = newUser[0];
        // Commit the transaction
        yield session.commitTransaction();
        // End the session
        yield session.endSession();
    }
    catch (error) {
        // If an error occurs, abort the transaction and end the session
        yield session.abortTransaction();
        yield session.endSession();
        // Rethrow the error for higher-level error handling
        throw error;
    }
    // Return the user data of the created user
    return newUserAllData;
});
// get a single user
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findById(id);
    return result;
});
// updated User
const updatedUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found !');
    }
    const { name } = payload, UserData = __rest(payload, ["name"]);
    const updatedUserData = Object.assign({}, UserData);
    //dynamic handling
    if (name && Object.keys(name).length > 0) {
        Object.keys(name).forEach(key => {
            const nameKey = `name.${key}`;
            updatedUserData[nameKey] = name[key];
        });
    }
    const result = yield user_model_1.User.findByIdAndUpdate({ _id: id }, updatedUserData, {
        new: true,
    });
    return result;
});
// Delete User
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findByIdAndDelete({ _id: id }, { new: true });
    return result;
});
// Get Profile Data
const getMyProfile = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, role } = token;
    console.log('PHONE 📞', phone);
    const result = role !== 'admin'
        ? yield user_model_1.User.findOne({ phoneNumber: phone })
        : yield admin_model_1.Admin.findOne({ phoneNumber: phone });
    return result;
});
// update profile Data
const updateMyProfile = (payload, token) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const { phone, role } = token;
    console.log('PHONE 📞', phone);
    const userDetails = role !== 'admin'
        ? yield user_model_1.User.findOne({ phoneNumber: phone })
        : yield admin_model_1.Admin.findOne({ phoneNumber: phone });
    console.log('userDetails', userDetails);
    if (!userDetails) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'This cow is invalid');
    }
    if ((userDetails === null || userDetails === void 0 ? void 0 : userDetails.phoneNumber) !== phone || (userDetails === null || userDetails === void 0 ? void 0 : userDetails.role) !== role) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'You are UnAuthorized to update this profile');
    }
    const result = role !== 'admin'
        ? yield user_model_1.User.findOneAndUpdate({ phoneNumber: phone }, payload, {
            new: true,
        })
        : yield admin_model_1.Admin.findOneAndUpdate({ phoneNumber: phone }, payload, {
            new: true,
        });
    console.log(result, 'updated result');
    return result;
});
exports.UserService = {
    createUser,
    updatedUser,
    getSingleUser,
    deleteUser,
    getMyProfile,
    updateMyProfile,
};
