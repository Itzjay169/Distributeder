"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  Printer,
  ChevronDown,
  CheckCircle2,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import PrintInvoiceButton from "@/components/orders/PrintInvoiceButton";

interface SellerOrdersManagerProps {
  initialOrderItems: any[];
}

export default function SellerOrdersManager({ initialOrderItems }: SellerOrdersManagerProps) {
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [orderItems, setOrderItems] = useState<any[]>(initialOrderItems);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("SHIPPED");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusDescription, setStatusDescription] = useState("");

  const handleStatusChange = async (order: any, targetStatus: string) => {
    if (targetStatus === "SHIPPED") {
      setSelectedOrder(order);
      setNewStatus("SHIPPED");
      setTrackingNumber(order.trackingNumber || "");
      setStatusDescription("Package dispatched via carrier freight with tracking manifest.");
      setTrackingModalOpen(true);
      return;
    }

    await executeStatusUpdate(order.id, targetStatus, undefined, undefined);
  };

  const executeStatusUpdate = async (
    orderId: string,
    status: string,
    tracking?: string,
    description?: string
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: tracking,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success(`Order status updated to ${status}!`);
        setOrderItems((prev) =>
          prev.map((item) =>
            item.order.id === orderId
              ? {
                  ...item,
                  order: {
                    ...item.order,
                    status,
                    trackingNumber: tracking || item.order.trackingNumber,
                  },
                }
              : item
          )
        );
        setTrackingModalOpen(false);
      } else {
        error(data.error || "Failed to update status");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Incoming Orders & Packing Slips
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review buyer purchase requisitions, dispatch shipments, update freight manifests, and print packing slips.
        </p>
      </div>

      {orderItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <div>No incoming orders for your store inventory yet.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {orderItems.map((item) => {
            const order = item.order;
            let address: any = {};
            try {
              address = JSON.parse(order.shippingAddress);
            } catch (e) {
              address = { street: order.shippingAddress };
            }

            const statusColorMap: Record<string, string> = {
              PLACED: "bg-blue-100 text-blue-800",
              CONFIRMED: "bg-indigo-100 text-indigo-800",
              PACKED: "bg-amber-100 text-amber-800",
              SHIPPED: "bg-purple-100 text-purple-800",
              DELIVERED: "bg-emerald-100 text-emerald-800",
              CANCELLED: "bg-red-100 text-red-800",
              RETURNED: "bg-slate-100 text-slate-800",
            };
            const statusColors = statusColorMap[order.status as string] || "bg-slate-100 text-slate-800";

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        Order #{order.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Buyer: <strong className="text-slate-700">{order.user.name}</strong> (
                      {order.user.email}) • Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <PrintInvoiceButton order={order} />

                    {/* Status Update Dropdown */}
                    <select
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Item Details */}
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border shrink-0"
                      />
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">
                        Quantity ordered: <strong>{item.quantity} units</strong> @ {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {formatPrice(item.total)}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Payment: {order.paymentMethod === "CARD" ? "Card Verified" : "COD"}
                    </span>
                  </div>
                </div>

                {/* Delivery Bay Info */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Ship to: {address.fullName || order.user.name}, {address.street}, {address.city} {address.state} ({address.phone || order.user.phone})
                    </span>
                  </div>

                  {order.trackingNumber && (
                    <div className="font-mono text-blue-600 font-bold shrink-0">
                      Tracking: {order.trackingNumber}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking Manifest Modal */}
      {trackingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Dispatch Shipment #{selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setTrackingModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeStatusUpdate(
                  selectedOrder.id,
                  newStatus,
                  trackingNumber,
                  statusDescription
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Carrier Tracking / Waybill Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRK-FEDEX-992144 or TRK-UPS-772183"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Timeline Description
                </label>
                <input
                  type="text"
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  Confirm Shipment Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
