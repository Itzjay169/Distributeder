"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BuyerLayout from "@/components/buyer/BuyerLayout";
import { FileSpreadsheet, CheckCircle, XCircle, Clock, ShieldCheck, DollarSign } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function BuyerRfqPage() {
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [rfqs, setRfqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyRfqs = async () => {
    try {
      const res = await fetch("/api/rfq?mine=true");
      if (res.ok) {
        const data = await res.json();
        setRfqs(data.rfqs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRfqs();
  }, []);

  const handleUpdateQuoteStatus = async (rfqId: string, quoteId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/rfq/${rfqId}/quotes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId, status }),
      });

      const data = await res.json();
      if (res.ok) {
        success(`Quote has been marked as ${status.toLowerCase()}!`);
        fetchMyRfqs(); // Refresh
      } else {
        error(data.error || "Failed to update quote");
      }
    } catch (err) {
      error("Network error");
    }
  };

  return (
    <BuyerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Request for Quotes (RFQs)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review binding proposals and delivery lead times submitted by verified distributors.
            </p>
          </div>

          <Link
            href="/rfq"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Post Another RFQ
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your tenders...</div>
        ) : rfqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
            <div>You have not published any custom RFQs yet.</div>
            <Link
              href="/rfq"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
            >
              Post an RFQ Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{rfq.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rfq.status === "FULFILLED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Tender #{rfq.rfqNumber} • Required: {rfq.quantity.toLocaleString()} units to{" "}
                      {rfq.deliveryLocation}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    {rfq.quotes?.length || 0} Quotes Received
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rfq.description}</p>

                {/* Received quotes cards */}
                <div className="pt-2 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Supplier Bids & Proposals:
                  </h3>

                  {(!rfq.quotes || rfq.quotes.length === 0) ? (
                    <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-500 text-center">
                      No quotes submitted yet. Verified distributors are reviewing your specification.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rfq.quotes.map((q: any) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {q.seller?.storeName}
                              </span>
                              {q.seller?.isVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  q.status === "ACCEPTED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : q.status === "REJECTED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {q.status}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600">
                              Unit Bid: <strong className="text-slate-900 font-bold">{formatPrice(q.unitPrice)}</strong>{" "}
                              • Total: <strong>{formatPrice(q.totalPrice)}</strong> • Lead Time:{" "}
                              <strong>{q.deliveryDays} business days</strong>
                            </div>

                            {q.note && (
                              <p className="text-xs text-slate-500 italic">"{q.note}"</p>
                            )}
                          </div>

                          {/* Accept / Reject Buttons */}
                          {q.status === "PENDING" && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleUpdateQuoteStatus(rfq.id, q.id, "ACCEPTED")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Accept Bid</span>
                              </button>
                              <button
                                onClick={() => handleUpdateQuoteStatus(rfq.id, q.id, "REJECTED")}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 rounded-xl text-xs font-semibold transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
