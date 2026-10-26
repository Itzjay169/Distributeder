import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BuyerLayout from "@/components/buyer/BuyerLayout";
import { ShoppingBag, Truck, CheckCircle2, ChevronRight, Package, Printer } from "lucide-react";

export default async function BuyerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/buyer/login?callbackUrl=/buyer/orders");
  }

  const { status: statusFilter } = await searchParams;

  const where: any = { userId: session.user.id };
  if (statusFilter === "active") {
    where.status = { in: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"] };
  } else if (statusFilter === "delivered") {
    where.status = "DELIVERED";
  } else if (statusFilter === "cancelled") {
    where.status = { in: ["CANCELLED", "RETURNED"] };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          seller: { select: { storeName: true, storeSlug: true } },
        },
      },
      timeline: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tabs = [
    { key: "all", label: "All Orders", href: "/buyer/orders" },
    { key: "active", label: "Active & In Transit", href: "/buyer/orders?status=active" },
    { key: "delivered", label: "Delivered", href: "/buyer/orders?status=delivered" },
    { key: "cancelled", label: "Cancelled / Returned", href: "/buyer/orders?status=cancelled" },
  ];

  const currentTab = statusFilter || "all";

  return (
    <BuyerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Orders & Shipments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track shipment manifests, review delivery statuses, and download VAT invoices.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Order Cards List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <div>No orders match the selected filter.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
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
                <div
                  key={o.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          #{o.orderNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Placed on {new Date(o.createdAt).toLocaleDateString()} • Payment: {o.paymentMethod === "CARD" ? "Card Verified" : "COD"}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-slate-900">
                        ₹{o.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {o.items.length} {o.items.length === 1 ? "item" : "items"}
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="space-y-3">
                    {o.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 line-clamp-1">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Qty: {item.quantity} • Seller: {item.seller?.storeName}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-slate-800 shrink-0">
                          ₹{item.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {o.trackingNumber ? (
                        <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Tracking: {o.trackingNumber}</span>
                        </span>
                      ) : (
                        <span>Carrier booking in progress</span>
                      )}
                    </div>

                    <Link
                      href={`/buyer/orders/${o.orderNumber}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span>Track & Invoice</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
