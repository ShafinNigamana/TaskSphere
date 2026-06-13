# Team Task Management Platform (MERN)

A high-performance team task management platform built using the MERN stack with a dual-database architecture. The system combines flexible document transactions (MongoDB Atlas) for team metadata and task status with structured audit history logs (MySQL) for secure historical querying.

---

## Project Overview

This platform is built as a developer-friendly monorepo using `pnpm` workspaces. It provides user authentication, team organization controls, visual Kanban project boards, a chronological team activity feed, and manager metrics dashboard with CSV report export capabilities.

---

## Core Features

### 🔐 Authentication & Access Control
* **JWT-Based Login / Registration**: Secure sign-up/sign-in flows that return a token and store session details in `localStorage`.
* **Protected Routes**: Restricts navigation views utilizing route components based on authorization roles.
* **Role-Based Policies (`manager` vs `member`)**:
  * **Managers**: Full workspace administration including team CRUD and Reports analytics dashboards.
  * **Members**: Group collaboration, task status management, and viewing activity logs.

### 📋 Team & Task Boards (Kanban)
* **3-Column Board**: Task workflow split into `To Do`, `In Progress`, and `Done` states.
* **Fluid Drag & Drop**: Native board interactions implemented using `@dnd-kit/core` with `PointerSensor` activation constraints.
* **Optimistic UI Updates**: Task moves reflect instantly on the UI for high responsiveness.
* **Automatic Rollbacks**: Status patches that fail on the backend trigger automatic UI card reversion to ensure state consistency.
* **Dynamic Avatars**: Avatars dynamically render task assignee initials (e.g. "Jane Doe" -> "JD") or `'UN'` (Unassigned) based on populated backend references.
* **Filter Chips**: Instant filtering by "All", "My Tasks", "High Priority", and "Overdue" task badges.

### 📜 Real-Time Activity Feed
* **Decoupled Audit Logs**: Logs are parsed from MySQL database and filtered by team.
* **Silent Polling**: 5-second background query keeps the board and feed updated without interrupting user flows.
* **Chronological Pagination**: Clean feed pages limited to 20 logs each.
* **Relative Timestamps**: Formatted relative dates (e.g. "Just now", "Yesterday").

### 📊 Manager Reports
* **Recharts Visualizations**: Interactive weekly closed task stats.
* **Leaderboard Statistics**: Rank contributors by their log action frequency.
* **Overdue Rate Tracker**: Displays overdue rates based on due dates.
* **CSV Export Stream**: Immediate download of complete reports metrics.

---

## Technology Stack

### Frontend
* **Core Library**: React (v19)
* **Build tool**: Vite
* **Routing**: React Router DOM (v7)
* **HTTP Client**: Axios (with token interceptors)
* **Drag-and-Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
* **Charts**: Recharts (for responsive report metrics)

### Backend
* **Runtime**: Node.js
* **Framework**: Express.js
* **Security Middleware**: Helmet, CORS, Morgan
* **ORM / Database Driver**: Mongoose (MongoDB) & `mysql2/promise` (MySQL)
* **Authorization**: jsonwebtoken & bcrypt

---

## System Architecture

```text
               ┌──────────────────────────────┐
               │    React SPA Client (Vite)   │
               └──────────────┬───────────────┘
                              │ HTTP Requests
                              ▼
               ┌──────────────────────────────┐
               │  Express.js Application API  │
               └──────────────┬───────────────┘
                              │
               ┌──────────────┴───────────────┐
               ▼                              ▼
    ┌────────────────────┐          ┌────────────────────┐
    │MongoDB Operational │          │    MySQL Log DB    │
    │ (Teams, Users,     │          │  (Audit Log Table) │
    │  Task Documents)   │          └────────────────────┘
    └────────────────────┘
```

For a detailed review of components, contexts, and sequences, read the [System Architecture Guide](file:///d:/MyProject/task-management-mern/docs/architecture/system-overview.md).

---

## Project Structure

```text
task-management-mern/
├── client/                     # React Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable layouts, feeds, and guards
│   │   ├── context/            # AuthContext providers
│   │   ├── layouts/            # Sidebar + Header MainLayout
│   │   ├── pages/              # Dashboard, Teams, Kanban, Reports pages
│   │   ├── services/           # Axios API service integrations
│   │   └── styles/             # global.css design tokens
├── server/                     # Node.js Express REST API
│   ├── src/
│   │   ├── config/             # DB connection hooks (Mongo & MySQL)
│   │   ├── controllers/        # Request handlers (auth, tasks, reports)
│   │   ├── middleware/         # protect/restrictTo JWT guards
│   │   ├── models/             # Mongoose Schemas (User, Team, Task)
│   │   ├── routes/             # REST Route mappings
│   │   └── utils/              # MySQL log audit utilities
├── docs/                       # Design guides and logs
└── README.md
```

---

## Environment Variables

### Backend (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/task_management_db
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=task_management_audit
JWT_SECRET=your_jwt_secret_key
```

### Frontend (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Setup Instructions

### Prerequisites
* Node.js (v18+)
* `pnpm` installed globally (`npm install -g pnpm`)
* A running MongoDB instance (or Atlas account)
* A running MySQL database instance

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd task-management-mern
   ```
2. Install workspace dependencies:
   ```bash
   pnpm install
   ```

### Running the Application
1. **Start Backend Server**:
   ```bash
   pnpm run dev:server
   ```
2. **Start Frontend Client**:
   ```bash
   pnpm run dev:client
   ```
3. Open `http://localhost:5173` in your browser.

---

## API Overview

For detailed request payloads, HTTP methods, response structures, and role restrictions, read the [REST API Reference Guide](file:///d:/MyProject/task-management-mern/docs/api-documentation.md).

---

## Completed Internship Milestones

### Week 3
* **Authentication**: Signup, login, JWT token generation, and secure local token storage.
* **Routing**: Setup client side Router, routing layout viewports, and Protected route wrappers.
* **Dashboard**: Total count cards, recent task listings.
* **Teams**: Renders all team cards, roster sizes, and routing details.

### Week 4
* **Kanban Board**: Drag-and-drop workflow status boards, optimistic updates, and rollback failure state handler.
* **Activity Feed**: Paginated list details, relative timestamps, and key-based auto-resets on team swaps.
* **Reports**: Top contributor lists, tasks closed charts, overdue rate tracking calculations.
* **CSV Export**: Streams compiled metrics directly into standard file format.
* **Manager Access Control**: Role checks restricted backend controllers and hid frontend navigation menus.

---

## Current Status

**Day 26 Final Submission Audit and Refinement completed.**
* **Linting status**: 0 errors, 0 warnings.
* **Production Build status**: 0 compile errors.
* **Final Verdict**: **READY FOR SUBMISSION**.
