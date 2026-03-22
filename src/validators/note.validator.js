import { body, param } from "express-validator";

const projectIdParamValidator = function () {
    return [
        param("projectId")
            .notEmpty()
            .withMessage("Project ID is required")
            .isMongoId()
            .withMessage("Project ID must be a valid MongoDB ID"),
    ];
};

const noteIdParamValidator = function () {
    return [
        param("noteId")
            .notEmpty()
            .withMessage("Note ID is required")
            .isMongoId()
            .withMessage("Note ID must be a valid MongoDB ID"),
    ];
};

const createNoteValidator = function () {
    return [
        body("content")
            .trim()
            .notEmpty()
            .withMessage("Note content is required")
            .isLength({ min: 3, max: 5000 })
            .withMessage("Note content must be between 3 and 5000 characters"),
    ];
};

const updateNoteValidator = function () {
    return [
        body("content")
            .trim()
            .notEmpty()
            .withMessage("Note content is required")
            .isLength({ min: 3, max: 5000 })
            .withMessage("Note content must be between 3 and 5000 characters"),
    ];
};

export {
    projectIdParamValidator,
    noteIdParamValidator,
    createNoteValidator,
    updateNoteValidator,
};
