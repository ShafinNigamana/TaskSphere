# V1 Phase 4: Security, Hierarchical Roles, & Active Sessions

Welcome to the documentation for Phase 4! In this phase, we completed major security updates, introducing active session device tracking, weighted role weights, and direct local password updates for team members.

Here is the simplified file guide for these integrations.

---

## What We Solved
1. **Short-lived Access & Long-lived Refresh Tokens**: Changed standard JWT authentication to issue short-lived Access Tokens (15 minutes) and long-lived Refresh Tokens (7 days). On the client, Axios response interceptors catch `401` errors and automatically refresh tokens in the background, retrying failed requests silently.
2. **Active Device Session Listings**: Users can view all browser sessions logged into their account, listing OS names, browsers, IP addresses, and login times. They can revoke any session, logging out that device immediately.
3. **Role Hierarchy Access Control**: Expanded roles (`super_admin` > `manager` > `team_lead` > `member`). The routing middleware assigns numerical weights to roles so that higher-level roles automatically inherit the permissions of lower-level restrictions.
4. **Direct Password Resets**: Managers and administrators can reset team members' passwords directly from the member modal. The reset action instantly destroys the target user's active sessions (forcing an immediate log out) and logs a security audit event.

---

## File-by-File Breakdown

### Backend (The Server)

* **[Session.js](file:///d:/MyProject/task-management-mern/server/src/models/Session.js) (NEW - Database Schema)**
  * Creates a database collection mapping user IDs to their refresh tokens, recording IP addresses, browser client user agents, and creation/expiry dates.
* **[User.js](file:///d:/MyProject/task-management-mern/server/src/models/User.js) (Roles Enum)**
  * Expanded the role field list definitions to: `['super_admin', 'manager', 'team_lead', 'member']`.
* **[auth.js](file:///d:/MyProject/task-management-mern/server/src/middleware/auth.js) (Role Hierarchy Middleware)**
  * Rewrote `restrictTo` middleware to check weights. If a route allows `'team_lead'`, users with weight `2` or higher (team leads, managers, super admins) are permitted.
* **[authController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/authController.js) (Security APIs)**
  * **Login/Register**: Saves device details to the `Session` collection on login and includes refresh tokens in response payloads.
  * **Refresh Token**: Validates refresh tokens, deletes old sessions, and issues rotated credentials.
  * **Sessions List & Revocation**: Retrieves active device sessions and revokes them by ID.
  * **Password Reset**: Hashes a target user's password, deletes all of their database session records (forcing immediate logout), and writes a `PASSWORD_RESET` audit log event.

### Frontend (The Client UI)

* **[api.js](file:///d:/MyProject/task-management-mern/client/src/services/api.js) (Axios Silent Interceptor)**
  * Added response interceptors. If a request returns a `401 Unauthorized` status (expired access token), it blocks the request, queries `/auth/refresh-token`, saves the new token, and replays all queued network requests.
* **[AuthContext.jsx](file:///d:/MyProject/task-management-mern/client/src/context/AuthContext.jsx) (Refresh State)**
  * Stores and deletes `refreshToken` in/from local storage alongside user profiles.
* **[SessionsPage.jsx](file:///d:/MyProject/task-management-mern/client/src/pages/Auth/SessionsPage.jsx) (NEW - Active Devices Interface)**
  * Lists logged-in devices. Displays browser type and OS, IP address, and active time. Exposes a "Revoke" button to log out other devices.
* **[TeamDetailPage.jsx](file:///d:/MyProject/task-management-mern/client/src/pages/Teams/TeamDetailPage.jsx) (Direct Reset UI)**
  * Added lock icons next to member tags in the membership modal. Clicking it opens a form to reset that user's password and log them out of active sessions immediately.
