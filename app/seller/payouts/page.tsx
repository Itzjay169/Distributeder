import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SellerLayout from "@/components/seller/SellerLayout";
import { DollarSign, CheckCircle2, ArrowDownToLine, Building2, ShieldCheck } from "lucide-react";

export default async function SellerPayoutsPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/seller/login?callbackUrl=/seller/payouts");
  }

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      payouts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!sellerProfile) {
    redirect("/buyer/dashboard");
  }

  const totalWithdrawn = sellerProfile.payouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Earnings & Settlement Wire Payouts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track released escrow funds, commercial ACH transfers, and bank wire records.
          </p>
        </div>

        {/* 3 Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Withdrawable Balance
            </div>
            <div className="text-3xl font-black text-emerald-600">
              ₹{sellerProfile.balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400">Ready for instant ACH wire transfer</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Lifetime Disbursed
            </div>
            <div className="text-3xl font-black text-slate-900">
              ₹{totalWithdrawn.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400">Processed to verified business account</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform Commission Rate
            </div>
            <div className="text-3xl font-black text-blue-600">5.0%</div>
            <div className="text-[11px] text-slate-400">Standard verified distributor tier</div>
          </div>
        </div>

        {/* Simulated Payout Records Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Simulated Bank Wire Transfer Records</span>
            </h2>

            <button
              type="button"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Request Wire Transfer (Demo)</span>
            </button>
          </div>

          {sellerProfile.payouts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No wire transfers requested yet. Funds accumulate automatically as orders are delivered.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Transfer Date</th>
                    <th className="py-3 px-4">Wire Reference</th>
                    <th className="py-3 px-4">Payment Rail</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Disbursed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerProfile.payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {p.reference}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.method}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1 w-fit mx-auto">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                        +₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
