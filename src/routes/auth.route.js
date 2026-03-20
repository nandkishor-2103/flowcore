import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgottenPassword,
    changeCurrentPassword,
} from "../controllers/auth.controller.js";

import { validate } from "../middlewares/validator.middleware.js";
import {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
} from "../validators/user.validator.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * ============================================================
 * 🔓 PUBLIC ROUTES (No Authentication Required)
 * ------------------------------------------------------------
 * Accessible without JWT token.
 * Used for authentication, account setup, and recovery flows.
 * ============================================================
 */

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.route("/register").post(userRegisterValidator(), validate, registerUser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 */
router.route("/login").post(userLoginValidator(), validate, loginUser);

/**
 * @route   GET /api/v1/auth/verify-email/:verificationToken
 * @desc    Verify user email using verification token
 * @access  Public
 */
router.route("/verify-email/:verificationToken").get(verifyEmail);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Generate new access token using refresh token
 * @access  Public (requires valid refresh token)
 */
router.route("/refresh-token").post(refreshAccessToken);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset link to user's email
 * @access  Public
 */
router
    .route("/forgot-password")
    .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

/**
 * @route   POST /api/v1/auth/reset-password/:resetToken
 * @desc    Reset user password using reset token
 * @access  Public (requires valid reset token)
 */
router
    .route("/reset-password/:resetToken")
    .post(userResetForgotPasswordValidator(), validate, resetForgottenPassword);

/**
 * ============================================================
 * 🔒 PRIVATE ROUTES (Authentication Required)
 * ------------------------------------------------------------
 * Requires valid JWT token.
 * Used for user-specific and protected operations.
 * ============================================================
 */

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and clear session tokens
 * @access  Private
 */
router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @route   GET /api/v1/auth/current-user
 * @desc    Fetch current authenticated user details
 * @access  Private
 */
router.route("/current-user").get(verifyJWT, getCurrentUser);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
router
    .route("/change-password")
    .post(
        verifyJWT,
        userChangeCurrentPasswordValidator(),
        validate,
        changeCurrentPassword,
    );

/**
 * @route   POST /api/v1/auth/resend-email-verification
 * @desc    Resend email verification link
 * @access  Private
 */
router
    .route("/resend-email-verification")
    .post(verifyJWT, resendEmailVerification);

export default router;
