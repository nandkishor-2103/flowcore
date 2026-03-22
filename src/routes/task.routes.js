import { Router } from "express";

// Controllers
import {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
} from "../controllers/task.controller.js";

// Middlewares
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

// Validators
import {
    projectIdParamValidator,
    taskIdParamValidator,
    subtaskIdParamValidator,
    createTaskValidator,
    updateTaskValidator,
    createSubtaskValidator,
    updateSubtaskValidator,
} from "../validators/task.validator.js";

// Constants
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();

// ===================== GLOBAL MIDDLEWARE =====================
router.use(verifyJWT);

// ===================== TASK ROUTES =====================

/**
 * @route   /api/v1/tasks/:projectId
 */
router
    .route("/:projectId")
    .get(
        projectIdParamValidator(),
        validate,
        authorizeRoles(AvailableUserRoles),
        getTasks,
    )
    .post(
        projectIdParamValidator(),
        createTaskValidator(),
        validate,
        authorizeRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        upload.array("attachments", 10),
        createTask,
    );

/**
 * @route   /api/v1/tasks/:projectId/t/:taskId
 */
router
    .route("/:projectId/t/:taskId")
    .get(
        projectIdParamValidator(),
        taskIdParamValidator(),
        validate,
        authorizeRoles(AvailableUserRoles),
        getTaskById,
    )
    .put(
        projectIdParamValidator(),
        taskIdParamValidator(),
        updateTaskValidator(),
        validate,
        authorizeRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        upload.array("attachments", 10),
        updateTask,
    )
    .delete(
        projectIdParamValidator(),
        taskIdParamValidator(),
        validate,
        authorizeRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteTask,
    );

// ===================== SUBTASK ROUTES =====================

/**
 * @route   /api/v1/tasks/:projectId/t/:taskId/subtasks
 */
router
    .route("/:projectId/t/:taskId/subtasks")
    .post(
        projectIdParamValidator(),
        taskIdParamValidator(),
        createSubtaskValidator(),
        validate,
        authorizeRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        createSubtask,
    );

/**
 * @route   /api/v1/tasks/:projectId/st/:subtaskId
 */
router
    .route("/:projectId/st/:subtaskId")
    .put(
        projectIdParamValidator(),
        subtaskIdParamValidator(),
        updateSubtaskValidator(),
        validate,
        authorizeRoles(AvailableUserRoles),
        updateSubtask,
    )
    .delete(
        projectIdParamValidator(),
        subtaskIdParamValidator(),
        validate,
        authorizeRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteSubtask,
    );

export default router;
