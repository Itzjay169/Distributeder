"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Boxes, Mail, ArrowRight, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Password reset link generated!");
        setResetUrl(data.resetUrl);
      } else {
        error(data.error || "Failed to generate reset link");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (resetUrl) {
      const fullUrl = `${window.location.origin}${resetUrl}`;
      navigator.clipboard.writeText(fullUrl);
      success("Reset link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 p-0.5 shadow-xl">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Boxes className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Distributeder
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">Reset Password</h2>
        <p className="mt-1 text-xs text-slate-400">
          Demo Mode: The password reset link will be displayed on screen for immediate testing.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-950 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          {!resetUrl ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@distributeder.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Generating Link..." : "Generate Password Reset Link"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Demo Mode: Reset Link Generated!</span>
                </div>
                <p className="text-[11px] opacity-90">
                  Because this is a zero-config local demo environment, the reset token was generated without sending an external email:
                </p>
                <div className="p-2 bg-slate-900 rounded-lg font-mono text-[11px] text-blue-300 break-all select-all border border-slate-800">
                  {resetUrl}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyToClipboard}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>

                <Link
                  href={resetUrl}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Open Reset Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
            Remembered your password?{" "}
            <Link href="/login" className="text-blue-400 font-bold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
