import type { Pagination } from "@/shared/types";

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

export interface ErrorLogPage {
  items: ErrorLog[];
  pagination: Pagination;
}
