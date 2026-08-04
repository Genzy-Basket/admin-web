import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/kyc", label: "Pending KYC", icon: ShieldIcon, end: false },
];

export default function AppLayout() {
  const { admin, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
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

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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
            onClick={logout}
            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
          <span className="text-sm font-bold">Genzy Admin</span>
          <button
            onClick={logout}
            className="text-sm font-medium text-red-600"
          >
            Sign out
          </button>
        </header>

        <nav className="flex gap-1 border-b border-slate-200 bg-white px-3 py-2 sm:hidden">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
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
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 12 1.5 1.5 3-3.75" />
    </svg>
  );
}
