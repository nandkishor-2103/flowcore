# FlowCore API Testing Plan (Postman)

## 1. Purpose

This document gives a developer-friendly, practical plan to test all APIs in Postman end-to-end.

Goal:

- Validate functional behavior of all modules
- Validate authentication and role-based authorization
- Validate request validation and negative/error scenarios
- Ensure PRD coverage with reproducible test steps

## 2. Test Scope

Modules covered:

- Auth APIs
- Project APIs
- Project Member APIs
- Task APIs
- Subtask APIs
- Note APIs
- Healthcheck API

Base URL pattern:

- `{{baseUrl}}/api/v1`

Example:

- `http://localhost:8080/api/v1`

## 3. Pre-Requisites

Before testing, ensure:

- Server is running
- MongoDB is connected
- Environment variables are set (especially token secrets, mail config, server URL)
- Postman installed

Recommended users for role testing:

- User A: Admin in project
- User B: Project Admin in project
- User C: Member in project

## 4. Postman Setup

### 4.1 Create Postman Environment

Create one environment: `FlowCore-Local`

Add variables:

- `baseUrl` = `http://localhost:8080`
- `accessToken` = (empty)
- `refreshToken` = (empty)
- `projectId` = (empty)
- `taskId` = (empty)
- `subtaskId` = (empty)
- `noteId` = (empty)
- `userId` = (empty)
- `verificationToken` = (optional, if available)
- `resetToken` = (optional, if available)

### 4.2 Collection Structure

Create collection: `FlowCore API`

Recommended folders:

1. `00 Health`
2. `01 Auth`
3. `02 Projects`
4. `03 Project Members`
5. `04 Tasks`
6. `05 Subtasks`
7. `06 Notes`
8. `99 Negative & Security`

## 5. Common Request Configuration

### 5.1 Authorization

For secured APIs, use Bearer Token:

- Type: Bearer Token
- Token: `{{accessToken}}`

### 5.2 Reusable Tests Script (for Login)

Add this in Login request Tests tab:

```javascript
pm.test("Login success", function () {
    pm.response.to.have.status(200);
});

const res = pm.response.json();

if (res?.data?.accessToken) {
    pm.environment.set("accessToken", res.data.accessToken);
}
if (res?.data?.refreshToken) {
    pm.environment.set("refreshToken", res.data.refreshToken);
}
```

### 5.3 Reusable Tests Script (capture IDs)

Use this in create APIs where needed:

```javascript
const res = pm.response.json();

if (res?.data?._id) {
    // Replace target variable based on request type
    pm.environment.set("projectId", res.data._id);
}
```

## 6. Execution Order (Important)

Use this order for smooth end-to-end testing:

1. Health check
2. Register users (A, B, C)
3. Verify email (if your setup enforces it)
4. Login as User A (Admin)
5. Create project (store `projectId`)
6. Add members to project:
    - Add User B as `project_admin`
    - Add User C as `member`
7. Task lifecycle tests
8. Subtask lifecycle tests
9. Notes lifecycle tests
10. Re-login as User B and User C for role-based validation
11. Run negative/security tests

## 7. Endpoint-Wise Test Plan

## 7.1 Health

### GET `/api/v1/healthcheck/`

Checks:

- Status code: 200
- Response success should be true

## 7.2 Auth

### POST `/api/v1/auth/register`

Sample body:

```json
{
    "email": "admin1@example.com",
    "username": "admin_one",
    "password": "Strong@123",
    "fullName": "Admin One"
}
```

Checks:

- 201 expected
- user created
- duplicate register should fail with 409

### POST `/api/v1/auth/login`

Sample body:

```json
{
    "email": "admin1@example.com",
    "password": "Strong@123"
}
```

Checks:

- 200 expected
- capture `accessToken`, `refreshToken`

### POST `/api/v1/auth/logout` (secured)

Checks:

- 200 expected
- tokens cleared in cookies path if cookie-based flow is used

### GET `/api/v1/auth/current-user` (secured)

Checks:

- 200 expected
- returns authenticated user

### POST `/api/v1/auth/change-password` (secured)

Sample body:

```json
{
    "currentPassword": "Strong@123",
    "newPassword": "NewStrong@123",
    "confirmPassword": "NewStrong@123"
}
```

Checks:

- 200 expected
- wrong current password should fail

### POST `/api/v1/auth/refresh-token`

Body option:

```json
{
    "refreshToken": "{{refreshToken}}"
}
```

Checks:

- 200 expected
- new access token issued

### GET `/api/v1/auth/verify-email/:verificationToken`

### POST `/api/v1/auth/forgot-password`

### POST `/api/v1/auth/reset-password/:resetToken`

### POST `/api/v1/auth/resend-email-verification` (secured)

Checks:

- Flow works with valid tokens
- Invalid/expired token handling returns proper errors

## 7.3 Projects

### GET `/api/v1/projects/` (secured)

Checks:

- 200 expected
- list of user projects

### POST `/api/v1/projects/` (secured)

Sample body:

```json
{
    "name": "FlowCore Demo Project",
    "description": "Project for API testing"
}
```

Checks:

- 201 expected
- save `_id` as `projectId`

### GET `/api/v1/projects/:projectId` (secured, role-based)

Checks:

- Admin/Project Admin/Member should pass if project member
- non-member should fail

### PUT `/api/v1/projects/:projectId` (secured, admin only)

Sample body:

```json
{
    "name": "FlowCore Demo Project Updated",
    "description": "Updated description"
}
```

Checks:

- Admin pass
- Project Admin fail
- Member fail

### DELETE `/api/v1/projects/:projectId` (secured, admin only)

Checks:

- Admin pass
- Other roles fail

## 7.4 Project Members

### GET `/api/v1/projects/:projectId/members` (secured)

Checks:

- 200 expected
- member list contains roles

### POST `/api/v1/projects/:projectId/members` (secured, admin only)

Sample body:

```json
{
    "email": "projectadmin1@example.com",
    "role": "project_admin"
}
```

Checks:

- 200 expected
- role assignment stored

### PUT `/api/v1/projects/:projectId/members/:userId` (secured, admin only)

Sample body:

```json
{
    "newRole": "member"
}
```

Checks:

- 200 expected
- role updated

### DELETE `/api/v1/projects/:projectId/members/:userId` (secured, admin only)

Checks:

- 200 expected
- member removed

## 7.5 Tasks

### GET `/api/v1/tasks/:projectId` (secured, role-based)

Checks:

- project members can view

### POST `/api/v1/tasks/:projectId` (secured, admin/project_admin)

Use form-data if testing attachments:

- `title` (text)
- `description` (text)
- `status` (text: `todo` / `in_progress` / `done`)
- `assignedTo` (optional text userId)
- `attachments` (file, repeatable)

Checks:

- 201 expected
- save `taskId`

### GET `/api/v1/tasks/:projectId/t/:taskId` (secured, role-based)

Checks:

- 200 expected
- includes task details and subtasks

### PUT `/api/v1/tasks/:projectId/t/:taskId` (secured, admin/project_admin)

Checks:

- update title/description/status/assignedTo
- can upload new attachments

### DELETE `/api/v1/tasks/:projectId/t/:taskId` (secured, admin/project_admin)

Checks:

- 200 expected
- task removed

## 7.6 Subtasks

### POST `/api/v1/tasks/:projectId/t/:taskId/subtasks` (secured, admin/project_admin)

Sample body:

```json
{
    "title": "Setup database indexes",
    "isCompleted": false
}
```

Checks:

- 201 expected
- save `subtaskId`

### PUT `/api/v1/tasks/:projectId/st/:subtaskId` (secured, role-based)

Sample body:

```json
{
    "isCompleted": true
}
```

Checks:

- Admin/Project Admin/Member can update completion

### DELETE `/api/v1/tasks/:projectId/st/:subtaskId` (secured, admin/project_admin)

Checks:

- Admin and Project Admin pass
- Member fails

## 7.7 Notes

### GET `/api/v1/notes/:projectId` (secured, role-based)

Checks:

- all project roles can view

### POST `/api/v1/notes/:projectId` (secured, admin only)

Sample body:

```json
{
    "content": "Kickoff note: project timeline finalized."
}
```

Checks:

- 201 expected
- save `noteId`

### GET `/api/v1/notes/:projectId/n/:noteId` (secured, role-based)

Checks:

- 200 expected

### PUT `/api/v1/notes/:projectId/n/:noteId` (secured, admin only)

Sample body:

```json
{
    "content": "Kickoff note updated after stakeholder review."
}
```

Checks:

- Admin pass
- Project Admin fail
- Member fail

### DELETE `/api/v1/notes/:projectId/n/:noteId` (secured, admin only)

Checks:

- Admin pass
- Project Admin fail
- Member fail

## 8. Negative and Security Test Cases

Run these for every secured module:

- Missing token -> expect unauthorized response
- Invalid token -> expect unauthorized response
- Invalid Mongo ID in params -> expect validation failure (422)
- Required field missing -> expect validation failure
- Wrong role access -> expect forbidden response
- Non-member accessing project resources -> expect forbidden/not found as per endpoint logic

## 9. Suggested Postman Role Strategy

Use 3 environments or 3 token variables:

- `accessToken_admin`
- `accessToken_project_admin`
- `accessToken_member`

Before role-based endpoint call, set `accessToken` to relevant role token.

## 10. Collection Runner Plan

Create a dedicated run order:

1. Health
2. Auth register/login (Admin)
3. Project create
4. Member add (project_admin and member)
5. Task create/get/update/delete
6. Subtask create/update/delete
7. Note create/get/update/delete
8. Authorization negative checks for each role

## 11. Pass/Fail Criteria

Pass criteria:

- All expected success scenarios pass with correct status and response shape
- All role restrictions enforced correctly
- Validation and error handling works for bad inputs

Fail criteria:

- Any endpoint violates role matrix
- Invalid payloads are accepted without validation errors
- Resource ownership/project scope checks fail

## 12. Practical Tips (Developer Friendly)

- Start manual first, then automate in Collection Runner
- Save every generated ID immediately into environment variables
- Keep one clean test dataset/project for repeatable runs
- If token expires during run, re-login and re-run from dependent folder
- Keep a defect log with: endpoint, payload, expected, actual, timestamp

## 13. Optional Enhancement (Next)

After manual validation is stable, export collection + environment and run with Newman in CI for regression testing.
