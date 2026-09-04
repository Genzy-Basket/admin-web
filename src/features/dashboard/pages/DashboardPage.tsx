import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/shared/api";
import type { KycStats } from "@/features/kyc/types";
import { useAuth } from "@/features/auth";

export default function DashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState<KycStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<KycStats>("/admin/kyc/stats")
      .then(setStats)
      .catch(() => setError("Could not load dashboard stats."));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {admin?.name?.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Overview of partner verification activity.
      </p>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/partners" className="rounded-xl transition hover:opacity-80">
          <StatCard
            label="Total Partners"
            value={stats?.totalPartners}
            tone="slate"
          />
        </Link>
        <StatCard label="Pending Review" value={stats?.pending} tone="amber" />
        <StatCard label="Approved" value={stats?.approved} tone="emerald" />
        <StatCard label="Rejected" value={stats?.rejected} tone="red" />
      </div>

      {!!stats?.pending && (
        <Link
          to="/kyc"
          className="mt-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 transition hover:bg-amber-100"
        >
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {stats.pending} document{stats.pending === 1 ? "" : "s"} awaiting
              review
            </p>
            <p className="text-sm text-amber-700">
              Partners cannot start working until their KYC is verified.
            </p>
          </div>
          <span className="text-sm font-semibold text-amber-900">Review →</span>
        </Link>
      )}
    </div>
  );
}

const TONES = {
  slate: "text-slate-900",
  amber: "text-amber-600",
  emerald: "text-emerald-600",
  red: "text-red-600",
} as const;

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${TONES[tone]}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}
