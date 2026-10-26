"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import {
  Building2,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShoppingBag,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

const DEMO_SELLERS = [
  { name: "NovaTech Direct", email: "seller2@novatech.com" },
  { name: "Apex Industrial", email: "seller1@apexhardware.com" },
  { name: "GreenEarth Agro", email: "seller3@greenearth.com" },
  { name: "Hybrid Trade", email: "seller4@hybridtrade.com" },
];

export default function SellerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/seller/dashboard";
  const { success, error, warning } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSellerLogin = async (e: React.FormEvent) => {
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

      const session = await getSession();
      if (!session?.user?.isSeller) {
        warning("You are signed in as a buyer. Please complete seller registration to activate distributor tools.");
        router.push("/seller/onboarding");
        return;
      }

      success("Welcome to your Distributor Workspace!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      error("Authentication server error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAutofill = (email: string) => {
    setIdentifier(email);
    setPassword("Distributeder#Seller2026!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-amber-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/8 rounded-full blur-[100px] pointer-events-none animate-float-slow" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide uppercase mb-4">
          <Building2 className="w-3.5 h-3.5" />
          <span>Distributor & Supplier Portal</span>
        </div>

        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-yellow-500 p-0.5 shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-400 group-hover:text-yellow-400 transition-colors duration-300" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Distributeder <span className="text-amber-400 text-lg font-bold">Seller</span>
          </span>
        </Link>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">
          Seller Portal Sign In
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Wholesale catalog, order dispatches & settlement ledger.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in-up delay-200">
        <div className="glass-card rounded-3xl py-6 sm:py-8 px-5 sm:px-10 shadow-2xl space-y-5">
          {/* Demo Credentials */}
          <div className="p-3.5 rounded-2xl glass-light border-amber-900/30 space-y-2.5">
            <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Demo Seller Logins
              </span>
              <span className="text-[10px] text-amber-400/70 font-normal">Click to fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {DEMO_SELLERS.map((seller) => (
                <button
                  key={seller.email}
                  type="button"
                  onClick={() => handleAutofill(seller.email)}
                  className="p-2.5 rounded-xl bg-slate-900/60 text-left border border-slate-800/60 transition-all duration-300 group hover-lift hover-glow-amber"
                >
                  <div className="font-bold text-amber-400 text-[11px] group-hover:text-amber-300 transition-colors">{seller.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{seller.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSellerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Seller ID, Store Slug, or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="seller2@novatech.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-transparent transition-all duration-200"
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
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entering Dashboard...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Seller Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <div className="p-3 glass-light rounded-2xl text-center text-xs text-slate-400">
            Want to sell wholesale?{" "}
            <Link href="/register?mode=seller" className="font-bold text-amber-400 hover:text-amber-300 underline transition-colors">
              Register your business →
            </Link>
          </div>

          {/* Other Portals */}
          <div className="pt-3 border-t border-slate-800/50 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-500 text-center uppercase tracking-wider">
              Other portals
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/buyer/login"
                className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-blue-500/40 text-slate-300 hover:text-blue-400 transition-all duration-200 flex items-center gap-2 hover-lift"
              >
                <ShoppingBag className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">Buyer Portal</div>
                  <div className="text-[10px] text-slate-500">Procurement login</div>
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
