"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  AlertTriangle,
  Download,
  Store,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/admin/dashboard", label: "Executive Analytics", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Accounts & Bans", icon: Users },
    { href: "/admin/sellers", label: "Seller Moderation & Badges", icon: ShieldCheck },
    { href: "/admin/orders", label: "Platform Orders & Refunds", icon: ShoppingBag },
    { href: "/admin/disputes", label: "Disputes & Reports", icon: AlertTriangle },
    { href: "/admin/settings", label: "Platform Parameters", icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Admin Navigation Sidebar (3 cols) */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-rose-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-white text-sm truncate flex items-center gap-1">
                    <span>Admin Control</span>
                  </div>
                  <div className="text-[11px] text-rose-400 font-semibold truncate">
                    Master Superuser
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold"
                          : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* CSV Export Quick Action */}
              <div className="pt-2 border-t border-slate-800">
                <a
                  href="/api/admin/reports/csv"
                  download
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download Sales CSV</span>
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">.csv</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Main Admin Content (9 cols) */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
