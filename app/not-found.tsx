import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Boxes, ArrowLeft, Search, Home, Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 px-4 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-orange-100/30 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 md:p-12 shadow-xl shadow-slate-200/50 text-center max-w-lg mx-auto space-y-6">
          {/* Animated icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-3xl bg-blue-100/60 animate-ripple" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shadow-inner border border-blue-100/60">
              <Boxes className="w-9 h-9" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent tracking-tight">
              404
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              The catalog item, supplier storefront, or procurement page you&apos;re looking for has moved or is no longer listed.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover-lift"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover-lift"
            >
              <Package className="w-4 h-4" />
              <span>Explore Products</span>
            </Link>
          </div>

          {/* Quick links */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <Link href="/portals" className="hover:text-blue-600 transition-colors">
              Portal Hub
            </Link>
            <span className="text-slate-200">•</span>
            <Link href="/rfq" className="hover:text-orange-600 transition-colors">
              Submit RFQ
            </Link>
            <span className="text-slate-200">•</span>
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
