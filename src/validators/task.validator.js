import { body, param } from "express-validator";
import { AvailableTaskStatuses } from "../utils/constants.js";

const projectIdParamValidator = function () {
    return [
        param("projectId")
            .notEmpty()
            .withMessage("Project ID is required")
            .isMongoId()
            .withMessage("Project ID must be a valid MongoDB ID"),
    ];
};

const taskIdParamValidator = function () {
    return [
        param("taskId")
            .notEmpty()
            .withMessage("Task ID is required")
            .isMongoId()
            .withMessage("Task ID must be a valid MongoDB ID"),
    ];
};

const subtaskIdParamValidator = function () {
    return [
        param("subtaskId")
            .notEmpty()
            .withMessage("Subtask ID is required")
            .isMongoId()
            .withMessage("Subtask ID must be a valid MongoDB ID"),
    ];
};

const createTaskValidator = function () {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Task title is required")
            .isLength({ min: 3, max: 120 })
            .withMessage("Task title must be between 3 and 120 characters"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("Task description is required")
            .isLength({ min: 3, max: 1000 })
            .withMessage(
                "Task description must be between 3 and 1000 characters",
            ),

        body("status")
            .notEmpty()
            .withMessage("Task status is required")
            .isIn(AvailableTaskStatuses)
            .withMessage(
                "Task status must be one of: " +
                    AvailableTaskStatuses.join(", "),
            ),

        body("assignedTo")
            .optional()
            .isMongoId()
            .withMessage("assignedTo must be a valid MongoDB ID"),
    ];
};

const updateTaskValidator = function () {
    return [
        body("title")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Task title cannot be empty")
            .isLength({ min: 3, max: 120 })
            .withMessage("Task title must be between 3 and 120 characters"),

        body("description")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Task description cannot be empty")
            .isLength({ min: 3, max: 1000 })
            .withMessage(
                "Task description must be between 3 and 1000 characters",
            ),

        body("status")
            .optional()
            .isIn(AvailableTaskStatuses)
            .withMessage(
                "Task status must be one of: " +
                    AvailableTaskStatuses.join(", "),
            ),

        body("assignedTo")
            .optional()
            .isMongoId()
            .withMessage("assignedTo must be a valid MongoDB ID"),
    ];
};

const createSubtaskValidator = function () {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Subtask title is required")
            .isLength({ min: 2, max: 120 })
            .withMessage("Subtask title must be between 2 and 120 characters"),

        body("isCompleted")
            .optional()
            .isBoolean()
            .withMessage("isCompleted must be boolean")
            .toBoolean(),
    ];
};

const updateSubtaskValidator = function () {
    return [
        body("title")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Subtask title cannot be empty")
            .isLength({ min: 2, max: 120 })
            .withMessage("Subtask title must be between 2 and 120 characters"),

        body("isCompleted")
            .optional()
            .isBoolean()
            .withMessage("isCompleted must be boolean")
            .toBoolean(),
    ];
};

export {
    projectIdParamValidator,
    taskIdParamValidator,
    subtaskIdParamValidator,
    createTaskValidator,
    updateTaskValidator,
    createSubtaskValidator,
    updateSubtaskValidator,
};
