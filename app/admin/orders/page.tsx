import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import { ShoppingBag, Truck, Printer, CheckCircle2 } from "lucide-react";
import PrintInvoiceButton from "@/components/orders/PrintInvoiceButton";

export default async function AdminOrdersPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/login?callbackUrl=/admin/orders");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: { seller: { select: { storeName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Orders, Escrow & Refund Oversight
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global ledger of requisitions, settlement status, and shipping milestones.
          </p>
        </div>

        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-4">Buyer Account</th>
                  <th className="py-3 px-4">Items / Distributors</th>
                  <th className="py-3 px-4 text-center">Payment Rail</th>
                  <th className="py-3 px-4 text-center">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Settled Amount</th>
                  <th className="py-3 px-4 text-right">Print Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-400">#{o.orderNumber}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{o.user.name}</div>
                      <div className="text-[10px] text-slate-400">{o.user.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-300">
                        {o.items.length} {o.items.length === 1 ? "item" : "items"}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">
                        {o.items.map((i) => i.seller?.storeName).filter(Boolean).join(", ")}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                        {o.paymentMethod} • {o.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-800">
                        {o.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                      ₹{o.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-block">
                        <PrintInvoiceButton order={o} />
                      </div>
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
