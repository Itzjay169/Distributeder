"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Store, ShieldCheck, Check, X, Star, ExternalLink } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminSellersPage() {
  const { success, error } = useToast();
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSellers = async () => {
    try {
      const res = await fetch("/api/admin/sellers");
      if (res.ok) {
        const data = await res.json();
        setSellers(data.sellers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleToggleVerified = async (sellerId: string, currentVerified: boolean) => {
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, isVerified: !currentVerified }),
      });

      if (res.ok) {
        success(`Distributor verification badge ${!currentVerified ? "awarded" : "revoked"}.`);
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerId ? { ...s, isVerified: !currentVerified } : s))
        );
      } else {
        error("Failed to update status");
      }
    } catch (err) {
      error("Network error");
    }
  };

  const handleToggleApproved = async (sellerId: string, currentApproved: boolean) => {
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, isApproved: !currentApproved }),
      });

      if (res.ok) {
        success(`Seller application status set to ${!currentApproved ? "Approved" : "Under Review"}.`);
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerId ? { ...s, isApproved: !currentApproved } : s))
        );
      } else {
        error("Failed to update status");
      }
    } catch (err) {
      error("Network error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Seller Moderation & Verification Badges
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Vetting commercial distributors, approving marketplace stores, and issuing trusted supplier badges.
          </p>
        </div>

        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Store & Company</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Fulfilled</th>
                  <th className="py-3 px-4 text-center">Verification Badge</th>
                  <th className="py-3 px-4 text-center">Approval Status</th>
                  <th className="py-3 px-4 text-right">Storefront</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{s.storeName}</span>
                        {s.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Owner: {s.user?.name} ({s.user?.email})
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400">{s.companyType}</td>

                    <td className="py-3 px-4 text-center font-bold text-amber-400">
                      {s.rating.toFixed(2)} ★
                    </td>

                    <td className="py-3 px-4 text-center font-mono">{s.totalSales}</td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleVerified(s.id, s.isVerified)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          s.isVerified
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                            : "bg-slate-900 text-slate-500 border border-slate-800 hover:text-white"
                        }`}
                      >
                        {s.isVerified ? "✓ Verified" : "+ Grant Badge"}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleApproved(s.id, s.isApproved)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          s.isApproved
                            ? "bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900"
                            : "bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900"
                        }`}
                      >
                        {s.isApproved ? "Approved" : "Review Pending"}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/store/${s.storeSlug}`}
                        target="_blank"
                        className="p-1.5 inline-flex text-slate-400 hover:text-blue-400 transition"
                        title="Open Storefront"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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
