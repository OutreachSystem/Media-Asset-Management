import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { AppDataProvider } from "./context/AppDataContext";
import { AppShell } from "./layouts/AppShell";
import { ActivityPage } from "./pages/ActivityPage";
import { LibraryPage, ProjectsPage } from "./pages/LibraryPage";
import { LoginPage, SignUpPage } from "./pages/LoginPage";
import { MediaPlayerPage } from "./pages/MediaPlayerPage";
import { PlanPage } from "./pages/PlanPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TagsPage } from "./pages/TagsPage";

function Guard() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <AppDataProvider>
      <Outlet />
    </AppDataProvider>
  );
}

export default function App() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/home" replace /> : <LoginPage />} />
      <Route path="/signup" element={token ? <Navigate to="/home" replace /> : <SignUpPage />} />
      <Route element={<Guard />}>
        <Route path="/onboarding/plan" element={<PlanPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<LibraryPage mode="all" />} />
          <Route path="/home/projects" element={<ProjectsPage />} />
          <Route path="/home/project/:projectId" element={<LibraryPage mode="project" />} />
          <Route path="/home/folder/:folderId" element={<LibraryPage mode="folder" />} />
          <Route path="/home/media/:id" element={<MediaPlayerPage />} />
          <Route path="/home/tags" element={<TagsPage />} />
          <Route path="/home/activity" element={<ActivityPage />} />
          <Route path="/home/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
