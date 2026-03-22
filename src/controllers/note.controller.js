import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ProjectNote } from "../models/note.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const ensureProjectAccess = async function (projectId, userId, allowedRoles) {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId),
    });

    if (!projectMember) {
        throw new ApiError(403, "You are not a member of this project");
    }

    if (!allowedRoles.includes(projectMember.role)) {
        throw new ApiError(403, "You do not have permission to perform this action");
    }
};

const getProjectNotes = asyncHandler(async function (req, res) {
    const { projectId } = req.params;

    await ensureProjectAccess(projectId, req.user._id, AvailableUserRoles);

    const notes = await ProjectNote.find({
        project: new mongoose.Types.ObjectId(projectId),
    })
        .populate("createdBy", "avatar username fullName email")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, notes, "Project notes retrieved successfully"));
});

const createProjectNote = asyncHandler(async function (req, res) {
    const { projectId } = req.params;
    const { content } = req.body;

    await ensureProjectAccess(projectId, req.user._id, [UserRolesEnum.ADMIN]);

    const note = await ProjectNote.create({
        project: new mongoose.Types.ObjectId(projectId),
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        content,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, note, "Project note created successfully"));
});

const getProjectNoteById = asyncHandler(async function (req, res) {
    const { projectId, noteId } = req.params;

    await ensureProjectAccess(projectId, req.user._id, AvailableUserRoles);

    const note = await ProjectNote.findOne({
        _id: new mongoose.Types.ObjectId(noteId),
        project: new mongoose.Types.ObjectId(projectId),
    }).populate("createdBy", "avatar username fullName email");

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Project note retrieved successfully"));
});

const updateProjectNote = asyncHandler(async function (req, res) {
    const { projectId, noteId } = req.params;
    const { content } = req.body;

    await ensureProjectAccess(projectId, req.user._id, [UserRolesEnum.ADMIN]);

    const note = await ProjectNote.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(noteId),
            project: new mongoose.Types.ObjectId(projectId),
        },
        { content },
        { returnDocument: "after" },
    );

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Project note updated successfully"));
});

const deleteProjectNote = asyncHandler(async function (req, res) {
    const { projectId, noteId } = req.params;

    await ensureProjectAccess(projectId, req.user._id, [UserRolesEnum.ADMIN]);

    const note = await ProjectNote.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(noteId),
        project: new mongoose.Types.ObjectId(projectId),
    });

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Project note deleted successfully"));
});

export {
    getProjectNotes,
    createProjectNote,
    getProjectNoteById,
    updateProjectNote,
    deleteProjectNote,
};