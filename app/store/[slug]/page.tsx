import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { ShieldCheck, Star, MapPin, Building2, Package, Mail } from "lucide-react";

export default async function SellerStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const seller = await prisma.sellerProfile.findFirst({
    where: {
      OR: [{ storeSlug: slug }, { id: slug }],
    },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      products: {
        where: { isActive: true },
        include: {
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!seller) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Store Banner */}
      <div className="relative h-48 sm:h-64 bg-slate-800 overflow-hidden">
        <img
          src={
            seller.banner ||
            "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
          }
          alt={seller.storeName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Store Header & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 sm:-mt-20 relative z-10 pb-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src={
                seller.logo ||
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80"
              }
              alt={seller.storeName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-lg shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {seller.storeName}
                </h1>
                {seller.isVerified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Distributor
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                <span className="font-semibold text-blue-600">{seller.companyType}</span>
                {seller.businessAddress && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {seller.businessAddress}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed pt-1">
                {seller.storeDescription}
              </p>
            </div>
          </div>

          {/* Performance Badges */}
          <div className="flex items-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-[90px]">
              <div className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span>{seller.rating.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">Rating</div>
            </div>

            <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-[90px]">
              <div className="text-base font-bold text-slate-900">{seller.totalSales}</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">Orders Fulfilled</div>
            </div>

            <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-200 min-w-[90px]">
              <div className="text-base font-bold text-blue-600">{seller.products.length}</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">Active SKUs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Wholesale Catalog ({seller.products.length} SKUs)
          </h2>
        </div>

        {seller.products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            This store currently has no active products listed.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seller.products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  seller: {
                    storeName: seller.storeName,
                    storeSlug: seller.storeSlug,
                    isVerified: seller.isVerified,
                  },
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
