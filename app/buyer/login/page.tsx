"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ShoppingBag,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

const DEMO_BUYERS = [
  { name: "Sophia Chen", email: "buyer1@procurehub.com" },
  { name: "Liam O'Connor", email: "buyer2@retailmesh.com" },
  { name: "Maya Patel", email: "buyer3@buildersco.com" },
];

export default function BuyerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/buyer/dashboard";
  const { success, error } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: identifier.trim(),
        password,
      });

      if (res?.error) {
        error(res.error);
        setIsLoading(false);
        return;
      }

      success("Welcome to your Buyer Procurement Workspace!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      error("Authentication server error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAutofill = (email: string) => {
    setIdentifier(email);
    setPassword("Distributeder#Buyer2026!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none animate-float-slow" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide uppercase mb-4">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Enterprise Buyer Portal</span>
        </div>

        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Distributeder <span className="text-blue-400 text-lg font-bold">Buyer</span>
          </span>
        </Link>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">
          Buyer Portal Sign In
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Corporate procurement orders, RFQ quotes & live tracking.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in-up delay-200">
        <div className="glass-card rounded-3xl py-6 sm:py-8 px-5 sm:px-10 shadow-2xl space-y-5">
          {/* Demo Credentials */}
          <div className="p-3.5 rounded-2xl glass-light border-blue-900/30 space-y-2.5">
            <div className="text-[11px] font-bold text-blue-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Demo Buyer Logins
              </span>
              <span className="text-[10px] text-blue-400/70 font-normal">Click to fill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {DEMO_BUYERS.map((buyer) => (
                <button
                  key={buyer.email}
                  type="button"
                  onClick={() => handleAutofill(buyer.email)}
                  className="p-2.5 rounded-xl bg-slate-900/60 text-left border border-slate-800/60 transition-all duration-300 group hover-lift hover-glow-blue"
                >
                  <div className="font-bold text-blue-400 text-[11px] group-hover:text-blue-300 transition-colors">{buyer.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{buyer.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleBuyerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Buyer ID or Work Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="buyer1@procurehub.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entering Dashboard...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Buyer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <div className="p-3 glass-light rounded-2xl text-center text-xs text-slate-400">
            Need a wholesale account?{" "}
            <Link href="/register" className="font-bold text-blue-400 hover:text-blue-300 underline transition-colors">
              Sign up free as a buyer →
            </Link>
          </div>

          {/* Other Portals */}
          <div className="pt-3 border-t border-slate-800/50 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-500 text-center uppercase tracking-wider">
              Other portals
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/seller/login"
                className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all duration-200 flex items-center gap-2 hover-lift"
              >
                <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">Seller Portal</div>
                  <div className="text-[10px] text-slate-500">Distributor login</div>
                </div>
              </Link>
              <Link
                href="/admin/login"
                className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 transition-all duration-200 flex items-center gap-2 hover-lift"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">Admin Portal</div>
                  <div className="text-[10px] text-slate-500">Executive login</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
