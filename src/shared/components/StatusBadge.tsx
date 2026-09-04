import type { KycStatus } from "@/features/kyc/types";

const STYLES: Record<KycStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};

export default function StatusBadge({ status }: { status: KycStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
