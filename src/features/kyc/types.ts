import type { Pagination } from "@/shared/types";

export type KycStatus = "pending" | "approved" | "rejected";

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
