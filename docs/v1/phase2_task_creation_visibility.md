# V1 Phase 2: Task Operations & Team Boundaries

Welcome to Phase 2! In this phase, we focused on bringing task creation to life on the frontend, mapping assignees correctly, and tightening the backend boundaries so that users can never sneak peek or modify tasks belonging to teams they aren't part of.

Here is the simplified breakdown of how we did it.

---

## What We Solved
1. **Dynamic Task Creation**: We added a complete creation form directly on each team's board, allowing managers to draft tasks with a title, description, assignee, priority, status, and due date.
2. **Scoping Assignees**: The assignee selector is contextual. It lists the team manager and only the members who have been assigned to that specific team, keeping assignments logical and clean.
3. **Task Access Security**: We ensured that team boundaries are respected at the API level. Standard members cannot read, create, or modify tasks of teams they are not registered in.

---

## File-by-File Breakdown

### Backend (The Server)

* **[teamController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/teamController.js) (Auth Scope Population)**
  * **Role Verification Fix**: When requests are authenticated via JWT, the payload contains the user ID. We updated team checks to fetch the user's role directly from MongoDB so the backend can verify permissions and filter team views accurately.
  * **Manager Details**: Populated the manager’s name and profile details in the response payload. This allows the frontend to show who runs each team instead of a blank space or ID code.
* **[taskController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/taskController.js) (Task API Scoping)**
  * Enforced checks on task retrieval. The query matches the team's `members` roster or `managerId` against the user's authenticated ID, locking down unauthorized task queries.

### Frontend (The Client UI)

* **[TeamDetailPage.jsx](file:///d:/MyProject/task-management-mern/client/src/pages/Teams/TeamDetailPage.jsx) (The Kanban Board)**
  * **Create Task Button**: Placed a "Create Task" button in the board's header toolbar.
  * **Task Creation Modal**: Created a dialog window. When the user fills out details, they select an assignee from a dropdown list that aggregates the team manager and all enrolled members.
  * **Real-time Sync**: Wired the form submission to the `createTask` API call, and refreshed the board state on success so that the new card drops into the "To Do" column instantly.
