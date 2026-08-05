import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "../lib/api";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatBytes } from "../types";
import type { AppRelease } from "../types";

export default function ReleasesPage() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AppRelease | null>(null);
  const [forcing, setForcing] = useState<AppRelease | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setReleases(await api.get<AppRelease[]>("/admin/app-releases"));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load releases.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async (release: AppRelease) => {
    setBusyId(release.id);
    setError(null);
    try {
      await api.patch(`/admin/app-releases/${release.id}`, {
        isActive: !release.isActive,
      });
      setNotice(
        release.isActive
          ? `${release.versionName} is no longer offered to partners.`
          : `${release.versionName} is live for partners.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  };

  const forceUpdate = async () => {
    if (!forcing) return;
    const release = forcing;

    setBusyId(release.id);
    setError(null);
    try {
      await api.patch(`/admin/app-releases/${release.id}`, {
        minSupported: release.versionCode,
      });
      setForcing(null);
      setNotice(
        `Everyone below ${release.versionName} must now update before using the app.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  };

  const clearForce = async (release: AppRelease) => {
    setBusyId(release.id);
    setError(null);
    try {
      await api.patch(`/admin/app-releases/${release.id}`, { minSupported: 0 });
      setNotice(`${release.versionName} is now an optional update.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const release = deleting;

    setBusyId(release.id);
    setError(null);
    try {
      await api.delete(`/admin/app-releases/${release.id}`);
      setDeleting(null);
      setNotice(`Deleted ${release.versionName}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">App Releases</h1>
      <p className="mt-1 text-sm text-slate-500">
        Publish a build and partners are offered the update inside the app.
      </p>

      <UploadCard
        onPublished={(message) => {
          setNotice(message);
          void load();
        }}
        onError={setError}
      />

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

      <h2 className="mt-8 text-sm font-semibold text-slate-900">
        Published builds
      </h2>

      <div className="mt-3 space-y-3">
        {isLoading ? (
          <Placeholder text="Loading releases…" />
        ) : !releases.length ? (
          <Placeholder text="No releases published yet." />
        ) : (
          releases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              isBusy={busyId === release.id}
              onToggleActive={() => toggleActive(release)}
              onForce={() => setForcing(release)}
              onClearForce={() => clearForce(release)}
              onDelete={() => setDeleting(release)}
            />
          ))
        )}
      </div>

      {forcing && (
        <ConfirmDialog
          title={`Force everyone onto ${forcing.versionName}?`}
          message="Partners on older builds will be blocked from using the app until they update. Use this when an old version no longer works with the server."
          confirmLabel="Force update"
          tone="primary"
          onCancel={() => setForcing(null)}
          onConfirm={forceUpdate}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.versionName}?`}
          message="The APK file is removed from the server permanently. Partners who already installed it keep it, but nobody can download it again."
          confirmLabel="Delete"
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}

function UploadCard({
  onPublished,
  onError,
}: {
  onPublished: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [versionCode, setVersionCode] = useState("");
  const [versionName, setVersionName] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const isUploading = progress !== null;

  const reset = () => {
    setFile(null);
    setVersionCode("");
    setVersionName("");
    setReleaseNotes("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    onError(null);

    if (!file) {
      onError("Choose an APK file to upload.");
      return;
    }

    const form = new FormData();
    form.append("app", "partner");
    form.append("platform", "android");
    form.append("versionCode", versionCode.trim());
    form.append("versionName", versionName.trim());
    if (releaseNotes.trim()) form.append("releaseNotes", releaseNotes.trim());
    // The file part must come last — the server reads the text fields before
    // it starts streaming the binary.
    form.append("file", file);

    setProgress(0);
    try {
      await api.upload<AppRelease>("/admin/app-releases", form, setProgress);
      onPublished(`Published ${versionName.trim()} to partners.`);
      reset();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-sm font-semibold text-slate-900">
        Publish a new build
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Version code" hint="Whole number, must increase each build">
          <input
            type="number"
            min={1}
            required
            value={versionCode}
            onChange={(e) => setVersionCode(e.target.value)}
            disabled={isUploading}
            placeholder="2"
            className={inputClass}
          />
        </Field>

        <Field label="Version name" hint="What partners see, e.g. 0.2.0">
          <input
            type="text"
            required
            maxLength={50}
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            disabled={isUploading}
            placeholder="0.2.0"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="What's new" hint="Shown in the update prompt (optional)">
          <textarea
            rows={3}
            maxLength={2000}
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            disabled={isUploading}
            placeholder="Faster bank selection and clearer work profile options."
            className={`${inputClass} resize-y`}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="APK file">
          <input
            ref={fileInput}
            type="file"
            accept=".apk,application/vnd.android.package-archive"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={isUploading}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
        </Field>
        {file && (
          <p className="mt-1.5 text-xs text-slate-500">
            {file.name} · {formatBytes(file.size)}
          </p>
        )}
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {progress < 100
              ? `Uploading… ${progress}%`
              : "Verifying on the server…"}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className="mt-5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {isUploading ? "Publishing…" : "Publish release"}
      </button>
    </form>
  );
}

function ReleaseCard({
  release,
  isBusy,
  onToggleActive,
  onForce,
  onClearForce,
  onDelete,
}: {
  release: AppRelease;
  isBusy: boolean;
  onToggleActive: () => void;
  onForce: () => void;
  onClearForce: () => void;
  onDelete: () => void;
}) {
  const isForced = release.minSupported >= release.versionCode;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">
              {release.versionName}
            </h3>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
              code {release.versionCode}
            </span>
            {release.isActive ? (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Live
              </span>
            ) : (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                Hidden
              </span>
            )}
            {isForced && (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Forced
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatBytes(release.fileSizeBytes)} · published{" "}
            {new Date(release.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {release.releaseNotes && (
        <p className="mt-3 whitespace-pre-line text-sm text-slate-600">
          {release.releaseNotes}
        </p>
      )}

      <p className="mt-3 truncate font-mono text-xs text-slate-400">
        sha256 {release.sha256}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={onToggleActive}
          disabled={isBusy}
          className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {release.isActive ? "Hide from partners" : "Make live"}
        </button>

        {isForced ? (
          <button
            onClick={onClearForce}
            disabled={isBusy}
            className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-50 disabled:opacity-60"
          >
            Make optional
          </button>
        ) : (
          <button
            onClick={onForce}
            disabled={isBusy}
            className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Force update
          </button>
        )}

        <button
          onClick={onDelete}
          disabled={isBusy}
          className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
