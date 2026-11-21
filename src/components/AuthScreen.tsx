import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { UserRecord, UserRole } from "../types";
import { AuthRepo } from "../db/repository";

interface AuthScreenProps {
  onAuthenticated: (user: UserRecord) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState<"form" | "verify">("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupRole, setSignupRole] = useState<UserRole>("learner");

  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, rawVal: string) => {
    const cleaned = rawVal.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      chars.forEach((ch, idx) => {
        next[idx] = ch;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(5, chars.length);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned;
    setOtpDigits(next);
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length > 0) {
      e.preventDefault();
      const next = ["", "", "", "", "", ""];
      pasted.split("").forEach((ch, idx) => {
        next[idx] = ch;
      });
      setOtpDigits(next);
      otpInputRefs.current[Math.min(5, pasted.length - 1)]?.focus();
    }
  };

  const handleRequestCode = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError(
        "Please enter your full name, a valid email, and a password (min 6 characters)."
      );
      return;
    }
    setError(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      // Direct signup: email verification removed so no email provider is needed.
      const res = await AuthRepo.signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role: signupRole,
      });
      if (res.error || !res.user) {
        setError(res.error || "Unable to create account.");
        return;
      }
      onAuthenticated(res.user);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await AuthRepo.verifySignupCode({
        email: email.trim(),
        code,
      });
      if (res.error || !res.user) {
        setError(res.error || "Invalid verification code.");
        return;
      }
      onAuthenticated(res.user);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (mode === "login") {
      setSubmitting(true);
      try {
        const res = await AuthRepo.loginWithEmail(email, password);
        if (res.error || !res.user) {
          setError(res.error || "Unable to sign in.");
          return;
        }
        onAuthenticated(res.user);
      } finally {
        setSubmitting(false);
      }
    } else {
      await handleRequestCode();
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await AuthRepo.loginDemo(role);
      onAuthenticated(user);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      {/* Clean Brand Left Panel */}
      <div className="flex flex-col justify-between border-b border-slate-200/80 bg-slate-900 px-8 py-10 text-white sm:px-12 lg:w-[44%] lg:border-b-0 lg:border-r lg:px-14 lg:py-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            SkillLoop
          </span>
        </div>

        <div className="my-auto max-w-md py-12 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Interactive Coding &amp; Practice
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl text-balance">
            Master programming concepts at your own pace.
          </h1>

          <p className="text-sm leading-relaxed text-slate-300">
            Short, focused practice sessions with instant step-by-step explanations, tailored to your daily schedule.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Bite-sized 10–30 minute daily sessions",
              "Instant step-by-step concept explanations",
              "Pick up right where you left off",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                  <UserCheck className="h-3 w-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} SkillLoop. All rights reserved.
        </div>
      </div>

      {/* Right Clean Auth Form Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm sm:p-9 space-y-6">
            {signupStep === "verify" && mode === "signup" ? (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupStep("form");
                      setError(null);
                      setInfoMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <span className="text-xs font-semibold text-indigo-600">
                    Step 2 of 2
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Check your email
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Enter the 6-digit verification code sent to{" "}
                    <span className="font-semibold text-slate-800">
                      {email}
                    </span>
                    .
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                    <div className="flex items-center justify-between gap-2">
                      <span>{error}</span>
                    </div>
                    {error.toLowerCase().includes("already exists") && (
                      <div className="mt-2.5 pt-2 border-t border-rose-200/80 flex items-center justify-between gap-2">
                        <span className="font-medium text-rose-700">Account already created?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setError(null);
                          }}
                          className="font-bold text-indigo-700 underline hover:text-indigo-900 cursor-pointer shrink-0"
                        >
                          Sign In Instead →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {infoMsg && !error && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 px-3.5 py-2.5 text-xs font-medium text-emerald-900">
                    {infoMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Verification Code
                  </label>
                  <div className="grid grid-cols-6 gap-2" dir="ltr">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        aria-label={`Verification digit ${idx + 1}`}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 text-center font-mono text-lg font-bold text-slate-900 transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || otpDigits.join("").length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Create Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    disabled={submitting || resendCooldown > 0}
                    onClick={handleRequestCode}
                    className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-400"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend Code"}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {mode === "login" ? "Welcome back" : "Create an account"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {mode === "login"
                      ? "Sign in to access your courses and practice sessions."
                      : "Sign up to start learning in seconds."}
                  </p>
                </div>

                <div
                  className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100/90 p-1"
                  role="tablist"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "login"}
                    onClick={() => {
                      setMode("login");
                      setSignupStep("form");
                      setError(null);
                      setInfoMsg(null);
                    }}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      mode === "login"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "signup"}
                    onClick={() => {
                      setMode("signup");
                      setSignupStep("form");
                      setEmail("");
                      setPassword("");
                      setError(null);
                      setInfoMsg(null);
                    }}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      mode === "signup"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                    <div className="flex items-center justify-between gap-2">
                      <span>{error}</span>
                    </div>
                    {error.toLowerCase().includes("already exists") && (
                      <div className="mt-2.5 pt-2 border-t border-rose-200/80 flex items-center justify-between gap-2">
                        <span className="font-medium text-rose-700">Account already created?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setError(null);
                          }}
                          className="font-bold text-indigo-700 underline hover:text-indigo-900 cursor-pointer shrink-0"
                        >
                          Sign In Instead →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Ayesha Tariq"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 ps-9 pe-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 ps-9 pe-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 ps-9 pe-10 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {mode === "signup" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Select Role
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: "learner", label: "Learner", icon: UserCheck },
                            { id: "educator", label: "Educator", icon: Users },
                          ] as const
                        ).map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSignupRole(id)}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-colors ${
                              signupRole === id
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {mode === "login"
                            ? "Signing in..."
                            : "Creating account..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === "login"
                            ? "Sign In"
                            : "Create Account"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {mode === "login" && (
                  <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 gap-2">
                    <span className="font-medium text-slate-500">Quick Demo:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleDemoLogin("learner")}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                      >
                        Learner
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleDemoLogin("educator")}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                      >
                        Educator
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
