import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import SignupPage from "../pages/Signup/SignupPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import TeamsPage from "../pages/Teams/TeamsPage";
import TeamDetailPage from "../pages/Teams/TeamDetailPage";
import TasksPage from "../pages/Tasks/TasksPage";
import TaskDetailPage from "../pages/Tasks/TaskDetailPage";
import HealthPage from "../pages/System/HealthPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/teams/:id" element={<TeamDetailPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/tasks/:id" element={<TaskDetailPage />} />
      <Route path="/health" element={<HealthPage />} />
    </Routes>
  );
}

export default AppRoutes;
