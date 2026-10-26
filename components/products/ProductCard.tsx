"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Heart, ShieldCheck, Check } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useSession } from "next-auth/react";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    moq: number;
    wholesaleTiers?: string | null;
    images: string;
    rating: number;
    reviewCount: number;
    category?: { name: string; slug: string };
    seller?: { storeName: string; storeSlug: string; isVerified: boolean };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();
  const { data: session } = useSession();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  let imageList: string[] = [];
  try {
    imageList = JSON.parse(product.images);
  } catch (e) {
    imageList = [product.images];
  }
  const mainImage = imageList[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";

  let parsedTiers: any[] = [];
  if (product.wholesaleTiers) {
    try {
      parsedTiers = JSON.parse(product.wholesaleTiers);
    } catch (e) {}
  }
  const maxDiscount = parsedTiers.length
    ? Math.max(...parsedTiers.map((t: any) => t.discountPercent))
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

    addToCart(
      {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: mainImage,
        moq: product.moq || 1,
        sellerId: product.seller?.storeSlug || "seller",
        storeName: product.seller?.storeName,
        wholesaleTiers: parsedTiers,
      },
      product.moq || 1
    );

    setTimeout(() => setIsAdding(false), 800);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      error("Please sign in to save items to your wishlist.");
      return;
    }

    try {
      if (isWishlisted) {
        await fetch(`/api/wishlist?productId=${product.id}`, { method: "DELETE" });
        setIsWishlisted(false);
        success("Removed from wishlist");
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        setIsWishlisted(true);
        success("Saved to wishlist");
      }
    } catch (e) {
      error("Could not update wishlist");
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 flex flex-col h-full">
      {/* Top Image Container */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.moq > 1 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white border border-slate-700 shadow-sm">
              MOQ: {product.moq} Units
            </span>
          )}
          {maxDiscount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-sm">
              Up to {maxDiscount}% Off Bulk
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition shadow ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white/80 text-slate-600 hover:text-red-500 hover:bg-white"
          }`}
          aria-label="Wishlist"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-blue-600 hover:underline">
              {product.category?.name || "Wholesale"}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-blue-600 transition">
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Seller / Distributor Name */}
          {product.seller && (
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
              <span className="truncate">{product.seller.storeName}</span>
              {product.seller.isVerified && (
                <span title="Verified Distributor">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing and Action */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">/ unit</span>
            </div>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Quick Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center justify-center transition shadow-sm ${
              product.stock <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : isAdding
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95"
            }`}
            title="Add Minimum Order to Cart"
          >
            {isAdding ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
