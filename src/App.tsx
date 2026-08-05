import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import KycPage from "./pages/KycPage";
import LoginPage from "./pages/LoginPage";
import PartnerDetailPage from "./pages/PartnerDetailPage";
import PartnersPage from "./pages/PartnersPage";
import ReleasesPage from "./pages/ReleasesPage";
import AdminsPage from "./pages/AdminsPage";
import LogsPage from "./pages/LogsPage";
import LegalPage from "./pages/LegalPage";
import {
  canManageAdmins,
  canManageLegal,
  canPublishReleases,
  canViewLogs,
} from "./types";

export default function App() {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!admin) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="partners/:id" element={<PartnerDetailPage />} />
        <Route path="kyc" element={<KycPage />} />
        {/* Hiding the nav link is not enough — the URL is still typeable. */}
        {canPublishReleases(admin) && (
          <Route path="releases" element={<ReleasesPage />} />
        )}
        {canManageAdmins(admin) && (
          <Route path="admins" element={<AdminsPage />} />
        )}
        {canManageLegal(admin) && (
          <Route path="legal" element={<LegalPage />} />
        )}
        {canViewLogs(admin) && <Route path="logs" element={<LogsPage />} />}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
