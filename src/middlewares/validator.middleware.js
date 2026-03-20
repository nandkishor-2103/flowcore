import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export function validate(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) return next();

    const extractedErrors = errors.array().map((err) => ({
        field: err.path,
        value: err.value,
        message: err.msg,          
    }));

    throw new ApiError(
        422,
        "Validation failed",
        extractedErrors
    );
}
