"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Sliders, Save, Check } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminSettingsPage() {
  const { success, error } = useToast();

  const [form, setForm] = useState({
    commission_rate: "5.0",
    default_tax_rate: "8.0",
    platform_currency: "USD",
    platform_name: "Distributeder",
    contact_email: "support@distributeder.com",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setForm(data.settings);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        success("Platform configuration parameters saved!");
      } else {
        error("Failed to update settings");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Platform Parameters & Commercial Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global market commission, fiscal taxation, base ledger currency, and escalation routing.
          </p>
        </div>

        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Distributor Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={form.commission_rate}
                  onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-[10px] text-slate-500">
                  Platform fee deducted from supplier balance on order completion.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Default Platform Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  required
                  value={form.default_tax_rate}
                  onChange={(e) => setForm({ ...form, default_tax_rate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-[10px] text-slate-500">
                  Standard VAT / sales tax automatically added at checkout.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Base Platform Currency
                </label>
                <select
                  value={form.platform_currency}
                  onChange={(e) => setForm({ ...form, platform_currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Platform Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={form.platform_name}
                  onChange={(e) => setForm({ ...form, platform_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Support & Escalation Contact Email
              </label>
              <input
                type="email"
                required
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Parameters..." : "Save Platform Parameters"}</span>
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
