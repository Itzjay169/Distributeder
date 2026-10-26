import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import {
  Boxes,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Search,
  Building2,
  CheckCircle,
  Clock,
  Star,
  FileSpreadsheet,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  const [categories, featuredProducts, trendingProducts, topSellers, openRfqsCount] =
    await Promise.all([
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        take: 8,
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: {
          category: { select: { name: true, slug: true } },
          seller: { select: { storeName: true, storeSlug: true, isVerified: true } },
        },
        take: 8,
      }),
      prisma.product.findMany({
        where: { isActive: true, isTrending: true },
        include: {
          category: { select: { name: true, slug: true } },
          seller: { select: { storeName: true, storeSlug: true, isVerified: true } },
        },
        take: 8,
      }),
      prisma.sellerProfile.findMany({
        where: { isApproved: true },
        take: 4,
        orderBy: { totalSales: "desc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.rFQ.count({ where: { status: "OPEN" } }),
    ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-indigo-500/6 rounded-full blur-[100px] pointer-events-none animate-float-slow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Two-Sided Wholesale & Retail B2B Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Connect Directly with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-orange-400 bg-clip-text text-transparent">
                Verified Distributors
              </span>{" "}
              & Bulk Suppliers
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Source industrial hardware, electronics, agro supplies, and commodities with automated wholesale volume tiers, instant RFQs, and secure escrow settlement.
            </p>

            {/* Hero Quick Search */}
            <div className="pt-2 max-w-2xl mx-auto">
              <form action="/products" method="GET" className="relative flex shadow-2xl">
                <input
                  type="text"
                  name="q"
                  placeholder="What are you sourcing today? (e.g., valves, headphones, coffee...)"
                  className="w-full pl-10 sm:pl-12 pr-4 sm:pr-32 py-3.5 sm:py-4 bg-white text-slate-900 rounded-2xl text-xs sm:text-sm lg:text-base focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-inner"
                />
                <Search className="absolute left-3 sm:left-4 top-3.5 sm:top-4 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <button
                  type="submit"
                  className="hidden sm:block absolute right-2 top-2 px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow transition-all duration-300 hover-lift"
                >
                  Find Wholesale
                </button>
              </form>

              {/* Popular Tags */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Trending:</span>
                {["Stainless Valves", "Ethiopian Coffee", "ANC Headphones", "Work Gloves"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/products?q=${encodeURIComponent(tag.split(" ").pop()?.toLowerCase() || tag)}`}
                    className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors duration-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 sm:pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left border-t border-slate-800/80 max-w-4xl mx-auto">
              {[
                { value: "40+", label: "Curated Wholesale Products", color: "text-white" },
                { value: "Up to 35%", label: "Automated Bulk Discounts", color: "text-orange-400" },
                { value: "100%", label: "Verified Suppliers & COD", color: "text-emerald-400" },
                { value: `${openRfqsCount} Open`, label: "Active Procurement RFQs", color: "text-blue-400" },
              ].map((metric) => (
                <div key={metric.label} className="p-3 sm:p-4 rounded-xl bg-slate-800/40 border border-slate-800/60 hover:bg-slate-800/60 transition-colors duration-200">
                  <div className={`text-xl sm:text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Commercial Sectors
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Wholesale Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-blue-400/60 transition-all duration-300 flex flex-col justify-between hover-lift"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-3 sm:mb-4">
                <img
                  src={cat.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors duration-200">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 line-clamp-1">{cat.description}</p>
                <div className="mt-2 text-[10px] sm:text-xs font-semibold text-orange-600 flex items-center gap-1">
                  <span>{cat._count.products} products</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                Curated Selection
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Wholesale Listings
              </h2>
            </div>
            <Link
              href="/products?sort=featured"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <span>Browse All Featured</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* RFQ Banner */}
      <section className="py-10 sm:py-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 font-semibold text-xs border border-orange-500/30">
              <Zap className="w-3 h-3" />
              Bulk Procurement Made Simple
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
              Can&apos;t Find Your Exact Specifications? Post an RFQ
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl">
              Submit quantities, target pricing, and specs. Verified distributors will respond with binding bids within 24 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/rfq"
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2 hover-lift"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Post Request for Quote</span>
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700/60 transition-all duration-200 text-center"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Deals */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>High Volume Movers</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Trending Wholesale Deals
            </h2>
          </div>
          <Link
            href="/products?sort=popular"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <span>See More Trending</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Top Sellers */}
      <section className="py-10 sm:py-16 bg-slate-100/60 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Direct Supply Partners
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Verified Distributors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Work with vetted manufacturers and distributors with proven fulfillment records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {topSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover-lift"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={seller.logo || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=120&q=80"}
                      alt={seller.storeName}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200/80"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        <span className="truncate">{seller.storeName}</span>
                        {seller.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                      </h3>
                      <span className="text-xs text-slate-500">{seller.companyType}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {seller.storeDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {seller.rating.toFixed(2)}
                    </span>
                    <span className="text-slate-400 text-[10px] sm:text-[11px]">{seller.totalSales} fulfilled</span>
                  </div>

                  <Link
                    href={`/store/${seller.storeSlug}`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-all duration-200 hover:shadow-md"
                  >
                    View Store
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
