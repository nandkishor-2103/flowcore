import { body } from "express-validator";

const userRegisterValidator = () => {
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

const userLoginValidator = () => {
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

export { userRegisterValidator, userLoginValidator };
