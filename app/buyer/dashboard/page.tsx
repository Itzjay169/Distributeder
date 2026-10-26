import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BuyerLayout from "@/components/buyer/BuyerLayout";
import {
  ShoppingBag,
  Truck,
  Heart,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function BuyerDashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/buyer/login?callbackUrl=/buyer/dashboard");
  }

  const [orders, wishlistCount, rfqsCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            seller: { select: { storeName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
    prisma.rFQ.count({ where: { buyerId: session.user.id } }),
  ]);

  const activeOrders = orders.filter((o) =>
    ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"].includes(o.status)
  );

  const totalSpent = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <BuyerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Procurement Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your commercial orders, active shipments, and tender RFQs.
          </p>
        </div>

        {/* 4 Overview Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{orders.length}</div>
              <div className="text-xs text-slate-500 font-medium">Total Orders Placed</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{activeOrders.length}</div>
              <div className="text-xs text-slate-500 font-medium">In-Transit Shipments</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{wishlistCount}</div>
              <div className="text-xs text-slate-500 font-medium">Saved Items</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-slate-500 font-medium">Total Volume Settled</div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Procurement Orders</h2>
            <Link
              href="/buyer/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <div>No orders placed yet. Start sourcing from verified suppliers.</div>
              <Link
                href="/products"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5">Order Number</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Items</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Total</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => {
                    const statusColors = {
                      PLACED: "bg-blue-100 text-blue-800",
                      CONFIRMED: "bg-indigo-100 text-indigo-800",
                      PACKED: "bg-amber-100 text-amber-800",
                      SHIPPED: "bg-purple-100 text-purple-800",
                      DELIVERED: "bg-emerald-100 text-emerald-800",
                      CANCELLED: "bg-red-100 text-red-800",
                      RETURNED: "bg-slate-100 text-slate-800",
                    }[o.status] || "bg-slate-100 text-slate-800";

                    return (
                      <tr key={o.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-mono font-bold text-blue-600">
                          <Link href={`/buyer/orders/${o.orderNumber}`} className="hover:underline">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-medium">
                          {o.items.length} {o.items.length === 1 ? "item" : "items"}
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900">
                          ₹{o.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/buyer/orders/${o.orderNumber}`}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  );
}
