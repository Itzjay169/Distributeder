"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign,
  Package,
  MapPin,
  Calendar,
  Send,
  Search,
  Filter,
  Check,
  Building2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";

interface QuoteItem {
  id: string;
  rfqId: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  note?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  rfq?: {
    id: string;
    rfqNumber: string;
    title: string;
    category: string;
    quantity: number;
    deliveryLocation: string;
    buyer?: { name: string; email?: string };
  };
}

interface RFQItem {
  id: string;
  rfqNumber: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  targetPrice?: number | null;
  deliveryLocation: string;
  deadline?: string | null;
  status: string;
  createdAt: string;
  buyer?: { name: string; email?: string };
  _count?: { quotes: number };
  quotes?: QuoteItem[];
}

export default function SellerRfqPage() {
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [myQuotes, setMyQuotes] = useState<QuoteItem[]>([]);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"available" | "my-quotes">("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");

  // Bid form state (rfqId currently being quoted on)
  const [quotingRfqId, setQuotingRfqId] = useState<string | null>(null);
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [deliveryDays, setDeliveryDays] = useState<string>("5");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rfq?seller=true");
      if (res.ok) {
        const data = await res.json();
        setRfqs(data.rfqs || []);
        setMyQuotes(data.myQuotes || []);
        setSellerProfile(data.sellerProfile || null);
      } else {
        const err = await res.json();
        error(err.error || "Failed to load RFQs");
      }
    } catch (e) {
      console.error(e);
      error("Network error while loading RFQs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openQuoteModal = (rfq: RFQItem) => {
    if (!sellerProfile) {
      error("Please sign in with a Distributor account to submit commercial proposals.");
      return;
    }
    const existingQuote = rfq.quotes && rfq.quotes.length > 0 ? rfq.quotes[0] : null;
    if (existingQuote) {
      setUnitPrice(String(existingQuote.unitPrice));
      setDeliveryDays(String(existingQuote.deliveryDays));
      setNote(existingQuote.note || "");
    } else {
      setUnitPrice(rfq.targetPrice ? String(rfq.targetPrice) : "");
      setDeliveryDays("5");
      setNote("");
    }
    setQuotingRfqId(rfq.id);
  };

  const handleSubmitQuote = async (rfqId: string) => {
    const priceNum = parseFloat(unitPrice);
    if (!priceNum || priceNum <= 0) {
      error("Please enter a valid unit bid price.");
      return;
    }

    const daysNum = parseInt(deliveryDays);
    if (!daysNum || daysNum < 1) {
      error("Please provide valid delivery lead days.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rfq/${rfqId}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitPrice: priceNum,
          deliveryDays: daysNum,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Commercial proposal submitted successfully to the buyer!");
        setQuotingRfqId(null);
        fetchData();
      } else {
        error(data.error || "Failed to submit quote");
      }
    } catch (e) {
      console.error(e);
      error("Network error while submitting proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categories list derived from RFQs
  const categories = ["ALL", ...Array.from(new Set(rfqs.map((r) => r.category).filter(Boolean)))];

  // Filtering open RFQs
  const filteredRfqs = rfqs.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.deliveryLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtering my quotes
  const filteredQuotes = myQuotes.filter((q) => {
    const matchesSearch =
      (q.rfq?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.rfq?.rfqNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalOpenRfqs = rfqs.filter((r) => r.status === "OPEN").length;
  const totalQuotesSent = myQuotes.length;
  const acceptedQuotes = myQuotes.filter((q) => q.status === "ACCEPTED");
  const wonValue = acceptedQuotes.reduce((acc, q) => acc + (q.totalPrice || 0), 0);

  return (
    <SellerLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Commercial RFQs & Buyer Tenders
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Browse bulk procurement requests from verified buyers, submit binding quotes, and win wholesale contracts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 shadow-sm"
              title="Refresh tenders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/seller/products"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Catalog SKUs</span>
            </Link>
          </div>
        </div>

        {!isLoading && !sellerProfile && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                You are currently viewing tenders in guest/buyer view. To submit binding supplier proposals, please log in with your verified Distributor account.
              </span>
            </div>
            <Link
              href="/seller/login?callbackUrl=/seller/rfq"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0 text-center"
            >
              Log In as Distributor
            </Link>
          </div>
        )}

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover-lift">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Open Tenders</span>
              <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalOpenRfqs}</div>
            <div className="text-[11px] text-slate-500 mt-1">Available for bidding</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover-lift">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Submitted Quotes</span>
              <Send className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalQuotesSent}</div>
            <div className="text-[11px] text-slate-500 mt-1">Active proposals</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover-lift">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Accepted Deals</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{acceptedQuotes.length}</div>
            <div className="text-[11px] text-emerald-700/80 mt-1">Contracts secured</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover-lift">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Won Revenue</span>
              <DollarSign className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-700 truncate">
              {formatPrice(wonValue)}
            </div>
            <div className="text-[11px] text-purple-600/80 mt-1">Awarded contract total</div>
          </div>
        </div>

        {/* Navigation Tabs & Search Toolbar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab("available")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "available"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
                <span>Open Marketplace RFQs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {rfqs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("my-quotes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "my-quotes"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Send className="w-3.5 h-3.5 text-blue-500" />
                <span>My Submitted Quotes</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                  {myQuotes.length}
                </span>
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search RFQs, specs, docks..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Subfilters */}
          {activeTab === "available" ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-medium text-[11px] shrink-0">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl font-medium shrink-0 transition text-xs ${
                    selectedCategory === cat
                      ? "bg-amber-600 text-white font-bold shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-medium text-[11px] shrink-0">Quote Status:</span>
              {(["ALL", "PENDING", "ACCEPTED", "REJECTED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl font-medium shrink-0 transition text-xs ${
                    statusFilter === st
                      ? "bg-slate-900 text-white font-bold shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <div className="text-xs font-semibold text-slate-400">Loading procurement database...</div>
          </div>
        ) : activeTab === "available" ? (
          /* TAB 1: OPEN RFQs */
          filteredRfqs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700 text-sm">No open RFQs match your filters</div>
              <p className="max-w-md mx-auto text-slate-400 text-xs">
                Check back shortly or reset your search parameters. High-volume procurement RFQs are posted daily by institutional buyers.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredRfqs.map((rfq) => {
                const existingQuote = rfq.quotes && rfq.quotes.length > 0 ? rfq.quotes[0] : null;
                const isQuoting = quotingRfqId === rfq.id;

                return (
                  <div
                    key={rfq.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:border-amber-300 transition-all space-y-4"
                  >
                    {/* Top line: RFQ ID, Category, Status, Quotes Count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                          {rfq.rfqNumber}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          {rfq.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rfq.status === "OPEN"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {rfq.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(rfq.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">
                          {rfq._count?.quotes || 0} quotes received
                        </span>
                      </div>
                    </div>

                    {/* Middle: Title, Description, Requirements Badges */}
                    <div className="space-y-2">
                      <h2 className="text-lg font-bold text-slate-900">{rfq.title}</h2>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {rfq.description}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Required Quantity
                          </span>
                          <div className="text-sm font-extrabold text-slate-900">
                            {rfq.quantity.toLocaleString()} units
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Target Unit Price
                          </span>
                          <div className="text-sm font-extrabold text-slate-900">
                            {rfq.targetPrice ? formatPrice(rfq.targetPrice) : "Negotiable"}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>Destination</span>
                          </span>
                          <div className="text-xs font-semibold text-slate-800 truncate" title={rfq.deliveryLocation}>
                            {rfq.deliveryLocation}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Buyer Entity
                          </span>
                          <div className="text-xs font-semibold text-slate-800 truncate">
                            {rfq.buyer?.name || "Verified Enterprise Buyer"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Active quote status or Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {existingQuote ? (
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-950">
                                Your Submitted Proposal:
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  existingQuote.status === "ACCEPTED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : existingQuote.status === "REJECTED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-200 text-amber-900"
                                }`}
                              >
                                {existingQuote.status}
                              </span>
                            </div>
                            <div className="text-xs text-amber-900">
                              Bid: <strong>{formatPrice(existingQuote.unitPrice)}/unit</strong> (Total:{" "}
                              <strong>{formatPrice(existingQuote.totalPrice)}</strong>) • Lead time:{" "}
                              <strong>{existingQuote.deliveryDays} business days</strong>
                            </div>
                            {existingQuote.note && (
                              <div className="text-[11px] text-amber-800 italic">
                                Note: "{existingQuote.note}"
                              </div>
                            )}
                          </div>

                          {existingQuote.status === "PENDING" && (
                            <button
                              onClick={() => openQuoteModal(rfq)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0"
                            >
                              Update Proposal
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Direct supplier bids are evaluated upon arrival.
                          </span>
                          <button
                            onClick={() => openQuoteModal(rfq)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Quotation</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline Quotation Form */}
                    {isQuoting && (
                      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 animate-slide-down">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-amber-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                              Submit Commercial Bid for Tender {rfq.rfqNumber}
                            </h3>
                          </div>
                          <button
                            onClick={() => setQuotingRfqId(null)}
                            className="text-slate-400 hover:text-white text-xs"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Unit Price Bid (₹) *
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                                ₹
                              </span>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                placeholder="e.g. 450"
                                className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Required: {rfq.quantity.toLocaleString()} units • Estimated Total:{" "}
                              <strong className="text-amber-400">
                                {unitPrice && parseFloat(unitPrice) > 0
                                  ? formatPrice(parseFloat(unitPrice) * rfq.quantity)
                                  : "₹0.00"}
                              </strong>
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Guaranteed Delivery Lead Time (Days) *
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={deliveryDays}
                              onChange={(e) => setDeliveryDays(e.target.value)}
                              placeholder="e.g. 5"
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Door-to-door transit to {rfq.deliveryLocation}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Distributor Proposal Pitch & Terms (Optional)
                          </label>
                          <textarea
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add freight insurance details, tiered batch shipping, or packaging specs..."
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setQuotingRfqId(null)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSubmitQuote(rfq.id)}
                            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Submitting Proposal...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm & Submit Binding Quote</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* TAB 2: MY SUBMITTED QUOTES */
          filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-3">
              <Send className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700 text-sm">No quotes found</div>
              <p className="max-w-md mx-auto text-slate-400 text-xs">
                You haven't submitted quotes under this filter. Browse open RFQs and submit your wholesale proposals to start winning procurement orders!
              </p>
              <button
                onClick={() => {
                  setActiveTab("available");
                  setStatusFilter("ALL");
                }}
                className="inline-block px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs shadow"
              >
                Browse Open RFQs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((q) => (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl border p-6 shadow-sm transition space-y-4 ${
                    q.status === "ACCEPTED"
                      ? "border-emerald-300 bg-emerald-50/10"
                      : q.status === "REJECTED"
                      ? "border-red-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {q.rfq?.rfqNumber}
                        </span>
                        <span className="font-bold text-slate-900 text-base">{q.rfq?.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Category: {q.rfq?.category} • Quantity:{" "}
                        {q.rfq?.quantity?.toLocaleString()} units • Destination:{" "}
                        {q.rfq?.deliveryLocation}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                          q.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : q.status === "REJECTED"
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {q.status === "ACCEPTED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {q.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                        {q.status === "REJECTED" && <XCircle className="w-3.5 h-3.5" />}
                        <span>{q.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Financials & terms */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Unit Bid Price
                      </span>
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatPrice(q.unitPrice)}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Proposal Value
                      </span>
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatPrice(q.totalPrice)}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Delivery Lead Time
                      </span>
                      <div className="text-sm font-extrabold text-slate-900">
                        {q.deliveryDays} business days
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Submitted On
                      </span>
                      <div className="text-xs font-semibold text-slate-800">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {q.note && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700">Proposal Note: </span>
                      <span className="italic">"{q.note}"</span>
                    </div>
                  )}

                  {q.status === "ACCEPTED" && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold">🎉 Bid Accepted by Enterprise Buyer!</div>
                        <div className="text-emerald-700 text-[11px] mt-0.5">
                          Buyer has selected your commercial proposal for execution. Please check your incoming orders or coordinate freight delivery.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </SellerLayout>
  );
}
