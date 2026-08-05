import { useState, type ReactElement } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import ConfirmDialog from "./ConfirmDialog";
import type { AdminPermission } from "../types";

const NAV_ITEMS: {
  to: string;
  label: string;
  icon: () => ReactElement;
  end: boolean;
  permission?: AdminPermission;
}[] = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  {
    to: "/partners",
    label: "Partners",
    icon: UsersIcon,
    end: false,
    permission: "partnerManage",
  },
  {
    to: "/kyc",
    label: "Pending KYC",
    icon: ShieldIcon,
    end: false,
    permission: "kycReview",
  },
  {
    to: "/releases",
    label: "App Releases",
    icon: DownloadIcon,
    end: false,
    permission: "appRelease",
  },
  {
    to: "/legal",
    label: "Legal Pages",
    icon: DocumentIcon,
    end: false,
    permission: "legalManage",
  },
  {
    to: "/admins",
    label: "Manage Admins",
    icon: KeyIcon,
    end: false,
    permission: "adminManage",
  },
  {
    to: "/logs",
    label: "Server Errors",
    icon: AlertIcon,
    end: false,
    permission: "logView",
  },
];

export default function AppLayout() {
  const { admin, logout } = useAuth();
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);

  const navItems = NAV_ITEMS.filter(
    (item) => !item.permission || admin?.permissions?.includes(item.permission),
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white sm:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            G
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Genzy Basket</p>
            <p className="text-xs text-slate-500">Admin Console</p>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium text-slate-900">
              {admin?.name}
            </p>
            <p className="truncate text-xs text-slate-500">{admin?.email}</p>
          </div>
          <button
            onClick={() => setIsConfirmingSignOut(true)}
            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
          <span className="text-sm font-bold">Genzy Admin</span>
          <button
            onClick={() => setIsConfirmingSignOut(true)}
            className="text-sm font-medium text-red-600"
          >
            Sign out
          </button>
        </header>

        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 sm:hidden">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      {isConfirmingSignOut && (
        <ConfirmDialog
          title="Sign out?"
          message="You will need your password and a fresh verification code to sign back in."
          confirmLabel="Sign out"
          onCancel={() => setIsConfirmingSignOut(false)}
          onConfirm={logout}
        />
      )}
    </div>
  );
}

function HomeIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5 12 3l9 7.5M5.25 9.75V20a1 1 0 0 0 1 1h11.5a1 1 0 0 0 1-1V9.75"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.5v-1.5a3.75 3.75 0 0 0-3.75-3.75h-4.5A3.75 3.75 0 0 0 3 18v1.5M12 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm9 12v-1.5a3.75 3.75 0 0 0-2.813-3.629M16.5 7.65a3 3 0 0 1 0 5.7"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7.5 3v5.25c0 4.5-3 8.4-7.5 9.75-4.5-1.35-7.5-5.25-7.5-9.75V6L12 3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.75 12 1.5 1.5 3-3.75"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912l-1.66 1.66a2.25 2.25 0 0 1-1.591.659h-1.22v1.22a2.25 2.25 0 0 1-.659 1.59l-.621.622a2.25 2.25 0 0 1-1.591.659H3.75a1.5 1.5 0 0 1-1.5-1.5v-1.629c0-.597.237-1.169.659-1.591l6.899-6.899A6 6 0 1 1 21.75 8.25Z"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.75v10.5m0 0 3.75-3.75M12 14.25 8.25 10.5M3.75 16.5v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5"
      />
    </svg>
  );
}
