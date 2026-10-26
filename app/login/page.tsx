"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import {
  Boxes,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Building2,
  ShoppingBag,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

type PortalRole = "BUYER" | "SELLER" | "ADMIN";

const ROLE_CONFIG = {
  BUYER: {
    color: "blue",
    icon: ShoppingBag,
    label: "Buyer",
    dashboard: "Buyer Workspace",
    gradient: "from-blue-600 to-cyan-500",
    glowClass: "hover-glow-blue",
    bgActive: "bg-blue-600 shadow-lg shadow-blue-600/30",
    ringColor: "focus:ring-blue-500",
  },
  SELLER: {
    color: "amber",
    icon: Building2,
    label: "Seller",
    dashboard: "Seller Dashboard",
    gradient: "from-amber-500 to-orange-500",
    glowClass: "hover-glow-amber",
    bgActive: "bg-amber-600 shadow-lg shadow-amber-600/30",
    ringColor: "focus:ring-amber-500",
  },
  ADMIN: {
    color: "rose",
    icon: ShieldAlert,
    label: "Admin",
    dashboard: "Admin Dashboard",
    gradient: "from-rose-600 to-pink-500",
    glowClass: "hover-glow-rose",
    bgActive: "bg-rose-600 shadow-lg shadow-rose-600/30",
    ringColor: "focus:ring-rose-500",
  },
};

const DEMO_CREDENTIALS: Record<
  PortalRole,
  { name: string; email: string; password: string }[]
> = {
  BUYER: [
    { name: "Sophia Chen", email: "buyer1@procurehub.com", password: "Distributeder#Buyer2026!" },
    { name: "Liam O'Connor", email: "buyer2@retailmesh.com", password: "Distributeder#Buyer2026!" },
  ],
  SELLER: [
    { name: "NovaTech Direct", email: "seller2@novatech.com", password: "Distributeder#Seller2026!" },
    { name: "Apex Industrial", email: "seller1@apexhardware.com", password: "Distributeder#Seller2026!" },
  ],
  ADMIN: [
    { name: "Platform Administrator", email: "admin@distributeder.com", password: "Distributeder#Admin2026!" },
  ],
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role")?.toUpperCase() as PortalRole) || "BUYER";
  const callbackUrl = searchParams.get("callbackUrl");
  const { success, error, warning } = useToast();

  const [selectedRole, setSelectedRole] = useState<PortalRole>(
    ["BUYER", "SELLER", "ADMIN"].includes(initialRole) ? initialRole : "BUYER"
  );
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const roleConfig = ROLE_CONFIG[selectedRole];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
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

      // Fetch user session to determine their individual portal page
      const session = await getSession();

      if (callbackUrl && callbackUrl !== "/") {
        success("Signed in successfully!");
        router.push(callbackUrl);
        router.refresh();
        return;
      }

      // Auto-route to the individual page for this user
      if (session?.user?.role === "ADMIN" || selectedRole === "ADMIN") {
        if (session?.user?.role !== "ADMIN") {
          warning("Signed in, but your account lacks Administrator privileges. Redirecting to your dashboard...");
          router.push(session?.user?.isSeller ? "/seller/dashboard" : "/buyer/dashboard");
        } else {
          success("Welcome Administrator!");
          router.push("/admin/dashboard");
        }
      } else if (selectedRole === "SELLER" || session?.user?.isSeller) {
        if (session?.user?.isSeller) {
          success("Welcome to your Distributor Workspace!");
          router.push("/seller/dashboard");
        } else {
          warning("Signed in as a Buyer. Complete seller registration to access the distributor dashboard.");
          router.push("/seller/onboarding");
        }
      } else {
        success("Welcome to your Buyer Procurement Workspace!");
        router.push("/buyer/dashboard");
      }

      router.refresh();
    } catch (err) {
      error("An unexpected login error occurred");
      setIsLoading(false);
    }
  };

  const handleAutofill = (email: string, pass: string, role: PortalRole) => {
    setIdentifier(email);
    setPassword(pass);
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-[140px] pointer-events-none animate-pulse-glow bg-blue-600/10" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full blur-[120px] pointer-events-none animate-float-slow bg-indigo-500/8" />
      <div className="absolute top-1/2 left-0 w-[200px] h-[200px] rounded-full blur-[100px] pointer-events-none animate-pulse-glow bg-orange-500/6" style={{ animationDelay: "3s" }} />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center animate-fade-in-up">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 p-0.5 shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Boxes className="w-6 h-6 text-blue-400 group-hover:text-orange-400 transition-colors duration-300" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Distributeder
          </span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Sign In to Your Workspace
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Enter your credentials to access your personalized portal.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 animate-fade-in-up delay-200">
        <div className="glass-card rounded-3xl py-6 sm:py-8 px-5 sm:px-10 shadow-2xl space-y-5">
          {/* Portal Role Tabs */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Select Your Portal:</span>
              <Link
                href="/portals"
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>All portals</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/60">
              {(["BUYER", "SELLER", "ADMIN"] as PortalRole[]).map((role) => {
                const config = ROLE_CONFIG[role];
                const Icon = config.icon;
                const isActive = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      isActive
                        ? `${config.bgActive} text-white scale-[1.02]`
                        : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline sm:inline">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="p-3.5 rounded-2xl glass-light space-y-2.5 animate-fade-in-scale">
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Demo Credentials ({roleConfig.label}):
              </span>
              <span className="text-[10px] text-blue-400/70 font-normal">Click to fill</span>
            </div>

            <div className={`grid ${DEMO_CREDENTIALS[selectedRole].length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-2`}>
              {DEMO_CREDENTIALS[selectedRole].map((cred, idx) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => handleAutofill(cred.email, cred.password, selectedRole)}
                  className={`p-2.5 rounded-xl bg-slate-900/60 text-left border border-slate-800/60 transition-all duration-300 group hover-lift ${roleConfig.glowClass}`}
                >
                  <div className={`font-bold text-${roleConfig.color}-400 text-[11px] group-hover:text-${roleConfig.color}-300 transition-colors`}>
                    {cred.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                    <span className="truncate">{cred.email}</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / User ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                User ID or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    selectedRole === "ADMIN"
                      ? "admin@distributeder.com"
                      : selectedRole === "SELLER"
                      ? "seller2@novatech.com"
                      : "buyer1@procurehub.com"
                  }
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-20 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                  {password && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(password, "pw")}
                      className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800/50"
                      title="Copy password"
                    >
                      {copiedField === "pw" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800/50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift bg-gradient-to-r ${roleConfig.gradient}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {roleConfig.dashboard}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Individual Login Page Direct Links */}
          <div className="pt-3 border-t border-slate-800/60 space-y-2.5 text-center">
            <span className="text-[11px] text-slate-500 block">
              Or use dedicated login pages:
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs">
              <Link
                href="/buyer/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1 hover:underline"
              >
                <ShoppingBag className="w-3 h-3" />
                Buyer Login
              </Link>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <Link
                href="/seller/login"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1 hover:underline"
              >
                <Building2 className="w-3 h-3" />
                Seller Login
              </Link>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <Link
                href="/admin/login"
                className="text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1 hover:underline"
              >
                <ShieldAlert className="w-3 h-3" />
                Admin Login
              </Link>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/60">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-orange-400 font-bold hover:text-orange-300 hover:underline transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
