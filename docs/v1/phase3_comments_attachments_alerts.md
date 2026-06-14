# V1 Phase 3: Task Discussion, Local Attachments, & Alerts

Welcome to Phase 3! This phase was all about collaborative features. We turned simple task cards into interactive nodes where team members can discuss work, upload local files directly to the server, and receive alerts in the application header when actions occur.

Here is the simplified guide to the file changes.

---

## What We Solved
1. **Interactive Task Discussions**: We added comments to task detail views. Users can post questions or progress reports, creating an activity thread on each task card.
2. **Local File Attachments**: Users can upload files (PDFs, images, documents) directly from their computer. The files are securely saved to the server's local disk storage and linked to the task.
3. **In-App Notification Alerts**: A notification bell in the header polls the server and displays a red badge when a user is assigned a task or mentioned in comments. Clicking an alert marks it read.

---

## File-by-File Breakdown

### Backend (The Server)

* **[Comment.js](file:///d:/MyProject/task-management-mern/server/src/models/Comment.js) & [Notification.js](file:///d:/MyProject/task-management-mern/server/src/models/Notification.js) (Schemas)**
  * Comments schema records task relations, author profiles, and comment text.
  * Notifications schema tracks recipient IDs, message descriptions, read status, and links to source tasks.
* **[commentController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/commentController.js) (Discussion APIs)**
  * Saves new comments and triggers a helper to queue a notification alert for other task stakeholders.
* **[notificationController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/notificationController.js) (Alert APIs)**
  * Manages unread alert counts and lists unread notifications.
* **[upload.js](file:///d:/MyProject/task-management-mern/server/src/middleware/upload.js) (Multer File Upload Middleware)**
  * Uses the `multer` package to intercept multipart form file streams, naming files with random suffixes and storing them under the local `./uploads` directory.
* **[taskController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/taskController.js) (Task Attachments)**
  * Modified to save upload path metadata in the task's database record when an attachment is successfully received.
* **[app.js](file:///d:/MyProject/task-management-mern/server/src/app.js) (Statically Serving Uploads)**
  * Configured `app.use('/uploads', express.static(...))` to make the local uploads folder accessible to frontend download links.

### Frontend (The Client UI)

* **[commentService.js](file:///d:/MyProject/task-management-mern/client/src/services/commentService.js) & [notificationService.js](file:///d:/MyProject/task-management-mern/client/src/services/notificationService.js) (Services)**
  * Handles the API requests for comment retrieval and notification status toggles.
* **[TaskDetailModal.jsx](file:///d:/MyProject/task-management-mern/client/src/components/TaskDetailModal.jsx) (Task Hub Modal)**
  * Renders on card click. Displays description inputs, property dropdowns, a file upload drag/drop input, a list of downloadable attachments, and a dynamic comment timeline.
* **[NotificationBell.jsx](file:///d:/MyProject/task-management-mern/client/src/components/NotificationBell.jsx) (Alert Indicator)**
  * Placed next to the username in the header. Periodically polls the server for unread alerts, displays a count badge, and renders a clean dropdown feed of recent notifications.
