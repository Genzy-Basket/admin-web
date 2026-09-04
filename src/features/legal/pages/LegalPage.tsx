import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/shared/api";
import type { LegalDoc, LegalDocSummary } from "@/features/legal/types";

export default function LegalPage() {
  const [docs, setDocs] = useState<LegalDocSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.get<LegalDocSummary[]>("/admin/legal");
      setDocs(list);
      setSelected((current) => current ?? list[0]?.slug ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load documents.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Legal Pages</h1>
      <p className="mt-1 text-sm text-slate-500">
        These are what partners and customers see in the app. Edits go live
        immediately.
      </p>

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

      {isLoading ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
          Loading documents…
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {docs.map((doc) => (
              <button
                key={doc.slug}
                onClick={() => {
                  setSelected(doc.slug);
                  setNotice(null);
                }}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  selected === doc.slug
                    ? "bg-brand-500 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {doc.title}
              </button>
            ))}
          </div>

          {selected && (
            <LegalEditor
              key={selected}
              slug={selected}
              onSaved={(message) => {
                setNotice(message);
                void load();
              }}
              onError={setError}
            />
          )}
        </>
      )}
    </div>
  );
}

function LegalEditor({
  slug,
  onSaved,
  onError,
}: {
  slug: string;
  onSaved: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const [doc, setDoc] = useState<LegalDoc | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    api
      .get<LegalDoc>(`/admin/legal/${slug}`)
      .then((fetched) => {
        if (!active) return;
        setDoc(fetched);
        setTitle(fetched.title);
        setContent(fetched.content);
      })
      .catch((err) =>
        onError(
          err instanceof ApiError ? err.message : "Could not load document.",
        ),
      )
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [slug, onError]);

  const isDirty = !!doc && (title !== doc.title || content !== doc.content);

  const save = async () => {
    onError(null);
    setIsSaving(true);
    try {
      const updated = await api.patch<LegalDoc>(`/admin/legal/${slug}`, {
        title: title.trim(),
        content,
      });
      setDoc(updated);
      onSaved(`Saved ${updated.title}.`);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = async () => {
    if (preview !== null) {
      setPreview(null);
      return;
    }

    setIsPreviewing(true);
    try {
      const result = await api.post<{ html: string }>("/admin/legal/preview", {
        content,
      });
      setPreview(result.html);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Could not preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-slate-700">
          Title
        </span>
        <input
          type="text"
          value={title}
          maxLength={255}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
          className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
        />
      </label>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            Content (Markdown)
          </span>
          <span className="text-xs text-slate-400">
            {content.length} characters
          </span>
        </div>
        <textarea
          value={content}
          rows={22}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSaving}
          spellCheck={false}
          className="block w-full resize-y rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs leading-relaxed text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
        />
      </div>

      {preview !== null && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-slate-700">Preview</p>
          <div
            className="prose-legal max-h-96 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={save}
          disabled={isSaving || !isDirty}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>

        <button
          onClick={renderPreview}
          disabled={isPreviewing || isSaving}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {isPreviewing
            ? "Rendering…"
            : preview !== null
              ? "Hide preview"
              : "Preview"}
        </button>

        {doc && (
          <button
            onClick={() => {
              setTitle(doc.title);
              setContent(doc.content);
              setPreview(null);
            }}
            disabled={isSaving || !isDirty}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
          >
            Discard
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400">
          {isDirty
            ? "Unsaved changes"
            : doc
              ? `Last updated ${new Date(doc.lastUpdated).toLocaleDateString()}`
              : ""}
        </span>
      </div>
    </div>
  );
}
