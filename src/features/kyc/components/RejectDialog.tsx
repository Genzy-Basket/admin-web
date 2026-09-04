import { useState, type FormEvent } from "react";

const MIN_REASON_LENGTH = 5;

export default function RejectDialog({
  documentLabel,
  partnerName,
  isBusy,
  onCancel,
  onConfirm,
}: {
  documentLabel: string;
  partnerName: string;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const isValid = reason.trim().length >= MIN_REASON_LENGTH;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isValid) onConfirm(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-title"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="reject-title" className="text-lg font-bold text-slate-900">
          Reject {documentLabel}?
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {partnerName} will see this reason in the app and can re-upload the
          document.
        </p>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Reason for rejection
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            autoFocus
            placeholder="e.g. Document image is blurred. Please re-upload a clear photo."
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <p className="mt-1 text-xs text-slate-400">
          {reason.trim().length < MIN_REASON_LENGTH
            ? `At least ${MIN_REASON_LENGTH} characters.`
            : `${reason.length}/500`}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isBusy}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? "Rejecting…" : "Reject document"}
          </button>
        </div>
      </form>
    </div>
  );
}
