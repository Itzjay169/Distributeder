import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2,
  Printer,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
} from "lucide-react";
import PrintInvoiceButton from "@/components/orders/PrintInvoiceButton";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          seller: { select: { storeName: true, storeSlug: true } },
        },
      },
      timeline: { orderBy: { createdAt: "asc" } },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order) {
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
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PACKED", label: "Packed & Crated" },
    { key: "SHIPPED", label: "Shipped & Transit" },
    { key: "DELIVERED", label: "Delivered at Dock" },
  ];

  const currentStatusIndex = timelineSteps.findIndex((s) => s.key === order.status);
  const activeIndex = currentStatusIndex !== -1 ? currentStatusIndex : 1;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        {/* Success Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Thank you for your business. Your procurement order{" "}
            <strong className="text-blue-600 font-mono">#{order.orderNumber}</strong> has been received and routed to suppliers.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <PrintInvoiceButton order={order} />
            <Link
              href={`/buyer/orders/${order.orderNumber}`}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery Status</span>
            </Link>
          </div>
        </div>

        {/* 5-Stage Timeline Tracker */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
            Fulfillment Progress Timeline
          </h2>

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
                        <span className="text-[10px] text-blue-500 font-medium">In Progress</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details & Items Breakdown (Printable Container) */}
        <div id="printable-order-invoice" className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="text-xl font-bold text-slate-900">Distributeder Commercial Invoice</div>
              <div className="text-xs text-slate-500 mt-1">
                Order Reference: <span className="font-mono font-bold text-slate-800">#{order.orderNumber}</span> •{" "}
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold inline-block">
                Status: {order.status}
              </span>
              <div className="text-slate-500 mt-1">
                Settlement: {order.paymentMethod === "CARD" ? "Card (Paid)" : "COD (Pending on Arrival)"}
              </div>
            </div>
          </div>

          {/* Destination & Buyer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 pb-4 border-b border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[11px]">
                Ship To Address:
              </span>
              <div className="text-slate-900 font-semibold">{shippingAddress.fullName || order.user.name}</div>
              <div>{shippingAddress.street}</div>
              <div>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </div>
              <div className="text-slate-500">{shippingAddress.phone || order.user.phone}</div>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[11px]">
                Billed Account:
              </span>
              <div className="text-slate-900 font-semibold">{order.user.name}</div>
              <div>{order.user.email}</div>
              <div className="mt-1">Carrier tracking: {order.trackingNumber || "Assigning freight manifest"}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Item Description</th>
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

          {/* Pricing Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{order.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-blue-600 font-medium">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-₹{order.discount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Freight Shipping:</span>
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
      </main>

      <Footer />
    </div>
  );
}
