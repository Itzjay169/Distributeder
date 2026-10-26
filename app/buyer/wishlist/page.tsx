"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BuyerLayout from "@/components/buyer/BuyerLayout";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";

export default function BuyerWishlistPage() {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((p) => p.id !== productId));
      success("Removed from wishlist");
    } catch (err) {
      error("Failed to remove item");
    }
  };

  const handleMoveToCart = (product: any) => {
    let images: string[] = [];
    try {
      images = JSON.parse(product.images);
    } catch (e) {
      images = [product.images];
    }

    addToCart(
      {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: images[0] || "",
        moq: product.moq || 1,
        sellerId: product.seller?.storeSlug || "seller",
        storeName: product.seller?.storeName,
      },
      product.moq || 1
    );

    handleRemove(product.id);
  };

  return (
    <BuyerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Procurement Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Saved materials and machinery items ready to be scheduled for bulk requisition.
          </p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading wishlist...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-3">
            <Heart className="w-10 h-10 text-slate-300 mx-auto" />
            <div>Your procurement wishlist is currently empty.</div>
            <Link
              href="/products"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => {
              let images: string[] = [];
              try {
                images = JSON.parse(p.images);
              } catch (e) {
                images = [p.images];
              }

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <img
                      src={images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-red-500 transition shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[11px] font-semibold text-blue-600 mb-1">
                        {p.category?.name}
                      </div>
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 transition line-clamp-2"
                      >
                        {p.title}
                      </Link>
                      <div className="text-base font-extrabold text-slate-900 mt-2">
                        {formatPrice(p.price)}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">/ unit</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMoveToCart(p)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Move to Cart (MOQ {p.moq})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
