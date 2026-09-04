import type { Pagination } from "@/shared/types";
import type { KycStatus } from "@/features/kyc/types";

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
