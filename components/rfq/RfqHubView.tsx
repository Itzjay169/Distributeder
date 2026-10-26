"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileSpreadsheet,
  Plus,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  Send,
  X,
  ShieldCheck,
  Building2,
  CheckCircle,
} from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";

interface RfqHubViewProps {
  initialRfqs: any[];
}

export default function RfqHubView({ initialRfqs }: RfqHubViewProps) {
  const { data: session } = useSession();
  const { formatPrice } = useCurrency();
  const { success, error, warning } = useToast();

  const [rfqs, setRfqs] = useState<any[]>(initialRfqs);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);

  // New RFQ Form
  const [rfqForm, setRfqForm] = useState({
    title: "",
    category: "Industrial Supplies",
    description: "",
    quantity: 100,
    targetPrice: "",
    deliveryLocation: "",
    deadline: "",
  });
  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);

  // Quote Form
  const [quoteForm, setQuoteForm] = useState({
    unitPrice: "",
    deliveryDays: 5,
    note: "",
  });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      error("Please sign in to submit a quote request.");
      return;
    }

    setIsSubmittingRfq(true);
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rfqForm),
      });

      const data = await res.json();
      if (res.ok) {
        success("RFQ posted successfully to the marketplace!");
        setRfqs([data.rfq, ...rfqs]);
        setCreateModalOpen(false);
        setRfqForm({
          title: "",
          category: "Industrial Supplies",
          description: "",
          quantity: 100,
          targetPrice: "",
          deliveryLocation: "",
          deadline: "",
        });
      } else {
        error(data.error || "Failed to post RFQ");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      error("Please sign in as a distributor to submit a quote.");
      return;
    }

    if (!selectedRfq) return;

    setIsSubmittingQuote(true);
    try {
      const res = await fetch(`/api/rfq/${selectedRfq.id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteForm),
      });

      const data = await res.json();
      if (res.ok) {
        success("Your binding quote has been transmitted to the buyer!");
        setQuoteModalOpen(false);
        setQuoteForm({ unitPrice: "", deliveryDays: 5, note: "" });
      } else {
        error(data.error || "Failed to submit quote");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Commercial Procurement Exchange</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Request for Quote (RFQ) Marketplace
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Buyers post customized volume requirements and certified suppliers submit competitive binding bids. Save up to 40% through direct tender bidding.
          </p>
        </div>

        <button
          onClick={() => {
            if (!session?.user) {
              error("Please sign in to post an RFQ.");
            } else {
              setCreateModalOpen(true);
            }
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Bulk RFQ</span>
        </button>
      </div>

      {/* RFQ Listings */}
      <div className="pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Active Procurement Requests ({rfqs.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                    {rfq.category}
                  </span>
                  <span className="font-mono text-slate-400">{rfq.rfqNumber}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {rfq.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {rfq.description}
                </p>

                {/* Key specs */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>
                      Required Qty: <strong className="text-slate-900">{rfq.quantity.toLocaleString()} units</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>
                      Target:{" "}
                      <strong className="text-slate-900">
                        {rfq.targetPrice ? formatPrice(rfq.targetPrice) + " / unit" : "Open Bid"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="truncate">{rfq.deliveryLocation}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>
                      {rfq.deadline
                        ? `Expires: ${new Date(rfq.deadline).toLocaleDateString()}`
                        : "Ongoing Requirement"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Posted by {rfq.buyer?.name || "Verified Enterprise Buyer"}
                </span>

                <button
                  onClick={() => {
                    setSelectedRfq(rfq);
                    setQuoteModalOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Binding Quote</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create RFQ Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create Procurement RFQ</h3>
              <button onClick={() => setCreateModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Procurement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5,000 meters 16mm Drip Irrigation Tubing"
                  value={rfqForm.title}
                  onChange={(e) => setRfqForm({ ...rfqForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Industry Category
                  </label>
                  <select
                    value={rfqForm.category}
                    onChange={(e) => setRfqForm({ ...rfqForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Industrial Supplies">Industrial Supplies</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Books">Books</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Required Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={rfqForm.quantity}
                    onChange={(e) =>
                      setRfqForm({ ...rfqForm, quantity: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional budget"
                    value={rfqForm.targetPrice}
                    onChange={(e) => setRfqForm({ ...rfqForm, targetPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Delivery Destination *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City, State / Port"
                    value={rfqForm.deliveryLocation}
                    onChange={(e) =>
                      setRfqForm({ ...rfqForm, deliveryLocation: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Technical Specifications & Scope *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail tolerances, certifications (ISO, CE, OMRI), packing specifications, and timeline requirements..."
                  value={rfqForm.description}
                  onChange={(e) => setRfqForm({ ...rfqForm, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRfq}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {isSubmittingRfq ? "Publishing..." : "Publish RFQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quote Submission Modal */}
      {quoteModalOpen && selectedRfq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{selectedRfq.rfqNumber}</span>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  Submit Quote for {selectedRfq.title}
                </h3>
              </div>
              <button onClick={() => setQuoteModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-4 pt-4">
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
                Buyer requested: <strong>{selectedRfq.quantity} units</strong> to {selectedRfq.deliveryLocation}.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 3750.00"
                    value={quoteForm.unitPrice}
                    onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quoteForm.deliveryDays}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, deliveryDays: parseInt(e.target.value) || 5 })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {quoteForm.unitPrice && (
                <div className="text-xs text-slate-700 font-semibold bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
                  Total Bid Value: {formatPrice(Number(quoteForm.unitPrice) * selectedRfq.quantity)}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supplier Proposal Note & Terms
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify warranty, certificate of origin, shipping method, and packaging inclusions..."
                  value={quoteForm.note}
                  onChange={(e) => setQuoteForm({ ...quoteForm, note: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {isSubmittingQuote ? "Sending..." : "Submit Binding Quote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
