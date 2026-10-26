"use client";

import React, { useState, useEffect } from "react";
import BuyerLayout from "@/components/buyer/BuyerLayout";
import { MapPin, Plus, Trash2, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function BuyerAddressesPage() {
  const { success, error } = useToast();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        success("Delivery address saved successfully!");
        setAddresses([data.address, ...addresses]);
        setShowAddModal(false);
        setForm({
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "United States",
          isDefault: false,
        });
      } else {
        error(data.error || "Failed to save address");
      }
    } catch (err) {
      error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/user/addresses?id=${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      success("Address removed");
    } catch (err) {
      error("Failed to delete address");
    }
  };

  return (
    <BuyerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Delivery Locations & Docks
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage pre-approved receiving bays, warehouse facilities, and regional corporate hubs.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-3">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <div>No saved delivery addresses found.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">{a.fullName}</span>
                    {a.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Primary Dock
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>{a.street}</div>
                    <div>
                      {a.city}, {a.state} {a.postalCode}
                    </div>
                    <div>{a.country}</div>
                    <div className="text-slate-400 mt-1 font-mono">{a.phone}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Address Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add New Shipping Location</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Facility / Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dallas Regional Warehouse Dock 4"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Street & Bay Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1200 Logistics Blvd"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dallas"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State / Postal *
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        required
                        placeholder="TX"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="75201"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Set as default receiving location</span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Save Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
