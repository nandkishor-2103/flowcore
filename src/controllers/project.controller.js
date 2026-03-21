import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

// ========= Get all projects for the authenticated user ===========
const getProjects = asyncHandler(async function (req, res) {
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "projects",
                foreignField: "_id",
                as: "projects",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "projects",
                            as: "projectmembers",
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectmembers",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$project",
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                members: 1,
                createdAt: 1,
                createdBy: 1,
            },
            role: 1,
            _id: 0,
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, projects, "Projects retrieved successfully"),
        );
});

// ========== Get project by id ===========
const getProjectById = asyncHandler(async function (req, res) {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project retrieved successfully"));
});

// ========== Create a new project ===========
const createProject = asyncHandler(async function (req, res) {
    const { name, description } = req.body;

    // Check if project name already exists
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
        throw new ApiError(
            400,
            "Project name already exists, please choose a different name.",
        );
    }

    // Create new project
    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    });

    // Add creator as a member of the project with 'owner' role
    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});

// ========== Update a project ===========
const updateProject = asyncHandler(async function (req, res) {
    const { name, description } = req.body;

    // Check if project exists
    const { projectId } = req.params;
    const project = await Project.findByIdAndUpdate(
        projectId,
        { name, description },
        { returnDocument: "after" },
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project updated successfully"));
});

// ========= Delete a project ===========
const deleteProject = asyncHandler(async function (req, res) {
    const { projectId } = req.params;

    // Check if project exists
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Remove all project members associated with the deleted project
    // await ProjectMember.deleteMany({
    //     project: new mongoose.Types.ObjectId(projectId),
    // });

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project deleted successfully"));
});

// ======== Add a member to a project ===========
const addMemberToProject = asyncHandler(async function (req, res) {
    const { email, role } = req.body;
    const { projectId } = req.params;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Check if project exists
    await ProjectMember.findByIdAndUpdate(
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
        },
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
            role: role,
        },
        {
            returnDocument: "after",
            upsert: true,
        },
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Member added to project successfully"),
        );
});

// ======== Get all members of a project ===========
const getProjectMembers = asyncHandler(async function (req, res) {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            avatar: 1,
                            username: 1,
                            fullName: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                $arrayElemAt: ["$user", 0],
            },
        },
        {
            $project: {
                project: 1,
                user: 1,
                role: 1,
                createdAt: 1,
                updatedAt: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                projectMembers,
                "Project members retrieved successfully",
            ),
        );
});

// ======== Update a member's role in a project ===========
const updateMemberRole = asyncHandler(async function (req, res) {
    const { projectId, userId } = req.params;
    const { newRole } = req.body;

    if (!AvailableUserRoles.includes(newRole)) {
        throw new ApiError(400, "Invalid role provided");
    }

    const projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId),
    });

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    const updatedProjectMemberRole = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        { role: newRole },
        { returnDocument: "after" },
    );

    if (!updatedProjectMemberRole) {
        throw new ApiError(500, "Failed to update member role");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedProjectMemberRole,
                "Project member role updated successfully",
            ),
        );
});

// ======== Remove a member from a project ===========
const removeMemberFromProject = asyncHandler(async function (req, res) {
    const { projectId, userId } = req.params;

    const projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId),
    });

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    const removedProjectMember = await ProjectMember.findByIdAndDelete(
        projectMember._id,
    );

    if (!removedProjectMember) {
        throw new ApiError(500, "Failed to remove member from project");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                removedProjectMember,
                "Project member removed successfully",
            ),
        );
});

export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateMemberRole,
    removeMemberFromProject,
};
