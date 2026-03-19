// This file defines constants related to user roles in the application.
export const UserRolesEnum = {
    ADMIN : "admin",
    PROJECT_ADMIN : "project_admin",
    MEMBER : "member",
}

// This array can be used for validation or dropdowns in the frontend
export const AvailableUserRoles = Object.values(UserRolesEnum);


// This file defines constants related to task statuses in the application.
export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done",
}

// This array can be used for validation or dropdowns in the frontend
export const AvailableTaskStatuses = Object.values(TaskStatusEnum);
