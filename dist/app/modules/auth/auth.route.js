"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_controller_1 = require("../user/user.controller");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = express_1.default.Router();
router.post('/signup', 
// validateRequest(UserValidation.createUserZodSchema),
user_controller_1.UserController.createUser);
router.post('/login', 
// validateRequest(AuthValidation.loginZodSchema),
auth_controller_1.AuthController.loginUser);
router.post('/refresh-token', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.refreshTokenZodSchema), auth_controller_1.AuthController.refreshToken);
exports.AuthRoutes = router;
