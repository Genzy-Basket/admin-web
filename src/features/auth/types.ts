export type AdminRole = "root" | "admin" | "subAdmin";

export type AdminPermission =
  | "kycReview"
  | "partnerManage"
  | "jobAssign"
  | "jobManage"
  | "adminManage"
  | "appRelease"
  | "notificationSend"
  | "legalManage"
  | "logView";

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminRoleOption {
  value: Exclude<AdminRole, "root">;
  label: string;
  description: string;
  defaultPermissions: AdminPermission[];
}

export interface AdminPermissionOption {
  value: AdminPermission;
  label: string;
}

export interface AdminManageOptions {
  roles: AdminRoleOption[];
  permissions: AdminPermissionOption[];
}

const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  root: "Root Admin",
  admin: "Admin",
  subAdmin: "Sub Admin",
};

export const adminRoleLabel = (role: AdminRole) =>
  ADMIN_ROLE_LABELS[role] ?? role;

export const isRootAdmin = (admin: Admin | null) => admin?.role === "root";

export const canManageAdmins = (admin: Admin | null) =>
  admin?.permissions?.includes("adminManage") ?? false;

export const canPublishReleases = (admin: Admin | null) =>
  admin?.permissions?.includes("appRelease") ?? false;

export interface AdminSession extends Admin {
  token: string;
}

export const canViewLogs = (admin: Admin | null) =>
  admin?.permissions?.includes("logView") ?? false;

export const canManageLegal = (admin: Admin | null) =>
  admin?.permissions?.includes("legalManage") ?? false;
