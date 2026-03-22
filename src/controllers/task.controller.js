import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Subtask } from "../models/subtask.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableTaskStatuses } from "../utils/constants.js";

// ==========Get all tasks for a project==========
const getTasks = asyncHandler(async function (req, res) {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId),
    })
        .populate("assignedTo", "avatar username fullName email")
        .populate("assignedBy", "avatar username fullName email");

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

// =========Create a new task in a project==========
const createTask = asyncHandler(async function (req, res) {
    const { title, description, status, assignedTo } = req.body;
    const { projectId } = req.params;

    // Validate input
    if (!title || !description || !status) {
        throw new ApiError(400, "Title, description, and status are required");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const files = req.files || [];

    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    });

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo
            ? new mongoose.Types.ObjectId(assignedTo)
            : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully"));
});

// ========Get a specific task by ID==========
const getTaskById = asyncHandler(async function (req, res) {
    const { taskId } = req.params;
    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        _id: 1,
                        avatar: 1,
                        username: 1,
                        fullName: 1,
                        email: 1,
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
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
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0],
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0],
                },
            },
        },
    ]);

    if (!task || task.length === 0) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task[0], "Task retrieved successfully"));
});

// ========Update a task by ID==========
const updateTask = asyncHandler(async function (req, res) {
    const { taskId } = req.params;
    const { title, description, status, assignedTo } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (
        title === undefined &&
        description === undefined &&
        status === undefined &&
        assignedTo === undefined &&
        (!req.files || req.files.length === 0)
    ) {
        throw new ApiError(
            400,
            "At least one field is required to update task",
        );
    }

    if (status !== undefined && !AvailableTaskStatuses.includes(status)) {
        throw new ApiError(400, "Invalid task status");
    }

    if (assignedTo !== undefined) {
        const user = await User.findById(assignedTo);
        if (!user) {
            throw new ApiError(404, "Assigned user not found");
        }
        task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    const files = req.files || [];
    if (files.length > 0) {
        const attachments = files.map((file) => ({
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size,
        }));

        task.attachments = [...task.attachments, ...attachments];
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
        .populate("assignedTo", "avatar username fullName email")
        .populate("assignedBy", "avatar username fullName email");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

// ========Delete a task by ID==========
const deleteTask = asyncHandler(async function (req, res) {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await Subtask.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(taskId);

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task deleted successfully"));
});

// ========Create a new subtask for a task==========
const createSubtask = asyncHandler(async function (req, res) {
    const { taskId } = req.params;
    const { title, isCompleted } = req.body;

    if (!title) {
        throw new ApiError(400, "Subtask title is required");
    }

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (isCompleted !== undefined && typeof isCompleted !== "boolean") {
        throw new ApiError(400, "isCompleted must be a boolean value");
    }

    const subtask = await Subtask.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        isCompleted: isCompleted ?? false,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, subtask, "Subtask created successfully"));
});

// ========Update a subtask by ID==========
const updateSubtask = asyncHandler(async function (req, res) {
    const { taskId, subtaskId } = req.params;
    const { title, isCompleted } = req.body;

    if (title === undefined && isCompleted === undefined) {
        throw new ApiError(
            400,
            "At least one field is required to update subtask",
        );
    }

    if (isCompleted !== undefined && typeof isCompleted !== "boolean") {
        throw new ApiError(400, "isCompleted must be a boolean value");
    }

    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    if (taskId && subtask.task.toString() !== taskId) {
        throw new ApiError(404, "Subtask not found in this task");
    }

    if (title !== undefined) subtask.title = title;
    if (isCompleted !== undefined) subtask.isCompleted = isCompleted;

    await subtask.save();

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, "Subtask updated successfully"));
});

// ========Delete a subtask by ID==========
const deleteSubtask = asyncHandler(async function (req, res) {
    const { taskId, subtaskId } = req.params;

    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    if (taskId && subtask.task.toString() !== taskId) {
        throw new ApiError(404, "Subtask not found in this task");
    }

    await Subtask.findByIdAndDelete(subtaskId);

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, "Subtask deleted successfully"));
});

export {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
};
