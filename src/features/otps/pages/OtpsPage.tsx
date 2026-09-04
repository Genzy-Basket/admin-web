import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/shared/api";
import type { PartnerOtp, PartnerOtpList } from "@/features/otps/types";

const REFRESH_MS = 10_000;
const SEARCH_DEBOUNCE_MS = 300;

const PURPOSE_LABELS: Record<string, string> = {
  login: "Sign in",
  register: "Registration",
  "change-phone": "Phone change",
};

export default function OtpsPage() {
  const [data, setData] = useState<PartnerOtpList | null>(null);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async (search: string, showSpinner: boolean) => {
    if (showSpinner) setIsLoading(true);
    try {
      const query = search.trim() ? `?phone=${encodeURIComponent(search.trim())}` : "";
      setData(await api.get<PartnerOtpList>(`/admin/otps/partners${query}`));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load codes.");
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => void load(phone, true),
      data === null ? 0 : SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, load]);

  const phoneRef = useRef(phone);
  phoneRef.current = phone;

  useEffect(() => {
    const poll = setInterval(() => void load(phoneRef.current, false), REFRESH_MS);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  const live = (data?.items ?? []).filter(
    (item) => new Date(item.expiresAt).getTime() > now,
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Partner Login Codes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live codes, newest first. Partners cannot receive an SMS yet, so read
          the code out to them. Each one expires five minutes after it is sent.
        </p>
      </div>

      <div className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
        A code signs someone into that partner's account. Confirm who you are
        speaking to before reading one out, and never send it over chat.
      </div>

      <div className="mt-5">
        <input
          type="search"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Search a phone number…"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <Placeholder text="Loading codes…" />
        ) : !live.length ? (
          <Placeholder
            text={
              phone.trim()
                ? "No live code for that number."
                : "No codes are waiting. One appears here the moment a partner asks to sign in."
            }
          />
        ) : (
          live.map((item) => (
            <OtpCard key={`${item.phone}:${item.purpose}`} otp={item} now={now} />
          ))
        )}
      </div>
    </div>
  );
}

function OtpCard({ otp, now }: { otp: PartnerOtp; now: number }) {
  const [isCopied, setIsCopied] = useState(false);

  const secondsLeft = Math.max(
    0,
    Math.round((new Date(otp.expiresAt).getTime() - now) / 1000),
  );
  const isExpiring = secondsLeft <= 60;

  const copy = async () => {
    if (!otp.otp) return;
    try {
      await navigator.clipboard.writeText(otp.otp);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm font-medium text-slate-900">
              {otp.phone}
            </p>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {PURPOSE_LABELS[otp.purpose] ?? otp.purpose}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {otp.partner ? otp.partner.name : "New partner — not registered yet"}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>sent {new Date(otp.sentAt).toLocaleTimeString()}</span>
            {otp.attempts > 0 && (
              <span className={otp.attempts >= 3 ? "text-red-600" : undefined}>
                {otp.attempts} failed{" "}
                {otp.attempts === 1 ? "attempt" : "attempts"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <button
              onClick={copy}
              disabled={!otp.otp}
              title={otp.otp ? "Copy code" : undefined}
              className="font-mono text-2xl font-bold tracking-[0.2em] text-slate-900 transition hover:text-brand-600 disabled:cursor-default disabled:text-slate-400 disabled:hover:text-slate-400"
            >
              {otp.otp ?? "——————"}
            </button>
            <p
              className={`mt-0.5 text-xs ${
                isExpiring ? "font-medium text-red-600" : "text-slate-400"
              }`}
            >
              {isCopied ? "Copied" : `expires in ${formatCountdown(secondsLeft)}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
