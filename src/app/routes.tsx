import { Navigate, Route, Routes } from "react-router-dom";
import {
  canManageAdmins,
  canManageLegal,
  canPublishReleases,
  canViewLogs,
  canViewOtps,
  LoginPage,
  useAuth,
} from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";
import { KycPage } from "@/features/kyc";
import { PartnerDetailPage, PartnersPage } from "@/features/partners";
import { ReleasesPage } from "@/features/releases";
import { AdminsPage } from "@/features/admins";
import { LogsPage } from "@/features/logs";
import { OtpsPage } from "@/features/otps";
import { LegalPage } from "@/features/legal";
import AppLayout from "./AppLayout";

export default function AppRoutes() {
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
        {canViewOtps(admin) && <Route path="otps" element={<OtpsPage />} />}
        {canViewLogs(admin) && <Route path="logs" element={<LogsPage />} />}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
