"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SellerLayout from "@/components/seller/SellerLayout";
import { Store, ShieldCheck, Image as ImageIcon, Save, ExternalLink } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function SellerSettingsPage() {
  const { success, error } = useToast();

  const [form, setForm] = useState({
    storeName: "",
    storeSlug: "",
    storeDescription: "",
    companyType: "Distributor",
    businessAddress: "",
    taxId: "",
    logo: "",
    banner: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.sellerProfile) {
          const sp = data.user.sellerProfile;
          setForm({
            storeName: sp.storeName || "",
            storeSlug: sp.storeSlug || "",
            storeDescription: sp.storeDescription || "",
            companyType: sp.companyType || "Distributor",
            businessAddress: sp.businessAddress || "",
            taxId: sp.taxId || "",
            logo: sp.logo || "",
            banner: sp.banner || "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetMode: "SELLER",
          storeName: form.storeName,
          companyType: form.companyType,
        }),
      });

      if (res.ok) {
        success("Distributor store profile saved successfully!");
      } else {
        error("Failed to update store settings");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Distributor Storefront Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure your verified public profile, branding credentials, and corporate identity.
            </p>
          </div>

          {form.storeSlug && (
            <Link
              href={`/store/${form.storeSlug}`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow"
            >
              <span>View Live Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Store / Commercial Trading Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Entity Classification *
                </label>
                <select
                  value={form.companyType}
                  onChange={(e) => setForm({ ...form, companyType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Distributor">Authorized Commercial Distributor</option>
                  <option value="Manufacturer">Factory Direct Manufacturer</option>
                  <option value="Wholesaler">Wholesale Bulk Trader</option>
                  <option value="Supplier">Agricultural & Commodity Supplier</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Store Description & Fulfillment Credentials
              </label>
              <textarea
                rows={4}
                value={form.storeDescription}
                onChange={(e) => setForm({ ...form, storeDescription: e.target.value })}
                placeholder="Highlight your ISO certifications, annual export capacity, and logistics lead times..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Business Address
                </label>
                <input
                  type="text"
                  value={form.businessAddress}
                  onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                  placeholder="e.g. 450 Industrial Parkway, Chicago, IL"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Corporate Tax ID / EIN
                </label>
                <input
                  type="text"
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  placeholder="US-88291039"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Logo Image URL
                </label>
                <input
                  type="text"
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Banner Image URL
                </label>
                <input
                  type="text"
                  value={form.banner}
                  onChange={(e) => setForm({ ...form, banner: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Settings..." : "Save Storefront Profile"}</span>
            </button>
          </form>
        </div>
      </div>
    </SellerLayout>
  );
}
