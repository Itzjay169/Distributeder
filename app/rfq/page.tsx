import React from "react";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RfqHubView from "@/components/rfq/RfqHubView";

export default async function RfqPage() {
  const rfqs = await prisma.rFQ.findMany({
    include: {
      buyer: { select: { name: true } },
      _count: { select: { quotes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <RfqHubView initialRfqs={rfqs} />
      <Footer />
    </div>
  );
}
