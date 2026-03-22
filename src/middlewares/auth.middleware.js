import { User } from "../models/user.model.js";
import { ProjectMember } from "../models/projectmember.model.js";

import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// =================== JWT Authentication Middleware ===================
// Middleware to verify JWT and authenticate user
export const verifyJWT = asyncHandler(async function (req, res, next) {
    const authHeader = req.header("Authorization");
    const token =
        req.cookies?.accessToken || authHeader?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
        );
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});

// =================== Role-Based Authorization Middleware ===================
// Middleware to check if user has required role(s)
export const authorizeRoles = function (roles = []) {
    return asyncHandler(async function (req, res, next) {
        const { projectId } = req.params;

        if (!projectId) {
            throw new ApiError(400, "Project ID is required");
        }

        const projectObjectId = new mongoose.Types.ObjectId(projectId);

        const project = await ProjectMember.findOne({
            user: new mongoose.Types.ObjectId(req.user._id),
            $or: [{ project: projectObjectId }, { projects: projectObjectId }],
        });

        if (!project) {
            throw new ApiError(403, "Project not found");
        }

        const userRole = project?.role;

        req.user.role = userRole;

        if (!roles.includes(userRole)) {
            throw new ApiError(
                403,
                "You do not have permission to perform this action",
            );
        }

        next();
    });
};
