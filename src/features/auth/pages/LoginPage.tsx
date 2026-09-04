import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCredentials = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      setStep("otp");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await verifyOtp(email.trim(), otp.trim());
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to verify the code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center overflow-y-auto px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
            G
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Genzy Admin</h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === "credentials"
              ? "Sign in to manage partner verification"
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className={inputClass}
                  placeholder="you@genzybasket.com"
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className={buttonClass}
              >
                {isSubmitting ? "Verifying…" : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-4">
              <Field label="Verification code">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  autoFocus
                  className={`${inputClass} text-center text-lg tracking-[0.4em]`}
                  placeholder="000000"
                />
              </Field>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className={buttonClass}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                  setError(null);
                }}
                className="w-full text-sm text-slate-500 hover:text-slate-700"
              >
                Use a different account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

const buttonClass =
  "w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
