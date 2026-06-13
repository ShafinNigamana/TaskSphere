# API Documentation

This document describes the REST API endpoints, request/response formats, and access control policies for the Team Task Management Platform.

---

## Authentication & Authorization

All endpoints except `/api/auth/login`, `/api/auth/signup`, and `/api/health` require a JWT access token sent in the `Authorization` header as a Bearer token:
```http
Authorization: Bearer <your-jwt-token>
```

### Access Roles:
* `manager`: Full administrative privileges, team creation, team modification, report access, and CSV export.
* `member`: View teams, view/update tasks on their teams, view activity feeds, and manage tasks via Kanban.

---

## Auth Module

### Register / Signup
* **Endpoint**: `POST /api/auth/signup`
* **Description**: Registers a new user.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "manager" 
  }
  ```
  *(Note: `role` must be either `"manager"` or `"member"`)*
* **Success Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60d000000000000000000001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "manager"
    }
  }
  ```

### Login
* **Endpoint**: `POST /api/auth/login`
* **Description**: Authenticates user and returns JWT.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60d000000000000000000001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "manager"
    }
  }
  ```

---

## Team Module

### View All Teams
* **Endpoint**: `GET /api/teams`
* **Description**: Retrieves a list of all teams.
* **Access**: Protected (Manager & Member)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d000000000000000000002",
      "name": "Frontend Engineering",
      "members": [
        "60d000000000000000000001",
        "60d000000000000000000003"
      ],
      "createdAt": "2026-06-01T10:00:00.000Z",
      "updatedAt": "2026-06-01T10:00:00.000Z"
    }
  ]
  ```

### Create Team
* **Endpoint**: `POST /api/teams`
* **Description**: Creates a new collaboration team.
* **Access**: Protected (Manager Only)
* **Request Body**:
  ```json
  {
    "name": "Backend DevOps",
    "members": [
      "60d000000000000000000001"
    ]
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "_id": "60d000000000000000000004",
    "name": "Backend DevOps",
    "members": [
      "60d000000000000000000001"
    ],
    "createdAt": "2026-06-13T10:00:00.000Z"
  }
  ```

### Update Team
* **Endpoint**: `PUT /api/teams/:id`
* **Description**: Modifies team metadata or roster.
* **Access**: Protected (Manager Only)
* **Request Body**:
  ```json
  {
    "name": "DevOps & SRE",
    "members": [
      "60d000000000000000000001",
      "60d000000000000000000005"
    ]
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "60d000000000000000000004",
    "name": "DevOps & SRE",
    "members": [
      "60d000000000000000000001",
      "60d000000000000000000005"
    ]
  }
  ```

### Delete Team
* **Endpoint**: `DELETE /api/teams/:id`
* **Description**: Removes a team from database.
* **Access**: Protected (Manager Only)
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Team deleted successfully"
  }
  ```

---

## Task Module

### View All Tasks
* **Endpoint**: `GET /api/tasks`
* **Description**: Returns filtered list of tasks.
* **Access**: Protected (Manager & Member)
* **Query Parameters**:
  * `teamId` (optional) - Filter tasks by team.
  * `assigneeId` (optional) - Filter tasks by assignee.
  * `status` (optional) - `todo` | `in-progress` | `done`
  * `priority` (optional) - `low` | `medium` | `high`
* **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d000000000000000000010",
      "title": "Setup CI/CD Pipeline",
      "description": "Configure GitHub actions and test runner",
      "assigneeId": {
        "_id": "60d000000000000000000001",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "manager"
      },
      "teamId": "60d000000000000000000004",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-06-20T23:59:59.000Z",
      "createdAt": "2026-06-13T12:00:00.000Z"
    }
  ]
  ```

### View Task Details
* **Endpoint**: `GET /api/tasks/:id`
* **Description**: Retrieve specific task information.
* **Access**: Protected (Manager & Member)

### Create Task
* **Endpoint**: `POST /api/tasks`
* **Description**: Create a task. Logs a `CREATE_TASK` audit entry.
* **Access**: Protected (Manager & Member)
* **Request Body**:
  ```json
  {
    "title": "Design Database Schema",
    "description": "Create MongoDB schemas and indexes",
    "teamId": "60d000000000000000000004",
    "assigneeId": "60d000000000000000000001",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2026-06-18"
  }
  ```

### Update Task (Full / Partial)
* **Endpoint**: `PUT /api/tasks/:id` or `PATCH /api/tasks/:id`
* **Description**: Updates fields on a task. Updates log a `UPDATE_TASK` audit entry detailing changed fields.
* **Access**: Protected (Manager & Member)
* **Request Body (Partial Update Example)**:
  ```json
  {
    "status": "done"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "60d000000000000000000010",
    "title": "Setup CI/CD Pipeline",
    "status": "done",
    "priority": "high"
  }
  ```

### Delete Task
* **Endpoint**: `DELETE /api/tasks/:id`
* **Description**: Deletes a task. Logs a `DELETE_TASK` audit entry.
* **Access**: Protected (Manager & Member)

---

## Audit Module

### Get Audit Logs
* **Endpoint**: `GET /api/audit`
* **Description**: Retrieve audit events filtered by team, paginated.
* **Access**: Protected (Manager & Member)
* **Query Parameters**:
  * `teamId` (optional) - Filter by team.
  * `page` (optional) - Page number (defaults to 1).
  * `limit` (optional) - Logs per page (defaults to 10).
* **Success Response (200 OK)**:
  ```json
  {
    "page": 1,
    "limit": 20,
    "total": 45,
    "logs": [
      {
        "id": 12,
        "action": "UPDATE_TASK",
        "actor_id": "60d000000000000000000001",
        "target_id": "60d000000000000000000010",
        "team_id": "60d000000000000000000004",
        "payload_json": "{\"title\":\"Setup CI/CD Pipeline\",\"updatedFields\":{\"status\":\"done\"}}",
        "created_at": "2026-06-13T12:05:00.000Z"
      }
    ]
  }
  ```

---

## Reports Module

### Get Report Metrics
* **Endpoint**: `GET /api/reports/metrics`
* **Description**: Aggregates dashboard reports from operational MySQL audit logs and MongoDB tasks.
* **Access**: Protected (Manager Only)
* **Success Response (200 OK)**:
  ```json
  {
    "tasksClosedPerWeek": [
      { "week": 202624, "closed_count": 8 },
      { "week": 202623, "closed_count": 14 }
    ],
    "topContributors": [
      { "actor_id": "60d000000000000000000001", "name": "Jane Doe", "actions": 42 },
      { "actor_id": "60d000000000000000000003", "name": "John Smith", "actions": 18 }
    ],
    "overdueRate": {
      "totalActive": 10,
      "overdue": 2,
      "rate": 0.2
    }
  }
  ```

### Export Reports CSV
* **Endpoint**: `GET /api/reports/export`
* **Description**: Streams aggregated reports structured as a CSV table file.
* **Access**: Protected (Manager Only)
* **Headers Returned**:
  * `Content-Type`: `text/csv`
  * `Content-Disposition`: `attachment; filename=report-metrics.csv`
