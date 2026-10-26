"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Search,
  Filter,
  Check,
} from "lucide-react";

interface ProductsViewProps {
  initialProducts: any[];
  categories: any[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function ProductsView({
  initialProducts,
  categories,
  total,
  currentPage,
  totalPages,
}: ProductsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentQuery = searchParams.get("q") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSort = searchParams.get("sort") || "featured";
  const currentInStock = searchParams.get("inStock") === "true";

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [searchTerm, setSearchTerm] = useState(currentQuery);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ minPrice, maxPrice });
    setMobileFilterOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: searchTerm });
  };

  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSearchTerm("");
    router.push("/products");
  };

  const hasActiveFilters =
    !!currentCategory ||
    !!currentQuery ||
    !!currentMinPrice ||
    !!currentMaxPrice ||
    currentInStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || "Category Products"
              : currentQuery
              ? `Search Results for "${currentQuery}"`
              : "All Commercial & Wholesale Products"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {initialProducts.length} of {total} items with wholesale bulk pricing
          </p>
        </div>

        {/* Search, Sort & Mobile Filter Trigger */}
        <div className="flex items-center gap-3 flex-wrap">
          <form onSubmit={handleSearchSubmit} className="relative min-w-[220px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in catalog..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => applyFilters({ category: null })}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                  !currentCategory
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>All Categories</span>
                <span>{total}</span>
              </button>
              {categories.map((c) => {
                const isActive = currentCategory === c.slug;
                return (
                  <button
                    key={c.id}
                    onClick={() => applyFilters({ category: c.slug })}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-slate-400 text-[11px]">{c._count.products}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Price Range (₹)
            </h3>
            <form onSubmit={handlePriceSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition"
              >
                Apply Range
              </button>
            </form>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Stock Status
            </h3>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) =>
                  applyFilters({ inStock: e.target.checked ? "true" : null })
                }
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {initialProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No products matched your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or adjusting your price filters to view more wholesale listings.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => applyFilters({ page: String(currentPage - 1) })}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => applyFilters({ page: String(pg) })}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                        currentPage === pg
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => applyFilters({ page: String(currentPage + 1) })}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-80 bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-base">Filter Products</span>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Mobile Category List */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    applyFilters({ category: null });
                    setMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                    !currentCategory ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      applyFilters({ category: c.slug });
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      currentCategory === c.slug
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Price Range (₹)
              </h3>
              <form onSubmit={handlePriceSubmit} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
