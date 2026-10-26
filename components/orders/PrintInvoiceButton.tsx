"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function PrintInvoiceButton({ order }: { order: any }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
    >
      <Printer className="w-4 h-4 text-slate-500" />
      <span>Print / Save Invoice (PDF)</span>
    </button>
  );
}
