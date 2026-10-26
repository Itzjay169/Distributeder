import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BuyerLayout from "@/components/buyer/BuyerLayout";
import PrintInvoiceButton from "@/components/orders/PrintInvoiceButton";
import {
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Package,
} from "lucide-react";

export default async function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          seller: { select: { storeName: true, storeSlug: true } },
        },
      },
      timeline: { orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  let shippingAddress: any = {};
  try {
    shippingAddress = JSON.parse(order.shippingAddress);
  } catch (e) {
    shippingAddress = { street: order.shippingAddress };
  }

  const timelineSteps = [
    { key: "PLACED", label: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed by Distributor" },
    { key: "PACKED", label: "Packed & Crated" },
    { key: "SHIPPED", label: "Shipped & In Transit" },
    { key: "DELIVERED", label: "Delivered at Dock" },
  ];

  const currentStatusIndex = timelineSteps.findIndex((s) => s.key === order.status);
  const activeIndex = currentStatusIndex !== -1 ? currentStatusIndex : 1;

  return (
    <BuyerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/buyer/orders"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PrintInvoiceButton order={order} />
          </div>
        </div>

        {/* 5-Stage Visual Stepper */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="relative">
            <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
            <div
              className="hidden sm:block absolute top-4 left-6 h-1 bg-emerald-600 -z-0 transition-all duration-500"
              style={{
                width: `${(activeIndex / (timelineSteps.length - 1)) * 100}%`,
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {timelineSteps.map((step, idx) => {
                const isCompleted = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow"
                          : "bg-slate-100 text-slate-400 border border-slate-300"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="text-left sm:text-center">
                      <div
                        className={`text-xs font-bold ${
                          isCurrent
                            ? "text-blue-600"
                            : isCompleted
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] text-blue-500 font-medium">Active Phase</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline Log & Address */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detailed Timeline Events (Left 7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Real-Time Status History</span>
            </h2>

            <div className="space-y-4 divide-y divide-slate-100">
              {order.timeline.map((evt) => (
                <div key={evt.id} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{evt.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(evt.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping snapshot (Right 5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Logistics Snapshot</span>
            </h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-800 block">Dock Delivery Address:</span>
                <div className="text-slate-900 font-medium">{shippingAddress.fullName || order.user.name}</div>
                <div>{shippingAddress.street}</div>
                <div>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </div>
                <div className="text-slate-500 mt-0.5">{shippingAddress.phone || order.user.phone}</div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block">Carrier Tracking:</span>
                <div className="font-mono text-blue-600 font-bold mt-0.5">
                  {order.trackingNumber || "Freight Waybill Pending"}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block">Payment Method:</span>
                <div className="text-slate-900 font-medium">
                  {order.paymentMethod === "CARD" ? "Demo Card (Paid in Full)" : "Cash on Delivery"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Item Breakdown Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Order Items Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Item</th>
                  <th className="py-2.5">Distributor</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-center">Quantity</th>
                  <th className="py-2.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-semibold text-slate-900">
                      <div>{item.title}</div>
                      {item.variant && (
                        <div className="text-[10px] text-blue-600 font-normal">{item.variant}</div>
                      )}
                    </td>
                    <td className="py-3 text-slate-500">{item.seller?.storeName}</td>
                    <td className="py-3 text-right font-mono">₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      ₹{item.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{order.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-blue-600 font-medium">
                  <span>Discount:</span>
                  <span className="font-mono">-₹{order.discount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Freight:</span>
                <span className="font-mono">₹{order.shippingCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (8%):</span>
                <span className="font-mono">₹{order.tax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                <span>Total Settled:</span>
                <span className="text-blue-600 font-mono">₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
