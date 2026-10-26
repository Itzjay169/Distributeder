"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  DollarSign,
  Settings,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/seller/dashboard", label: "Supplier Overview", icon: LayoutDashboard },
    { href: "/seller/products", label: "Inventory & SKUs", icon: Package },
    { href: "/seller/orders", label: "Incoming Orders", icon: ShoppingBag },
    { href: "/seller/rfq", label: "Marketplace RFQs & Quotes", icon: FileSpreadsheet },
    { href: "/seller/payouts", label: "Earnings & Wire Payouts", icon: DollarSign },
    { href: "/seller/settings", label: "Storefront & Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Seller Navigation Sidebar (3 cols) */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100" suppressHydrationWarning>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-base font-bold shadow-md shadow-amber-500/20" suppressHydrationWarning>
                  {session?.user?.name?.charAt(0) || "S"}
                </div>
                <div className="overflow-hidden" suppressHydrationWarning>
                  <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                    <span>Distributor Portal</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-400 truncate" suppressHydrationWarning>
                    {session?.user?.name || "Verified Distributor"}
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
                          ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Dashboard Content Area (9 cols) */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
