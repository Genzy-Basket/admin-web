import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/shared/api";
import { useAuth } from "@/features/auth";
import { ConfirmDialog } from "@/shared/components";
import { adminRoleLabel } from "@/features/auth/types";
import type { Admin, AdminManageOptions, AdminPermission, AdminRole } from "@/features/auth/types";

export default function AdminsPage() {
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [options, setOptions] = useState<AdminManageOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleting, setDeleting] = useState<Admin | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [list, opts] = await Promise.all([
        api.get<Admin[]>("/admin/admins"),
        api.get<AdminManageOptions>("/admin/admins/options"),
      ]);
      setAdmins(list);
      setOptions(opts);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load admins.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async (target: Admin) => {
    setBusyId(target.id);
    setError(null);
    try {
      await api.patch(`/admin/admins/${target.id}`, {
        isActive: !target.isActive,
      });
      setNotice(
        target.isActive
          ? `${target.name} can no longer sign in.`
          : `${target.name} can sign in again.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const target = deleting;

    setBusyId(target.id);
    setError(null);
    try {
      await api.delete(`/admin/admins/${target.id}`);
      setDeleting(null);
      setNotice(`Removed ${target.name}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Admins</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create accounts and choose exactly what each person can do.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Add admin
        </button>
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

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <Placeholder text="Loading admins…" />
        ) : !admins.length ? (
          <Placeholder text="No admins yet." />
        ) : (
          admins.map((item) => (
            <AdminCard
              key={item.id}
              admin={item}
              isSelf={item.id === currentAdmin?.id}
              isBusy={busyId === item.id}
              options={options}
              onEdit={() => setEditing(item)}
              onToggleActive={() => toggleActive(item)}
              onDelete={() => setDeleting(item)}
            />
          ))
        )}
      </div>

      {isCreating && options && (
        <AdminFormDialog
          options={options}
          onClose={() => setIsCreating(false)}
          onSaved={(message) => {
            setIsCreating(false);
            setNotice(message);
            void load();
          }}
        />
      )}

      {editing && options && (
        <AdminFormDialog
          admin={editing}
          options={options}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            setNotice(message);
            void load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={`Remove ${deleting.name}?`}
          message="They lose access immediately and this cannot be undone. To keep the account but block sign-in, deactivate it instead."
          confirmLabel="Remove"
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}

function AdminCard({
  admin,
  isSelf,
  isBusy,
  options,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  admin: Admin;
  isSelf: boolean;
  isBusy: boolean;
  options: AdminManageOptions | null;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const isRoot = admin.role === "root";
  const labelFor = (permission: AdminPermission) =>
    options?.permissions.find((p) => p.value === permission)?.label ??
    permission;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-slate-900">{admin.name}</h2>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                isRoot
                  ? "bg-brand-50 text-brand-700"
                  : admin.role === "admin"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {adminRoleLabel(admin.role)}
            </span>
            {isSelf && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                You
              </span>
            )}
            {!admin.isActive && (
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                Deactivated
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {admin.email}
            {admin.phone ? ` · ${admin.phone}` : ""}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          {admin.lastLoginAt
            ? `Last signed in ${new Date(admin.lastLoginAt).toLocaleDateString()}`
            : "Never signed in"}
        </p>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-slate-500">
          {isRoot ? "Full access" : "Can do"}
        </p>
        {isRoot ? (
          <p className="text-sm text-slate-600">
            Everything, including app releases and managing admins.
          </p>
        ) : admin.permissions.length ? (
          <div className="flex flex-wrap gap-1.5">
            {admin.permissions.map((permission) => (
              <span
                key={permission}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
              >
                {labelFor(permission)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Nothing yet — sign-in works, but every screen is blocked.
          </p>
        )}
      </div>

      {!isRoot && !isSelf && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onEdit}
            disabled={isBusy}
            className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Edit access
          </button>
          <button
            onClick={onToggleActive}
            disabled={isBusy}
            className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {admin.isActive ? "Deactivate" : "Reactivate"}
          </button>
          <button
            onClick={onDelete}
            disabled={isBusy}
            className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function AdminFormDialog({
  admin,
  options,
  onClose,
  onSaved,
}: {
  admin?: Admin;
  options: AdminManageOptions;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const isEdit = !!admin;

  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [phone, setPhone] = useState(admin?.phone ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<AdminRole, "root">>(
    (admin?.role as Exclude<AdminRole, "root">) ?? "subAdmin",
  );
  const [permissions, setPermissions] = useState<AdminPermission[]>(() => {
    // Editing shows what they actually have; creating starts from the role's
    // usual set so the common case is one click rather than six.
    if (admin) {
      return admin.permissions.filter((p) =>
        options.permissions.some((o) => o.value === p),
      );
    }

    return [
      ...(options.roles.find((r) => r.value === "subAdmin")
        ?.defaultPermissions ?? []),
    ];
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOption = options.roles.find((r) => r.value === role);

  const toggle = (permission: AdminPermission) => {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission],
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (isEdit) {
        await api.patch(`/admin/admins/${admin.id}`, {
          name: name.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          role,
          permissions,
          ...(password ? { password } : {}),
        });
        onSaved(`Updated ${name.trim()}.`);
      } else {
        await api.post("/admin/admins", {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          password,
          role,
          permissions,
        });
        onSaved(`Added ${name.trim()}.`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-slate-900">
          {isEdit ? `Edit ${admin.name}` : "Add an admin"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isEdit
            ? "Change what this person can reach. Takes effect immediately, even if they are signed in."
            : "They sign in with this email and password, plus an emailed code."}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </Field>

          <Field label="Phone" hint="Optional">
            <input
              type="tel"
              pattern="[6-9][0-9]{9}"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSaving}
              placeholder="9876543210"
              className={inputClass}
            />
          </Field>
        </div>

        {!isEdit && (
          <div className="mt-4">
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSaving}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        <div className="mt-4">
          <Field
            label={isEdit ? "New password" : "Password"}
            hint={
              isEdit
                ? "Leave blank to keep the current one"
                : "At least 8 characters"
            }
          >
            <input
              type="password"
              required={!isEdit}
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-slate-700">Role</p>
          <div className="space-y-2">
            {options.roles.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                  role === option.value
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  className="mt-0.5"
                  checked={role === option.value}
                  onChange={() => {
                    setRole(option.value);
                    // A starting point, not a floor - every box stays editable.
                    setPermissions([...option.defaultPermissions]);
                  }}
                  disabled={isSaving}
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    {option.label}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs font-medium text-slate-700">Permissions</p>
            {!!roleOption?.defaultPermissions.length && (
              <button
                type="button"
                onClick={() =>
                  setPermissions([...roleOption.defaultPermissions])
                }
                disabled={isSaving}
                className="text-xs font-medium text-brand-700 hover:underline disabled:opacity-50"
              >
                Reset to {roleOption.label} defaults
              </button>
            )}
          </div>
          <p className="mb-2 text-xs text-slate-400">
            They can reach exactly what is ticked here, nothing more. Changes
            apply immediately, even to someone already signed in.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {options.permissions.map((permission) => (
              <label
                key={permission.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(permission.value)}
                  disabled={isSaving}
                  onChange={() => toggle(permission.value)}
                />
                {permission.label}
              </label>
            ))}
          </div>

          {!permissions.length && (
            <p className="mt-2 text-xs text-amber-700">
              With nothing ticked they can sign in, but every screen is blocked.
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Add admin"}
          </button>
        </div>
      </form>
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
      {hint && (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      )}
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
