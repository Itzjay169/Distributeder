import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  DollarSign,
  TrendingUp,
  Users,
  ShoppingBag,
  Store,
  AlertTriangle,
  Download,
  ShieldCheck,
  Package,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/login?callbackUrl=/admin/dashboard");
  }

  const [
    usersCount,
    sellersCount,
    productsCount,
    orders,
    categoriesWithCount,
    recentOrders,
    openDisputesCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count(),
    prisma.product.count(),
    prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { products: { _count: "desc" } },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
    prisma.disputeReport.count({ where: { status: "OPEN" } }),
  ]);

  const gmv = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const platformRevenue = gmv * 0.05;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Executive Analytics & Oversight
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Global marketplace throughput, transaction settlement, and platform operations.
            </p>
          </div>

          <a
            href="/api/admin/reports/csv"
            download
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Export Transaction Ledger (CSV)</span>
          </a>
        </div>

        {/* 6 Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Gross Merchandise Value (GMV)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">₹{gmv.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-slate-500">Total transaction throughput</div>
          </div>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Platform Commission (5%)</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-blue-400">
              ₹{platformRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500">Retained marketplace fee revenue</div>
          </div>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Orders Executed</span>
              <ShoppingBag className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400">{orders.length}</div>
            <div className="text-[11px] text-slate-500">Commercial requisitions fulfilled</div>
          </div>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Verified Distributors</span>
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{sellersCount}</div>
            <div className="text-[11px] text-slate-500">Active supply manufacturers</div>
          </div>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Registered Users</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-indigo-400">{usersCount}</div>
            <div className="text-[11px] text-slate-500">Buyers, traders, and suppliers</div>
          </div>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Open Disputes / Reports</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-black text-rose-400">{openDisputesCount}</div>
            <div className="text-[11px] text-slate-500">Requires administrative attention</div>
          </div>
        </div>

        {/* Visual Monthly Revenue & Sector Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Revenue Chart (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Quarterly GMV Trajectory (₹)
            </h2>
            <div className="pt-6">
              <div className="grid grid-cols-6 gap-3 items-end h-44 border-b border-slate-800 pb-2">
                {[
                  { month: "May", val: 12400, h: "35%" },
                  { month: "Jun", val: 18900, h: "50%" },
                  { month: "Jul", val: 24500, h: "65%" },
                  { month: "Aug", val: 32100, h: "78%" },
                  { month: "Sep", val: 41200, h: "90%" },
                  { month: "Oct", val: 52400, h: "100%" },
                ].map((b) => (
                  <div key={b.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      ₹{(b.val / 1000).toFixed(1)}k
                    </span>
                    <div
                      style={{ height: b.h }}
                      className="w-full bg-gradient-to-t from-blue-700 to-indigo-500 rounded-t-lg group-hover:from-blue-600 group-hover:to-indigo-400 transition"
                    />
                    <span className="text-[11px] text-slate-400 font-semibold">{b.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Distribution (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Category Distribution
            </h2>
            <div className="space-y-2.5">
              {categoriesWithCount.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{c.name}</span>
                    <span className="text-slate-400 font-mono">{c._count.products} SKUs</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (c._count.products / (productsCount || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Transactions Ledger
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              Manage Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Order Number</th>
                  <th className="py-2.5">Buyer</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Items</th>
                  <th className="py-2.5 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 font-mono font-bold text-blue-400">#{o.orderNumber}</td>
                    <td className="py-3">{o.user.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{o.items.length} items</td>
                    <td className="py-3 text-right font-mono font-bold text-white">
                      ₹{o.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
