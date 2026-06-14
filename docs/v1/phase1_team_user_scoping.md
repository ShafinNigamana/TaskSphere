# V1 Phase 1: Team & User Scoping

Welcome to the documentation for Phase 1! The primary goal of this phase was to build a secure, logical boundary around teams. Before this implementation, any logged-in user could view every team and modify anything. We introduced restricted team scoping, user directories, and frontend management layouts.

Here is a simplified overview of how it works and what files control the logic.

---

## What We Solved
1. **Scoping Teams by Ownership & Enrollment**: We made sure that users only see the teams relevant to them. Managers see teams they created or are a part of, while standard members only see teams they are actively enrolled in.
2. **User Search and Directory**: We created a way for managers to search the entire system user database (by name or email) to quickly select who to invite/assign to their teams.
3. **Interactive Roster Management**: We built a complete frontend panel for managers to create teams, change team memberships, and view rosters dynamically.

---

## File-by-File Breakdown

### Backend (The Server)

* **[Team.js](file:///d:/MyProject/task-management-mern/server/src/models/Team.js) (Database Schema)**
  * Holds team structures in MongoDB. We added a `managerId` field referencing the `User` model, linking each team to its creator, alongside the list of enrolled `members`.
* **[teamController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/teamController.js) (API Controllers)**
  * **Creation**: Automatically assigns the currently logged-in manager's user ID as the team's owner (`managerId`).
  * **Team Query Filtering**: When fetching teams (`GET /api/teams`), we check if the user is a manager or a member. A manager is shown only their managed or enrolled teams. A member is shown only teams they belong to.
  * **Data Population**: We populated `members` with their profile names and email addresses so the frontend can display them directly instead of showing raw database object IDs.
* **[authController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/authController.js) & [userRoutes.js](file:///d:/MyProject/task-management-mern/server/src/routes/userRoutes.js) (User Search)**
  * Added a `getUsers` search function that uses case-insensitive regular expressions to search name or email. This search is securely restricted to managers only via authentication middleware.

### Frontend (The Client UI)

* **[teamService.js](file:///d:/MyProject/task-management-mern/client/src/services/teamService.js) & [userService.js](file:///d:/MyProject/task-management-mern/client/src/services/userService.js) (API Connection)**
  * Connects the React client with the Express backend endpoints for searching users and performing Team CRUD operations (Create, Read, Update, Delete).
* **[TeamsPage.jsx](file:///d:/MyProject/task-management-mern/client/src/pages/Teams/TeamsPage.jsx) (Teams Catalog)**
  * Displays the list of visible teams in card layouts. It displays a "Create Team" button to managers that opens a dialog overlay where they can set up a name and search for initial members.
* **[TeamDetailPage.jsx](file:///d:/MyProject/task-management-mern/client/src/pages/Teams/TeamDetailPage.jsx) (Team Roster Panel)**
  * Renders the team details. It exposes a "Manage Members" button for managers. Clicking this opens a modal displaying the current members as tags, allowing the manager to search for new users, add them as tags, or remove existing members.
* **[global.css](file:///d:/MyProject/task-management-mern/client/src/styles/global.css) (Styles)**
  * Provides visual layouts for modal screens, search results dropdown listings, and member pill tags.
