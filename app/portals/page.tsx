"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  ShieldCheck,
  Building2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  Key,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";

type RoleFilter = "ALL" | "BUYER" | "SELLER" | "ADMIN";
type ViewMode = "OVERVIEW" | "CREDENTIALS";

export default function PortalsDirectoryPage() {
  const [activeFilter, setActiveFilter] = useState<RoleFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("OVERVIEW");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const portals = [
    {
      id: "buyer",
      role: "BUYER",
      name: "Enterprise Buyer Portal",
      tagline: "Procurement, RFQ Bidding & Bulk Purchasing",
      badge: "Procurement & Corporate Accounts",
      badgeColor: "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/10",
      description:
        "Dedicated workspace for enterprise buyers, retail procurement managers, and wholesale sourcing teams across India.",
      icon: ShoppingBag,
      accentColor: "from-blue-600 via-indigo-600 to-cyan-500",
      glowColor: "group-hover:shadow-[0_0_50px_rgba(37,99,235,0.25)]",
      borderColor: "border-blue-500/20 group-hover:border-blue-500/60",
      loginUrl: "/buyer/login",
      dashboardUrl: "/buyer/dashboard",
      stats: [
        { label: "Catalog SKUs", value: "40+ Lines" },
        { label: "Currency", value: "INR (₹)" },
        { label: "Discounts", value: "Tiered MOQ" },
      ],
      features: [
        "Browse verified wholesale product catalogs with MOQ tiers",
        "Publish custom RFQs and negotiate directly with verified suppliers",
        "Volume-based wholesale price tier discounts (up to 20% off)",
        "Live Blue Dart & Delhivery tracking with downloadable GST invoices",
        "Dedicated multi-warehouse delivery dock address management",
      ],
      sampleEmail: "buyer1@primeretail.com",
      samplePass: "Distributeder#Buyer2026!",
      personaName: "Prime Retailers Ltd.",
      buttonBg: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30",
    },
    {
      id: "seller",
      role: "SELLER",
      name: "Distributor & Seller Portal",
      tagline: "Inventory, Tier Pricing & Dispatch Center",
      badge: "Wholesalers & Manufacturers",
      badgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10",
      description:
        "Full-suite distributor portal for managing wholesale inventories, MOQ rules, freight dispatches, and ledger payouts.",
      icon: Building2,
      accentColor: "from-amber-500 via-orange-600 to-yellow-500",
      glowColor: "group-hover:shadow-[0_0_50px_rgba(245,158,11,0.25)]",
      borderColor: "border-amber-500/20 group-hover:border-amber-500/60",
      loginUrl: "/seller/login",
      dashboardUrl: "/seller/dashboard",
      stats: [
        { label: "Fulfillment", value: "Instant Waybill" },
        { label: "Settlements", value: "RTGS / NEFT" },
        { label: "Sync", value: "CSV Bulk Import" },
      ],
      features: [
        "Direct catalog management with high-res multi-image uploads",
        "Automated tiered wholesale discounts (custom MOQ thresholds)",
        "Instant shipment fulfillment with carrier waybill generation",
        "Real-time ledger payouts & financial revenue analytics",
        "Direct buyer messaging & quote response module",
      ],
      sampleEmail: "seller1@apexhardware.com",
      samplePass: "Distributeder#Seller2026!",
      personaName: "Apex Industrial Supply",
      buttonBg: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30",
    },
    {
      id: "admin",
      role: "ADMIN",
      name: "Admin Control Center",
      tagline: "Platform Governance, Audits & GMV Analytics",
      badge: "Restricted Executive Governance",
      badgeColor: "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10",
      description:
        "Executive oversight suite for platform administration, distributor verification audits, dispute arbitration, and platform ledger.",
      icon: ShieldCheck,
      accentColor: "from-rose-600 via-red-600 to-rose-700",
      glowColor: "group-hover:shadow-[0_0_50px_rgba(225,29,72,0.25)]",
      borderColor: "border-rose-500/20 group-hover:border-rose-500/60",
      loginUrl: "/admin/login",
      dashboardUrl: "/admin/dashboard",
      stats: [
        { label: "Oversight", value: "Full GMV" },
        { label: "Audits", value: "Live KYC" },
        { label: "Security", value: "Isolated ACL" },
      ],
      features: [
        "Gross Merchandise Value (GMV) & platform commission tracking",
        "Distributor onboarding review & verification badge approval",
        "Dispute arbitration, ticket resolution & refund governance",
        "Platform-wide currency (₹), tax rates & commission controls",
        "Complete user audit ledger with instant account suspension tools",
      ],
      sampleEmail: "admin@distributeder.com",
      samplePass: "Distributeder#Admin2026!",
      personaName: "Platform Governance Team",
      buttonBg: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30",
    },
  ];

  const filteredPortals = portals.filter(
    (p) => activeFilter === "ALL" || p.role === activeFilter
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-rose-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 px-2">
          <Link href="/" className="inline-flex items-center gap-3 group transition transform active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 p-0.5 shadow-xl group-hover:scale-105 group-hover:rotate-2 transition duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Boxes className="w-6 h-6 text-blue-400 group-hover:text-orange-400 transition" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white block">
                Distributeder
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
                Role-Specialized B2B Workspace Hub
              </span>
            </div>
          </Link>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10 mb-3 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>All 3 Gateway Portals Operational & Secure</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Select Your Authorized Portal
            </h1>
            <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Distributeder provides strictly separated, role-based environments. Log in directly with your assigned User ID and Password.
            </p>
          </div>

          {/* Interactive Controls Bar: Filter & View Mode */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            {/* Role Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner w-full sm:w-auto overflow-x-auto no-scrollbar">
              {[
                { id: "ALL", label: "All Portals" },
                { id: "BUYER", label: "Buyer" },
                { id: "SELLER", label: "Distributor" },
                { id: "ADMIN", label: "Admin" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as RoleFilter)}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    activeFilter === tab.id
                      ? "bg-slate-800 text-white shadow-md shadow-black/40 scale-100"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("OVERVIEW")}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  viewMode === "OVERVIEW"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Feature Matrix</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("CREDENTIALS")}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  viewMode === "CREDENTIALS"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Quick Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Interactive Portal Cards (Responsive Grid: 1 col on mobile, 2 col on tablet if filtered, 3 col on desktop) */}
        <div
          className={`grid gap-6 sm:gap-8 ${
            filteredPortals.length === 1
              ? "max-w-xl mx-auto grid-cols-1"
              : filteredPortals.length === 2
              ? "max-w-4xl mx-auto grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filteredPortals.map((portal) => {
            const Icon = portal.icon;
            const isCopied = copiedId === portal.id;

            return (
              <div
                key={portal.id}
                className={`group relative bg-slate-900/80 border ${portal.borderColor} rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${portal.glowColor} backdrop-blur-xl overflow-hidden`}
              >
                {/* Radiant top gradient edge */}
                <div
                  className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${portal.accentColor} opacity-70 group-hover:opacity-100 transition duration-300`}
                />

                {/* Subtle card watermark background icon */}
                <Icon className="absolute -right-6 -bottom-6 w-36 h-36 text-slate-800/20 pointer-events-none group-hover:scale-110 group-hover:text-slate-800/30 transition duration-500" />

                <div className="space-y-6 relative z-10">
                  {/* Badge & Icon Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${portal.accentColor} p-0.5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition duration-300 shrink-0`}
                    >
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase shadow-sm ${portal.badgeColor}`}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-slate-100 transition">
                      {portal.name}
                    </h2>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      {portal.tagline}
                    </p>
                    <p className="text-xs text-slate-400/90 mt-2.5 leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
                    {portal.stats.map((stat, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {stat.label}
                        </span>
                        <span className="text-xs font-black text-slate-200 block truncate">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic View: Feature Matrix vs Quick Credentials */}
                  {viewMode === "OVERVIEW" ? (
                    <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block flex items-center justify-between">
                        <span>Workspace Highlights:</span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Live
                        </span>
                      </span>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {portal.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 group/item">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover/item:scale-110 transition" />
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Authorized Demo Persona:
                          </span>
                          <span className="text-[11px] font-bold text-white">
                            {portal.personaName}
                          </span>
                        </div>

                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-slate-400 text-[11px]">ID:</span>
                            <span className="text-slate-200 select-all font-semibold">
                              {portal.sampleEmail}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-slate-400 text-[11px]">Password:</span>
                            <span className="text-amber-300 select-all font-semibold">
                              {portal.samplePass}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `${portal.sampleEmail}\n${portal.samplePass}`,
                              portal.id
                            )
                          }
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Credentials Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy ID & Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-3 relative z-10">
                  {/* Subtle credentials preview if in overview mode */}
                  {viewMode === "OVERVIEW" && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
                      <div className="truncate mr-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Quick Demo ID:
                        </span>
                        <span className="font-mono text-slate-300 text-xs truncate block">
                          {portal.sampleEmail}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `${portal.sampleEmail}\n${portal.samplePass}`,
                            portal.id
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
                        title="Copy credentials"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Primary CTA Button */}
                  <Link
                    href={portal.loginUrl}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-98 cursor-pointer ${portal.buttonBg}`}
                  >
                    <span>Launch {portal.name.split(" ")[0]} Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition duration-300" />
                  </Link>

                  {/* Secondary Direct Link */}
                  <Link
                    href={portal.dashboardUrl}
                    className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition py-1 flex items-center justify-center gap-1 group/dash"
                  >
                    <span>Already authorized? Go straight to Dashboard</span>
                    <ExternalLink className="w-3 h-3 group-hover/dash:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & System Assurance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Strict Role Isolation</span>
              <span className="text-[11px] text-slate-400 block">No shared mode cross-access</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Indian Rupee (₹) Native</span>
              <span className="text-[11px] text-slate-400 block">INR pricing, GST & invoice auto-sync</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Breach-Free Passwords</span>
              <span className="text-[11px] text-slate-400 block">Strong entropy auth protection</span>
            </div>
          </div>
        </div>

        {/* Global Alternate Sign In Banner */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Unified Access Option
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Prefer signing in through a single multi-role form?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              You can also use our Global Sign-In page, which automatically identifies your privileges and routes you directly into your portal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition text-center shadow"
            >
              Universal Sign In
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition text-center shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
