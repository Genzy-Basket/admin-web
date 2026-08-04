export type KycStatus = "pending" | "approved" | "rejected";

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

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
