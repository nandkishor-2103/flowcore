import { Router } from "express";

// Controllers
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateMemberRole,
    removeMemberFromProject,
} from "../controllers/project.controller.js";

// Middlewares
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

// Validators
import {
    createProjectValidator,
    addMemberToProjectValidator,
} from "../validators/user.validator.js";

// Constants
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();

// ===================== GLOBAL MIDDLEWARE =====================
router.use(verifyJWT);

// ===================== PROJECT ROUTES =====================

/**
 * @route   /api/v1/projects
 */
router
    .route("/")
    .get(getProjects) // Get all projects
    .post(
        createProjectValidator(),
        validate,
        createProject
    ); // Create project

/**
 * @route   /api/v1/projects/:projectId
 */
router
    .route("/:projectId")
    .get(
        authorizeRoles(AvailableUserRoles),
        getProjectById
    )
    .put(
        authorizeRoles([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject
    )
    .delete(
        authorizeRoles([UserRolesEnum.ADMIN]),
        deleteProject
    );

// ===================== MEMBER ROUTES =====================

/**
 * @route   /api/v1/projects/:projectId/members
 */
router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(
        authorizeRoles([UserRolesEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        addMemberToProject
    );

/**
 * @route   /api/v1/projects/:projectId/members/:userId
 */
router
    .route("/:projectId/members/:userId")
    .put(
        authorizeRoles([UserRolesEnum.ADMIN]),
        updateMemberRole
    )
    .delete(
        authorizeRoles([UserRolesEnum.ADMIN]),
        removeMemberFromProject
    );

export default router;
