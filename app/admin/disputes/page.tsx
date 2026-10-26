"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminDisputesPage() {
  const { success, error } = useToast();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      const res = await fetch("/api/admin/disputes");
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleUpdateStatus = async (id: string, status: "RESOLVED" | "DISMISSED") => {
    try {
      const res = await fetch("/api/admin/disputes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        success(`Dispute marked as ${status.toLowerCase()}`);
        setDisputes((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status } : d))
        );
      } else {
        error("Failed to update dispute");
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
            Commercial Disputes & Moderation Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Investigate quality grievances, specification discrepancies, and merchant arbitration.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-12 text-center text-slate-500 text-xs space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <div>No open disputes or merchant complaints on record.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-bold text-white text-sm">{d.subject}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === "RESOLVED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : d.status === "DISMISSED"
                          ? "bg-slate-900 text-slate-400 border border-slate-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800 animate-pulse"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Filed by {d.reporter?.name} ({d.reporter?.email}) on{" "}
                    {new Date(d.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                  {d.description}
                </p>

                {d.status === "OPEN" && (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleUpdateStatus(d.id, "RESOLVED")}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve Complaint</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(d.id, "DISMISSED")}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold transition"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
