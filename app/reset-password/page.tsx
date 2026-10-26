"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Boxes, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const { success, error } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Password reset successfully!");
        setIsDone(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        error(data.error || "Failed to reset password");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsLoading(false);
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
        <h2 className="text-2xl font-bold tracking-tight text-white">Set New Password</h2>
        <p className="mt-1 text-xs text-slate-400">
          Resetting password for <strong className="text-white">{email}</strong>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-950 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          {isDone ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div className="font-bold text-white text-base">Password Updated!</div>
              <p className="text-xs text-slate-400">
                Redirecting you to the sign-in page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Save New Password"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
