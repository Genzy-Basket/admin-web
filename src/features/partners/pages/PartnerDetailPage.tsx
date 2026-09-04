import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "@/shared/api";
import { StatusBadge } from "@/shared/components";
import { docTypeLabel } from "@/shared/utils/docTypeLabel";
import {
  partnerStatusLabel,
  serviceCategoryLabel,
  type PartnerDetail,
  type PartnerStatus,
} from "../types";

const STATUS_STYLES: Record<PartnerStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  pendingReview: "bg-amber-50 text-amber-700 ring-amber-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  suspended: "bg-orange-50 text-orange-700 ring-orange-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  inactive: "bg-slate-100 text-slate-500 ring-slate-200",
};

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    api
      .get<PartnerDetail>(`/admin/partners/${id}`)
      .then(setPartner)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Could not load partner.",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading partner…</p>;
  }

  if (error || !partner) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink />
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Partner not found."}
        </div>
      </div>
    );
  }

  const name = [partner.firstName, partner.lastName].filter(Boolean).join(" ");
  const location = partner.serviceLocation;

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink />

      <div className="mt-4 flex items-start gap-4">
        {partner.avatarUrl ? (
          <img
            src={partner.avatarUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700">
            {name.slice(0, 1).toUpperCase() || "?"}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
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
          <p className="mt-1 text-sm text-slate-500">
            {partner.phone}
            {partner.email ? ` · ${partner.email}` : ""}
          </p>
          {partner.bio && (
            <p className="mt-2 text-sm text-slate-600">{partner.bio}</p>
          )}
        </div>
      </div>

      {partner.statusReason && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-medium">Status reason:</span>{" "}
          {partner.statusReason}
        </div>
      )}

      <Section title="Profile">
        <Field label="Gender" value={partner.gender} />
        <Field label="Date of birth" value={formatDate(partner.dateOfBirth)} />
        <Field
          label="Languages"
          value={partner.languages?.join(", ") || null}
        />
        <Field
          label="Emergency contact"
          value={
            partner.emergencyContactName
              ? `${partner.emergencyContactName} · ${partner.emergencyContactPhone ?? ""}`
              : null
          }
        />
        <Field label="Joined" value={formatDate(partner.createdAt)} />
      </Section>

      <Section title="Service location">
        {location ? (
          <>
            <Field
              label="Address"
              value={`${location.houseOrFlat}, ${location.street}`}
            />
            <Field
              label="Area"
              value={`${location.area}, ${location.city} ${location.pincode}`}
            />
            <Field
              label="Service radius"
              value={`${location.serviceRadiusKm} km`}
            />
            <Field
              label="Coordinates"
              value={`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
            />
          </>
        ) : (
          <Empty text="No service location added yet." />
        )}
      </Section>

      <Section title="Bank details">
        {partner.bankDetail ? (
          <>
            <Field
              label="Account holder"
              value={partner.bankDetail.accountHolderName}
            />
            <Field
              label="Account number"
              value={partner.bankDetail.accountNumber}
            />
            <Field label="IFSC" value={partner.bankDetail.ifscCode} />
            <Field label="Bank" value={partner.bankDetail.bankName} />
            <Field label="UPI" value={partner.bankDetail.upiId} />
            <Field
              label="Verified"
              value={partner.bankDetail.isVerified ? "Yes" : "No"}
            />
          </>
        ) : (
          <Empty text="No bank details added yet." />
        )}
      </Section>

      <Section title="Work profiles">
        {partner.workProfiles?.length ? (
          <div className="col-span-full space-y-3">
            {partner.workProfiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">
                    {serviceCategoryLabel(profile.serviceCategory)}
                  </span>
                  {profile.isPrimary && (
                    <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">
                      Primary
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {profile.experienceYears} yrs experience
                  {profile.scheduleType ? ` · ${profile.scheduleType}` : ""}
                  {profile.dietaryPreference
                    ? ` · ${profile.dietaryPreference}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No work profiles added yet." />
        )}
      </Section>

      <Section title="KYC documents">
        {partner.kycDocuments?.length ? (
          <div className="col-span-full space-y-3">
            {partner.kycDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">
                    {docTypeLabel(doc.type)}
                  </span>
                  <StatusBadge status={doc.status} />
                </div>
                <p className="mt-1 font-mono text-sm text-slate-500">
                  {doc.documentNumber}
                </p>
                {doc.fileUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {doc.fileUrls.map((url, index) => (
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
                )}
                {doc.rejectionReason && (
                  <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {doc.rejectionReason}
                  </p>
                )}
              </div>
            ))}
            <Link
              to="/kyc"
              className="inline-block text-sm font-semibold text-brand-700 hover:underline"
            >
              Review in KYC queue →
            </Link>
          </div>
        ) : (
          <Empty text="No documents submitted yet." />
        )}
      </Section>

      <Section title="Performance">
        <Field
          label="Rating"
          value={
            partner.rating.count
              ? `${partner.rating.average.toFixed(1)} (${partner.rating.count})`
              : "No ratings yet"
          }
        />
        <Field
          label="Total bookings"
          value={String(partner.rating.totalBookings)}
        />
        <Field
          label="Cancellation rate"
          value={`${(partner.rating.cancellationRate * 100).toFixed(0)}%`}
        />
      </Section>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/partners"
      className="text-sm font-medium text-slate-500 hover:text-slate-800"
    >
      ← Back to partners
    </Link>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-bold text-slate-900">{title}</h2>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">
        {value || <span className="text-slate-400">—</span>}
      </dd>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="col-span-full text-sm text-slate-400">{text}</p>;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : null;
}
