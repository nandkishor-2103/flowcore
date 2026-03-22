import { Router } from "express";

import {
    getProjectNotes,
    createProjectNote,
    getProjectNoteById,
    updateProjectNote,
    deleteProjectNote,
} from "../controllers/note.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    projectIdParamValidator,
    noteIdParamValidator,
    createNoteValidator,
    updateNoteValidator,
} from "../validators/note.validator.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/:projectId")
    .get(projectIdParamValidator(), validate, getProjectNotes)
    .post(
        projectIdParamValidator(),
        createNoteValidator(),
        validate,
        createProjectNote,
    );

router
    .route("/:projectId/n/:noteId")
    .get(
        projectIdParamValidator(),
        noteIdParamValidator(),
        validate,
        getProjectNoteById,
    )
    .put(
        projectIdParamValidator(),
        noteIdParamValidator(),
        updateNoteValidator(),
        validate,
        updateProjectNote,
    )
    .delete(
        projectIdParamValidator(),
        noteIdParamValidator(),
        validate,
        deleteProjectNote,
    );

export default router;
