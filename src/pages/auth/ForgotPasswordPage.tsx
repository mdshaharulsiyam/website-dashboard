import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, KeyRound, Lock } from "lucide-react";
import {
  useSendVerificationCodeMutation,
  useVerifyCodeMutation,
  useResetPasswordMutation,
} from "@/store/authApi";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

// ─── Password rules ───────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One digit (0–9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(idx: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[idx] = digit;
    const newVal = next.join("").padEnd(6, "").slice(0, 6);
    onChange(newVal);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      if (!value[idx] && idx > 0) {
        const next = value.split("");
        next[idx - 1] = "";
        onChange(next.join("").padEnd(6, "").slice(0, 6));
        inputs.current[idx - 1]?.focus();
      } else {
        const next = value.split("");
        next[idx] = "";
        onChange(next.join("").padEnd(6, "").slice(0, 6));
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-lg border border-slate-200 text-center text-lg font-bold text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
        />
      ))}
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function Countdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onExpire]);

  const m = Math.floor(left / 60).toString().padStart(2, "0");
  const s = (left % 60).toString().padStart(2, "0");
  return (
    <span className={`font-mono text-sm font-semibold ${left <= 30 ? "text-red-500" : "text-amber-600"}`}>
      {m}:{s}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpKey, setOtpKey] = useState(0); // remounts countdown on resend

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const [sendCode, { isLoading: sending }] = useSendVerificationCodeMutation();
  const [verifyCode, { isLoading: verifying }] = useVerifyCodeMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  // ── Step 1: send code ──────────────────────────────────────────────────────

  function validateEmail() {
    if (!email.trim()) { setEmailError("Email is required"); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Enter a valid email"); return false; }
    setEmailError("");
    return true;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail()) return;
    try {
      await sendCode({ email }).unwrap();
      toast.success("Verification code sent to your email");
      setOtp("");
      setOtpExpired(false);
      setOtpKey((k) => k + 1);
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to send code";
      toast.error(msg);
    }
  }

  // ── Step 2: verify OTP ─────────────────────────────────────────────────────

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.replace(/\s/g, "");
    if (code.length !== 6) { toast.error("Enter the full 6-digit code"); return; }
    try {
      const result = await verifyCode({ email, code }).unwrap();
      setResetToken(result.data.resetToken);
      toast.success("Code verified!");
      setPassword("");
      setConfirmPassword("");
      setPasswordErrors([]);
      setStep(3);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Invalid or expired code";
      toast.error(msg);
    }
  }

  async function handleResend() {
    try {
      await sendCode({ email }).unwrap();
      toast.success("New code sent to your email");
      setOtp("");
      setOtpExpired(false);
      setOtpKey((k) => k + 1);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to resend code";
      toast.error(msg);
    }
  }

  // ── Step 3: reset password ─────────────────────────────────────────────────

  function validatePassword() {
    const errs: string[] = [];
    PASSWORD_RULES.forEach((r) => { if (!r.test(password)) errs.push(r.label); });
    if (password !== confirmPassword) errs.push("Passwords do not match");
    setPasswordErrors(errs);
    return errs.length === 0;
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      await resetPassword({ resetToken, password, confirm_password: confirmPassword }).unwrap();
      toast.success("Password reset successfully! Please log in.");
      navigate("/login");
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to reset password";
      toast.error(msg);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
            🐝
          </div>
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
              <p className="text-sm text-slate-500 mt-1">Enter your email to receive a verification code</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Check Your Email</h1>
              <p className="text-sm text-slate-500 mt-1">
                We sent a 6-digit code to <span className="font-medium text-slate-700">{email}</span>
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
              <p className="text-sm text-slate-500 mt-1">Choose a strong password for your account</p>
            </>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {([1, 2, 3] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`h-2 flex-1 rounded-full transition-colors ${step >= s ? "bg-amber-400" : "bg-slate-100"}`} />
              {i < 2 && null}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@looksbee.com"
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
                />
              </div>
              {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {sending ? "Sending…" : "Send Verification Code"}
            </button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-6" noValidate>
            <div className="space-y-4">
              <OtpInput value={otp} onChange={setOtp} />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>Code expires in</span>
                  {!otpExpired
                    ? <Countdown key={otpKey} seconds={300} onExpire={() => setOtpExpired(true)} />
                    : <span className="text-red-500 font-semibold text-sm">Expired</span>
                  }
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={sending}
                  className="text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50 transition-colors"
                >
                  {sending ? "Sending…" : "Resend code"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying || otp.replace(/\s/g, "").length !== 6 || otpExpired}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {verifying ? "Verifying…" : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Change email
            </button>
          </form>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <form onSubmit={handleReset} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordErrors([]); }}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-10 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors([]); }}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-10 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="rounded-lg bg-slate-50 p-3 space-y-1.5">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <div key={rule.label} className="flex items-center gap-2 text-xs">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${passed ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={passed ? "text-emerald-600" : "text-slate-500"}>{rule.label}</span>
                  </div>
                );
              })}
            </div>

            {passwordErrors.length > 0 && (
              <ul className="space-y-1">
                {passwordErrors.map((err) => (
                  <li key={err} className="text-xs text-red-500">{err}</li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              disabled={resetting}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {resetting ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
