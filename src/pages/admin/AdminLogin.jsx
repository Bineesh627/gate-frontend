import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Key,
} from "lucide-react";
import { marketApi } from "@/api/marketApi";
import Logo from "@/components/site/Logo";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get("expired") === "1";
  const urlResetToken = searchParams.get("reset_token") || "";
  const urlEmail = searchParams.get("email") || "";

  // Modes: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState(urlResetToken ? "reset" : "login");

  // Login form state
  const [email, setEmail] = useState(urlEmail || "");
  const [password, setPassword] = useState("");

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState(urlEmail || "");
  const [devToken, setDevToken] = useState("");

  // Reset password form state
  const [resetEmail, setResetEmail] = useState(urlEmail || "");
  const [resetToken, setResetToken] = useState(urlResetToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (urlResetToken) {
      setMode("reset");
      setResetToken(urlResetToken);
      if (urlEmail) {
        setResetEmail(urlEmail);
      }
    }
  }, [urlResetToken, urlEmail]);

  // Handle standard Admin Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await marketApi.login(email, password);
      if (res?.success) {
        navigate("/admin");
      } else {
        setError(res?.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "Failed to login. Please check MySQL backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password (request link / token)
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setDevToken("");

    try {
      const res = await marketApi.forgotPassword(forgotEmail);
      if (res?.success) {
        setSuccessMsg(res.message || "Password reset instructions have been generated.");
        if (res.devToken) {
          setDevToken(res.devToken);
          setResetEmail(forgotEmail);
          setResetToken(res.devToken);
        }
      } else {
        setError(res?.message || "Failed to process password reset request.");
      }
    } catch (err) {
      setError(err.message || "Could not reach server to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Setting New Password with token
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await marketApi.resetPassword(resetEmail, resetToken, newPassword);
      if (res?.success) {
        setSuccessMsg("Password updated successfully! You can now sign in with your new password.");
        setEmail(resetEmail);
        setPassword("");
        setMode("login");
      } else {
        setError(res?.message || "Failed to reset password. Token may be invalid or expired.");
      }
    } catch (err) {
      setError(err.message || "Could not reset password. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1A22] flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#007BB5]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#007BB5]">
            <ShieldCheck className="h-4 w-4" /> Admin Portal
          </div>

          {mode === "login" && (
            <>
              <h2 className="mt-4 font-heading text-2xl font-black text-[#1A1A1A]">Welcome Back</h2>
              <p className="mt-1 text-sm text-black/55">
                Log in to manage site content, stores, blogs, and settings.
              </p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h2 className="mt-4 font-heading text-2xl font-black text-[#1A1A1A]">Reset Password</h2>
              <p className="mt-1 text-sm text-black/55">
                Enter your admin email to receive password reset instructions.
              </p>
            </>
          )}

          {mode === "reset" && (
            <>
              <h2 className="mt-4 font-heading text-2xl font-black text-[#1A1A1A]">Set New Password</h2>
              <p className="mt-1 text-sm text-black/55">
                Enter your reset token and your new administrator password.
              </p>
            </>
          )}
        </div>

        {/* Expired Session Alert */}
        {isExpired && mode === "login" && !error && !successMsg && (
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-xs font-medium text-amber-800 border border-amber-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Your admin session has expired or is invalid. Please sign in again.</span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5"
              >
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  id="admin-email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-black/15 pl-12 pr-4 py-3.5 text-sm outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="admin@gatehypermarket.ae"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-black/60"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setSuccessMsg("");
                    setForgotEmail(email);
                  }}
                  className="text-xs font-semibold text-[#007BB5] hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-black/15 pl-12 pr-4 py-3.5 text-sm outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E65100] py-4 font-heading text-base font-bold text-white shadow-lg shadow-[#E65100]/25 transition-all hover:bg-[#d44700] hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        )}

        {/* MODE: FORGOT PASSWORD */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5"
              >
                Registered Admin Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  id="forgot-email"
                  name="forgotEmail"
                  type="text"
                  autoComplete="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-2xl border border-black/15 pl-12 pr-4 py-3.5 text-sm outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="Enter admin email or username"
                />
              </div>
            </div>

            {/* If devToken is returned (e.g. local environment without SMTP configured) */}
            {devToken && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-semibold text-slate-700 mb-1">Generated Reset Token:</p>
                <div className="bg-white p-2 rounded border border-slate-200 font-mono text-[11px] break-all select-all text-slate-800">
                  {devToken}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                  }}
                  className="mt-2.5 text-xs font-bold text-[#007BB5] hover:underline inline-flex items-center gap-1"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Continue to set new password &rarr;
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#007BB5] py-4 font-heading text-base font-bold text-white shadow-lg shadow-[#007BB5]/25 transition-all hover:bg-[#00699a] hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Generating Instructions..." : "Send Reset Link"}
              <KeyRound className="h-5 w-5" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-black/60 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* MODE: RESET PASSWORD */}
        {mode === "reset" && (
          <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5"
              >
                Admin Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  id="reset-email"
                  name="resetEmail"
                  type="text"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-2xl border border-black/15 pl-12 pr-4 py-3 text-sm outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="admin@gatehypermarket.ae"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reset-token"
                className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5"
              >
                Reset Token
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  id="reset-token"
                  name="resetToken"
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full rounded-2xl border border-black/15 pl-12 pr-4 py-3 text-sm outline-none font-mono text-xs transition-colors focus:border-[#007BB5]"
                  placeholder="Paste reset token here"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-2xl border border-black/15 pl-12 pr-4 py-3 text-sm outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-black/15 pl-12 pr-4 py-3 text-sm outline-none transition-colors focus:border-[#007BB5]"
                  placeholder="Re-type new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E65100] py-3.5 font-heading text-base font-bold text-white shadow-lg shadow-[#E65100]/25 transition-all hover:bg-[#d44700] hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Updating Password..." : "Set New Password"}
              <CheckCircle2 className="h-5 w-5" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-black/60 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
