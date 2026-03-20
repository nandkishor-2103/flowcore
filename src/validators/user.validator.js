import { body } from "express-validator";

const userRegisterValidator = function () {
    return [
        // Email
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
            .normalizeEmail(),

        // Username
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3, max: 20 })
            .withMessage("Username must be between 3 and 20 characters")
            .matches(/^[a-z0-9_]+$/)
            .withMessage(
                "Username can only contain lowercase letters, numbers and underscore",
            ),

        // Password (STRONG)
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6, max: 50 })
            .withMessage("Password must be between 6 and 50 characters")
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/)
            .withMessage(
                "Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character",
            )
            .not()
            .isIn(["Password@123", "123456", "qwerty"])
            .withMessage("Password is too common"),

        // Full Name (optional)
        body("fullName")
            .optional()
            .trim()
            .isLength({ min: 2 })
            .withMessage("Full name must be at least 2 characters")
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage("Full name can only contain letters"),
    ];
};

const userLoginValidator = function () {
    return [
        // Email
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
            .normalizeEmail(),

        // Password
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6, max: 50 })
            .withMessage("Password must be between 6 and 50 characters"),
    ];
};

const userChangeCurrentPasswordValidator = function () {
    return [
        // Current Password
        body("currentPassword")
            .notEmpty()
            .withMessage("Current password is required")
            .isLength({ min: 6, max: 50 })
            .withMessage(
                "Current password must be between 6 and 50 characters",
            ),

        // New Password
        body("newPassword")
            .notEmpty()
            .withMessage("New password is required")
            .isLength({ min: 6, max: 50 })
            .withMessage("New password must be between 6 and 50 characters")
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/)
            .withMessage(
                "New password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character",
            )
            .not()
            .isIn(["Password@123", "123456", "qwerty"])
            .withMessage("New password is too common"),

        // Confirm Password
        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm password is required")
            .isLength({ min: 6, max: 50 })
            .withMessage(
                "Confirm password must be between 6 and 50 characters",
            ),
    ];
};

const userForgotPasswordValidator = function () {
    return [
        // Email
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
            .normalizeEmail(),
    ];
};

const userResetForgotPasswordValidator = function () {
    return [
        // New Password
        body("newPassword")
            .notEmpty()
            .withMessage("New password is required")
            .isLength({ min: 6, max: 50 })
            .withMessage("New password must be between 6 and 50 characters")
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/)
            .withMessage(
                "New password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character",
            )
            .not()
            .isIn(["Password@123", "123456", "qwerty"])
            .withMessage("New password is too common"),

        // Confirm Password ✅
        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm password is required")
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Passwords do not match");
                }
                return true;
            }),
    ];
};

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
};
