import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    userRegisterValidator,
    userLoginValidator,
} from "../validators/user.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ================== Auth Routes ==================
/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.route("/register").post(userRegisterValidator(), validate, registerUser);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.route("/login").post(userLoginValidator(), validate, loginUser);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user and invalidate refresh token
 * @access Private
 */
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
