export type KycStatus = "pending" | "approved" | "rejected";

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

export interface KycPartner {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  status: string;
}

export interface KycDocument {
  id: string;
  type: string;
  documentNumber: string;
  fileUrls: string[];
  status: KycStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  partner: KycPartner | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KycListResponse {
  items: KycDocument[];
  pagination: Pagination;
}

export interface KycStats {
  totalPartners: number;
  pending: number;
  approved: number;
  rejected: number;
  totalDocuments: number;
}

export type PartnerStatus =
  | "draft"
  | "pendingReview"
  | "active"
  | "suspended"
  | "rejected"
  | "inactive";

export interface PartnerRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  status: PartnerStatus;
  isVerified: boolean;
  city: string | null;
  area: string | null;
  serviceCategories: string[];
  kyc: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  hasBankDetails: boolean;
  rating: { average: number; count: number; totalBookings: number };
  createdAt: string;
}

export interface PartnerListResponse {
  items: PartnerRow[];
  pagination: Pagination;
}

export interface PartnerBankDetail {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId: string | null;
  isVerified: boolean;
}

export interface PartnerServiceLocation {
  id: string;
  houseOrFlat: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
}

export interface PartnerWorkProfile {
  id: string;
  serviceCategory: string;
  experienceYears: number;
  isPrimary: boolean;
  scheduleType?: string;
  dietaryPreference?: string | null;
  cuisines?: string[];
  specialties?: string[];
  signatureDishes?: string[];
  maidTasks?: string[];
  canCookForEvents?: boolean;
  maxGuestsCount?: number | null;
  petFriendly?: boolean;
}

export interface PartnerKycDocument {
  id: string;
  type: string;
  documentNumber: string;
  fileUrls: string[];
  status: KycStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface PartnerDetail {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  bio: string | null;
  languages: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  status: PartnerStatus;
  statusReason: string | null;
  isVerified: boolean;
  rating: {
    average: number;
    count: number;
    totalBookings: number;
    cancellationRate: number;
  };
  bankDetail?: PartnerBankDetail;
  serviceLocation?: PartnerServiceLocation;
  workProfiles?: PartnerWorkProfile[];
  kycDocuments?: PartnerKycDocument[];
  createdAt: string;
}

const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  draft: "Draft",
  pendingReview: "Pending Review",
  active: "Active",
  suspended: "Suspended",
  rejected: "Rejected",
  inactive: "Inactive",
};

export const partnerStatusLabel = (status: PartnerStatus) =>
  PARTNER_STATUS_LABELS[status] ?? status;

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  chef: "Chef",
  homecook: "Home Cook",
  housemaid: "House Maid",
};

export const serviceCategoryLabel = (category: string) =>
  SERVICE_CATEGORY_LABELS[category] ?? category;

const DOC_TYPE_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN",
  drivingLicense: "Driving License",
  passport: "Passport",
  voterId: "Voter ID",
  sslcMarksheet: "SSLC Marksheet",
  fssaiCertificate: "FSSAI Certificate",
  policeVerification: "Police Verification",
};

export const docTypeLabel = (type: string) => DOC_TYPE_LABELS[type] ?? type;

export type AppKind = "partner" | "user";
export type AppPlatform = "android" | "ios";

export interface AppRelease {
  id: string;
  app: AppKind;
  platform: AppPlatform;
  versionCode: number;
  versionName: string;
  fileSizeBytes: number;
  sha256: string;
  releaseNotes: string | null;
  minSupported: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};

export interface ErrorLog {
  id: string;
  statusCode: number;
  code: string;
  message: string;
  stack: string | null;
  method: string;
  url: string;
  actor: string | null;
  ip: string | null;
  requestId: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ErrorLogPage {
  items: ErrorLog[];
  pagination: Pagination;
}

export interface LegalDocSummary {
  id: string;
  slug: string;
  title: string;
  lastUpdated: string;
  characters: number;
}

export interface LegalDoc {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export const canViewLogs = (admin: Admin | null) =>
  admin?.permissions?.includes("logView") ?? false;

export const canManageLegal = (admin: Admin | null) =>
  admin?.permissions?.includes("legalManage") ?? false;
