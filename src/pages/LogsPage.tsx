import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../lib/api";
import ConfirmDialog from "../components/ConfirmDialog";
import type { ErrorLog, ErrorLogPage } from "../types";

const FILTERS: { value: number | null; label: string }[] = [
  { value: null, label: "All" },
  { value: 500, label: "500" },
  { value: 502, label: "502" },
  { value: 503, label: "503" },
];

export default function LogsPage() {
  const [data, setData] = useState<ErrorLogPage | null>(null);
  const [page, setPage] = useState(1);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusCode) query.set("statusCode", String(statusCode));

      setData(await api.get<ErrorLogPage>(`/admin/logs?${query}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load logs.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const purge = async () => {
    setError(null);
    try {
      await api.delete("/admin/logs");
      setIsPurging(false);
      setPage(1);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not clear logs.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Server Errors</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every server-side failure, newest first. Repeats within a minute are
            recorded once.
          </p>
        </div>
        {!!data?.items.length && (
          <button
            onClick={() => setIsPurging(true)}
            className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => {
              setStatusCode(filter.value);
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              statusCode === filter.value
                ? "bg-brand-500 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <Placeholder text="Loading errors…" />
        ) : !data?.items.length ? (
          <Placeholder text="Nothing has failed. That is the good outcome." />
        ) : (
          data.items.map((log) => (
            <LogCard
              key={log.id}
              log={log}
              isExpanded={expanded === log.id}
              onToggle={() =>
                setExpanded((current) => (current === log.id ? null : log.id))
              }
            />
          ))
        )}
      </div>

      {!!data && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <PagerButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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

      {isPurging && (
        <ConfirmDialog
          title="Clear every recorded error?"
          message="The list is emptied permanently. Errors recorded after this point still appear."
          confirmLabel="Clear all"
          onCancel={() => setIsPurging(false)}
          onConfirm={purge}
        />
      )}
    </div>
  );
}

function LogCard({
  log,
  isExpanded,
  onToggle,
}: {
  log: ErrorLog;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-red-50 px-2 py-0.5 font-mono text-xs font-medium text-red-700">
              {log.statusCode}
            </span>
            <span className="font-mono text-xs text-slate-500">{log.code}</span>
          </div>
          <p className="mt-1.5 font-medium text-slate-900">{log.message}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {log.method} {log.url}
          </p>
        </div>
        <p className="whitespace-nowrap text-xs text-slate-400">
          {new Date(log.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {log.actor && <span>actor: {log.actor}</span>}
        {log.ip && <span>ip: {log.ip}</span>}
        {log.requestId && <span>request: {log.requestId}</span>}
      </div>

      {log.stack && (
        <>
          <button
            onClick={onToggle}
            className="mt-3 text-xs font-medium text-brand-700 hover:underline"
          >
            {isExpanded ? "Hide stack trace" : "Show stack trace"}
          </button>
          {isExpanded && (
            <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
              {log.stack}
            </pre>
          )}
        </>
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
