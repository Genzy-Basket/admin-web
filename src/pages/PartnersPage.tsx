import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import {
  partnerStatusLabel,
  serviceCategoryLabel,
  type PartnerListResponse,
  type PartnerRow,
  type PartnerStatus,
} from "../types";

const FILTERS: { value: PartnerStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "pendingReview", label: "Pending Review" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
];

export default function PartnersPage() {
  const [status, setStatus] = useState<PartnerStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PartnerListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce so a search does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status !== "all") params.set("status", status);
    if (query) params.set("search", query);

    try {
      setData(
        await api.get<PartnerListResponse>(`/admin/partners?${params}`),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load partners.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [status, query, page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Partners</h1>
      <p className="mt-1 text-sm text-slate-500">
        Everyone registered on the platform and how far they are through
        onboarding.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone or email"
          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-72"
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                status === filter.value
                  ? "bg-brand-500 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <Placeholder text="Loading partners…" />
        ) : !data?.items.length ? (
          <Placeholder
            text={query ? `No partners match "${query}".` : "No partners yet."}
          />
        ) : (
          data.items.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
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
            Page {data.pagination.page} of {data.pagination.totalPages} ·{" "}
            {data.pagination.total} total
          </span>
          <PagerButton
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </PagerButton>
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<PartnerStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  pendingReview: "bg-amber-50 text-amber-700 ring-amber-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  suspended: "bg-orange-50 text-orange-700 ring-orange-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  inactive: "bg-slate-100 text-slate-500 ring-slate-200",
};

function PartnerCard({ partner }: { partner: PartnerRow }) {
  const initials = partner.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      to={`/partners/${partner.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        {partner.avatarUrl ? (
          <img
            src={partner.avatarUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
            {initials || "?"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-slate-900">
              {partner.name || "Unnamed partner"}
            </h2>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[partner.status]}`}
            >
              {partnerStatusLabel(partner.status)}
            </span>
            {partner.isVerified && (
              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                Verified
              </span>
            )}
          </div>

          <p className="mt-0.5 text-sm text-slate-500">
            {partner.phone}
            {partner.email ? ` · ${partner.email}` : ""}
            {partner.city ? ` · ${partner.area ?? ""} ${partner.city}` : ""}
          </p>

          {partner.serviceCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {partner.serviceCategories.map((category) => (
                <span
                  key={category}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                >
                  {serviceCategoryLabel(category)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              KYC:{" "}
              {partner.kyc.total === 0 ? (
                <span className="text-slate-400">none</span>
              ) : (
                <>
                  {partner.kyc.approved > 0 && (
                    <span className="text-emerald-600">
                      {partner.kyc.approved} approved
                    </span>
                  )}
                  {partner.kyc.pending > 0 && (
                    <span className="text-amber-600">
                      {partner.kyc.approved > 0 ? ", " : ""}
                      {partner.kyc.pending} pending
                    </span>
                  )}
                  {partner.kyc.rejected > 0 && (
                    <span className="text-red-600">
                      {partner.kyc.approved > 0 || partner.kyc.pending > 0
                        ? ", "
                        : ""}
                      {partner.kyc.rejected} rejected
                    </span>
                  )}
                </>
              )}
            </span>
            <span>Bank: {partner.hasBankDetails ? "added" : "—"}</span>
            <span>
              Joined {new Date(partner.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
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
