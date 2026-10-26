"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Boxes,
  Lock,
  Mail,
  User,
  ArrowRight,
  Store,
  ShoppingBag,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [companyType, setCompanyType] = useState("Distributor");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength meter
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score, label: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { score, label: "Good", color: "bg-blue-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          isSeller,
          storeName: isSeller ? storeName : undefined,
          companyType: isSeller ? companyType : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Account created successfully! Signing you in...");

        // Auto sign in
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (signInRes?.ok) {
          router.push(isSeller ? "/seller/dashboard" : "/buyer/dashboard");
          router.refresh();
        } else {
          router.push("/login");
        }
      } else {
        error(data.error || "Failed to create account");
        setIsLoading(false);
      }
    } catch (err) {
      error("An unexpected registration error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background animated orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-[140px] pointer-events-none animate-pulse-glow bg-indigo-600/10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none animate-float-slow bg-orange-500/8" />
      <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full blur-[100px] pointer-events-none animate-pulse-glow bg-blue-500/6" style={{ animationDelay: "2s" }} />

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
          Create Your Account
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Register as an Enterprise Buyer or Authorized Distributor.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 animate-fade-in-up delay-200">
        <div className="glass-card rounded-3xl py-6 sm:py-8 px-5 sm:px-10 shadow-2xl space-y-5">
          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/60">
            <button
              type="button"
              onClick={() => setIsSeller(false)}
              className={`py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                !isSeller
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/80"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSeller(true)}
              className={`py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                isSeller
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-[1.02]"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/80"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Distributor</span>
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name / Contact Person
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Business Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Password with strength meter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password (min 8 characters)
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {password && (
                <div className="mt-2 space-y-1.5 animate-fade-in-up">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-semibold ${
                      passwordStrength.score <= 1
                        ? "text-red-400"
                        : passwordStrength.score <= 2
                        ? "text-amber-400"
                        : passwordStrength.score <= 3
                        ? "text-blue-400"
                        : "text-emerald-400"
                    }`}>
                      {passwordStrength.label}
                    </span>
                    <span className="text-slate-500">Use symbols, numbers & uppercase</span>
                  </div>
                </div>
              )}
            </div>

            {/* Seller Details */}
            {isSeller && (
              <div className="p-4 rounded-2xl glass-light border border-amber-500/20 space-y-3 animate-fade-in-up">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Store className="w-4 h-4" />
                  <span>Distributor Store Details</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Store / Company Name
                  </label>
                  <input
                    type="text"
                    required={isSeller}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Acme Industrial Supply"
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Business Entity Type
                  </label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="Distributor">Commercial Distributor</option>
                    <option value="Manufacturer">Manufacturer / Factory Direct</option>
                    <option value="Wholesaler">Wholesale Bulk Trader</option>
                    <option value="Supplier">Agricultural / Commodity Supplier</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 sm:py-3.5 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift bg-gradient-to-r ${
                isSeller
                  ? "from-amber-500 to-orange-500"
                  : "from-blue-600 to-indigo-600"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Enter Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/60">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
