# V1 Phase 5: API Rate Limiting & Advanced Metrics

Welcome to Phase 5! This final phase of Version 1 introduced core production-readiness enhancements: securing our server endpoints against spamming and abuse with IP-based rate limiters, calculating advanced team performance metrics, and updating report exports.

Here is the simplified file guide for Phase 5.

---

## What We Solved
1. **API Rate Limiting Protection**: We secured the backend by installing rate limiters. Standard API routes are limited to 100 requests every 15 minutes per IP address. The sensitive authentication routes (login and register) are locked down to a maximum of 10 requests every 15 minutes per IP address to block automated brute-force attacks.
2. **Average Task Resolution Duration**: The reports dashboard now shows the average resolution time. It tracks how long tasks take to complete by comparing the difference between task creation (`createdAt`) and completion status (`updatedAt`).
3. **Team Productivity breakdown**: We added a stacked bar chart mapping task completions per team. Managers can quickly see the completed task counts vs active task counts for each team on a single graph.
4. **Enhanced CSV Reporting**: The CSV export function was updated to include resolution hours and team productivity breakdowns in the downloaded file structure.

---

## File-by-File Breakdown

### Backend (The Server)

* **[rateLimiter.js](file:///d:/MyProject/task-management-mern/server/src/middleware/rateLimiter.js) (NEW - Rate Limiting Middlewares)**
  * Sets up rate limiting using `express-rate-limit`. Exposes `generalLimiter` (100 requests/15m) and `authLimiter` (10 requests/15m) with clean error response messages.
* **[app.js](file:///d:/MyProject/task-management-mern/server/src/app.js) (Limiter Mounts)**
  * Mounted limiters. Applies `generalLimiter` to all routes starting with `/api` and applies `authLimiter` strictly to authentication login and registration endpoints.
* **[reportController.js](file:///d:/MyProject/task-management-mern/server/src/controllers/reportController.js) (Advanced Metric Math)**
  * **Resolution Hours**: Queries MongoDB done tasks and calculates the average duration in hours.
  * **Team Task Totals**: Computes completed vs active task totals grouped by team profiles.
  * **CSV Stream**: Appends these calculations to the CSV generation logic so that download sheets align with the new charts.

### Frontend (The Client UI)

* **[ReportsPage.jsx](file:///d:/MyProject/task-management-mern/client/src/pages/Reports/ReportsPage.jsx) (Reports Center)**
  * **Resolution Card**: Renders the average hours duration as a prominent card stat.
  * **stacked Bar Chart**: Integrates a Recharts stacked `BarChart` rendering completed tasks (green bars) and active tasks (blue bars) stacked together for each team. Shows a clear legend description at the top.
