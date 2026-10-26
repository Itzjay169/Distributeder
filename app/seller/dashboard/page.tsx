import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Star,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  FileSpreadsheet,
} from "lucide-react";

export default async function SellerDashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/seller/login?callbackUrl=/seller/dashboard");
  }

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        include: { category: true },
        orderBy: { stock: "asc" },
      },
    },
  });

  if (!sellerProfile) {
    redirect("/buyer/dashboard");
  }

  // Fetch orders containing seller's products
  const orderItems = await prisma.orderItem.findMany({
    where: { sellerId: sellerProfile.id },
    include: {
      order: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  // Calculate gross sales
  const totalRevenue = orderItems.reduce((sum, item) => sum + item.total, 0);
  const lowStockProducts = sellerProfile.products.filter(
    (p) => p.stock <= p.lowStockThreshold
  );

  return (
    <SellerLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Supplier & Distributor Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Store: <strong className="text-slate-800">{sellerProfile.storeName}</strong> • {sellerProfile.companyType}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/seller/products"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Manage SKUs</span>
            </Link>
            <Link
              href={`/store/${sellerProfile.storeSlug}`}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              View Public Store
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 font-medium">Gross Distributor Sales</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-blue-600">
                {orderItems.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Total Orders Fulfilled</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {sellerProfile.products.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Active Warehouse SKUs</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {sellerProfile.rating.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 font-medium">Distributor Quality Score</div>
            </div>
          </div>
        </div>

        {/* Revenue Performance Visual Chart (Simulated SVG Chart) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Monthly Wholesale Settlement Volume (₹)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated from verified commercial invoice releases.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              +28.4% vs Last Quarter
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-6">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 border-b border-slate-200 pb-2">
              {[
                { month: "May", val: 680000, height: "40%" },
                { month: "Jun", val: 990000, height: "55%" },
                { month: "Jul", val: 1350000, height: "70%" },
                { month: "Aug", val: 1180000, height: "62%" },
                { month: "Sep", val: 1780000, height: "85%" },
                { month: "Oct", val: 2045000, height: "98%" },
              ].map((bar) => (
                <div key={bar.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                    ₹{(bar.val / 100000).toFixed(1)}L
                  </span>
                  <div
                    style={{ height: bar.height }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-xl group-hover:from-amber-500 group-hover:to-amber-300 transition shadow"
                  />
                  <span className="text-xs font-semibold text-slate-500">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Low Stock Alerts (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Inventory Alerts ({lowStockProducts.length})</span>
              </h2>
              <Link
                href="/seller/products"
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Manage
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                All inventory levels healthy. No low stock threshold alerts.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900 line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-slate-400">SKU: {p.sku || "N/A"}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Orders Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Incoming Requisitions</span>
              </h2>
              <Link
                href="/seller/orders"
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                View All
              </Link>
            </div>

            {orderItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No orders received yet. Products are live in the marketplace catalog.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orderItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                      <div className="text-[11px] text-slate-400">
                        Order #{item.order.orderNumber} • Buyer: {item.order.user.name} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        ₹{item.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-blue-600 font-semibold">
                        {item.order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
