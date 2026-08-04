import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../lib/api";
import StatusBadge from "../components/StatusBadge";
import RejectDialog from "../components/RejectDialog";
import { docTypeLabel } from "../types";
import type { KycDocument, KycListResponse, KycStatus } from "../types";

const FILTERS: { value: KycStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function KycPage() {
  const [status, setStatus] = useState<KycStatus>("pending");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<KycListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<KycDocument | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(
        await api.get<KycListResponse>(
          `/admin/kyc?status=${status}&page=${page}&limit=20`,
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load documents.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (doc: KycDocument) => {
    setBusyId(doc.id);
    setError(null);
    try {
      await api.patch(`/admin/kyc/${doc.id}/approve`);
      setNotice(`Approved ${docTypeLabel(doc.type)} for ${doc.partner?.name}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not approve.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (reason: string) => {
    if (!rejecting) return;
    const doc = rejecting;

    setBusyId(doc.id);
    setError(null);
    try {
      await api.patch(`/admin/kyc/${doc.id}/reject`, { reason });
      setRejecting(null);
      setNotice(`Rejected ${docTypeLabel(doc.type)} for ${doc.partner?.name}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reject.");
    } finally {
      setBusyId(null);
    }
  };

  const changeFilter = (next: KycStatus) => {
    setStatus(next);
    setPage(1);
    setNotice(null);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">KYC Verification</h1>
      <p className="mt-1 text-sm text-slate-500">
        Review partner documents and approve or reject each submission.
      </p>

      <div className="mt-6 flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => changeFilter(filter.value)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              status === filter.value
                ? "bg-brand-500 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {notice && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <Placeholder text="Loading documents…" />
        ) : !data?.items.length ? (
          <Placeholder text={`No ${status} documents.`} />
        ) : (
          data.items.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isBusy={busyId === doc.id}
              onApprove={() => approve(doc)}
              onReject={() => setRejecting(doc)}
            />
          ))
        )}
      </div>

      {!!data && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <PagerButton
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </PagerButton>
          <span className="text-sm text-slate-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <PagerButton
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </PagerButton>
        </div>
      )}

      {rejecting && (
        <RejectDialog
          documentLabel={docTypeLabel(rejecting.type)}
          partnerName={rejecting.partner?.name ?? "this partner"}
          isBusy={busyId === rejecting.id}
          onCancel={() => setRejecting(null)}
          onConfirm={reject}
        />
      )}
    </div>
  );
}

function DocumentCard({
  document,
  isBusy,
  onApprove,
  onReject,
}: {
  document: KycDocument;
  isBusy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900">
              {document.partner?.name ?? "Unknown partner"}
            </h2>
            <StatusBadge status={document.status} />
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {document.partner?.phone}
            {document.partner?.email ? ` · ${document.partner.email}` : ""}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Submitted {new Date(document.createdAt).toLocaleDateString()}
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-slate-500">Document type</dt>
          <dd className="text-sm text-slate-900">
            {docTypeLabel(document.type)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Number</dt>
          <dd className="font-mono text-sm text-slate-900">
            {document.documentNumber}
          </dd>
        </div>
      </dl>

      {document.fileUrls.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-slate-500">
            Attachments
          </p>
          <div className="flex flex-wrap gap-2">
            {document.fileUrls.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                View file {index + 1} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {document.status === "rejected" && document.rejectionReason && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <span className="font-medium">Reason:</span>{" "}
          {document.rejectionReason}
        </div>
      )}

      {document.status !== "approved" && (
        <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onApprove}
            disabled={isBusy}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isBusy ? "Working…" : "Approve"}
          </button>
          {document.status !== "rejected" && (
            <button
              onClick={onReject}
              disabled={isBusy}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-60"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function PagerButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
