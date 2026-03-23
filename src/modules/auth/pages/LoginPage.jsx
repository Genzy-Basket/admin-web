import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { authApi } from "../../../api/endpoints/auth.api";
import { useAuth } from "../context/AuthContext";

const OTP_LENGTH = 6;

const LoginPage = () => {
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-focus first OTP input on step change
  useEffect(() => {
    if (step === "otp") inputRefs.current[0]?.focus();
  }, [step]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authApi.sendOtp(email, password);
      setStep("otp");
      setOtp(Array(OTP_LENGTH).fill(""));
      setCountdown(60);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const submitOtp = async (otpValue) => {
    setError("");
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp(email, otpValue);
      login(response.data, response.token);
      navigate("/users");
    } catch (err) {
      setError(err.message || "Invalid OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (error) setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (value && index === OTP_LENGTH - 1) {
      const full = next.join("");
      if (full.length === OTP_LENGTH) submitOtp(full);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === OTP_LENGTH) submitOtp(pasted);
  };

  const Spinner = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#099E0E] rounded-2xl mb-4 shadow-lg shadow-[#099E0E]/30">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Genzy Basket<span className="text-[#099E0E]">.</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {step === "credentials" ? (
            <>
              <h2 className="text-xl font-black text-slate-800 mb-6">Sign in to your account</h2>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
                    <Mail size={14} className="text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                    placeholder="admin@genzybasket.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
                    <Lock size={14} className="text-slate-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
                    <span className="mt-0.5 shrink-0">!</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#099E0E] text-white font-bold rounded-xl hover:bg-[#078A0C] transition-all shadow-md shadow-[#099E0E]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? <><Spinner /> Sending OTP…</> : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("credentials"); setError(""); setOtp(Array(OTP_LENGTH).fill("")); }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 font-medium mb-4 transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <h2 className="text-xl font-black text-slate-800 mb-2">Enter OTP</h2>
              <p className="text-sm text-slate-500 mb-6">
                Code sent to <span className="font-semibold text-slate-700">{email}</span>
              </p>

              {/* OTP inputs */}
              <div className="flex justify-center gap-3 mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none transition-all"
                  />
                ))}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
                  <Loader2 size={16} className="animate-spin" />
                  Verifying…
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium mb-4">
                  <span className="mt-0.5 shrink-0">!</span>
                  {error}
                </div>
              )}

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-slate-400">Resend in {countdown}s</p>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-sm font-semibold text-[#099E0E] hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Genzy Basket Admin · Authorized Access Only
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
