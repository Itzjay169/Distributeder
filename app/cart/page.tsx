"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Building2,
  AlertCircle,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    tierSavings,
    couponDiscount,
    appliedCoupon,
    shippingCost,
    tax,
    total,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getItemPrice,
  } = useCart();

  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await res.json();
      if (res.ok) {
        applyCoupon(data.coupon);
        setCouponCode("");
      } else {
        error(data.error || "Invalid coupon code");
      }
    } catch (err) {
      error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Commercial Procurement Cart
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-12">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Your wholesale cart is empty</h2>
            <p className="text-xs text-slate-500">
              Explore our distributor catalog to find verified wholesale inventory and volume discounts.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Cart Items List (Left 8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
                {items.map((item) => {
                  const unitPrice = getItemPrice(item);
                  const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
                  const isDiscounted = unitPrice < item.price;

                  return (
                    <div
                      key={`${item.id}-${item.selectedVariant || "default"}`}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 transition line-clamp-2"
                          >
                            {item.title}
                          </Link>

                          {item.storeName && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>Distributor: {item.storeName}</span>
                            </div>
                          )}

                          {item.selectedVariant && (
                            <div className="text-[11px] text-blue-600 font-medium">
                              {item.selectedVariant}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs font-bold text-slate-900">
                              {formatPrice(unitPrice)} / unit
                            </span>
                            {isDiscounted && (
                              <span className="text-[10px] line-through text-slate-400">
                                {formatPrice(item.price)}
                              </span>
                            )}
                            {item.moq > 1 && (
                              <span className="text-[10px] text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.5 rounded">
                                MOQ: {item.moq}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Line Total */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(item.moq || 1, item.quantity - 1),
                                item.selectedVariant
                              )
                            }
                            className="p-2 text-slate-500 hover:bg-slate-200 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={item.moq || 1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.id,
                                parseInt(e.target.value) || item.moq || 1,
                                item.selectedVariant
                              )
                            }
                            className="w-14 text-center text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                          />
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1, item.selectedVariant)
                            }
                            className="p-2 text-slate-500 hover:bg-slate-200 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="text-sm font-bold text-slate-900">
                            {formatPrice(lineTotal)}
                          </div>
                          {isDiscounted && (
                            <div className="text-[10px] text-emerald-600 font-medium">
                              Bulk Tier Applied
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.selectedVariant)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wholesale Savings Alert */}
              {tierSavings > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>You are saving with wholesale distributor tiers on this procurement!</span>
                  </div>
                  <strong className="text-emerald-900 font-bold">
                    -{formatPrice(tierSavings)}
                  </strong>
                </div>
              )}
            </div>

            {/* Order Summary & Coupon (Right 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Box */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>Wholesale Discount Coupon</span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                    <div>
                      <div className="font-bold">Coupon "{appliedCoupon.code}" Applied</div>
                      <div className="text-[11px] text-blue-700">
                        {appliedCoupon.discountType === "PERCENTAGE"
                          ? `${appliedCoupon.discountValue}% off order`
                          : `₹${appliedCoupon.discountValue} fixed discount`}
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-500 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={isValidatingCoupon || !couponCode}
                        className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Demo Coupon Quick Chips */}
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-slate-400">Try:</span>
                      <button
                        onClick={() => handleApplyCoupon("WELCOME10")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium transition"
                      >
                        WELCOME10
                      </button>
                      <button
                        onClick={() => handleApplyCoupon("BULKSAVE15")}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium transition"
                      >
                        BULKSAVE15
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cost Summary Box */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900">Order Summary</h2>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Catalog Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      {formatPrice(subtotal + tierSavings)}
                    </span>
                  </div>

                  {tierSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                      <span>Wholesale Tier Savings</span>
                      <span>-{formatPrice(tierSavings)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-blue-600 font-medium">
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Freight & Shipping</span>
                      {shippingCost === 0 && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {shippingCost === 0 ? "₹0.00" : formatPrice(shippingCost)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Commercial Platform Tax (8%)</span>
                    <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-base font-extrabold text-slate-900">
                    <span>Estimated Total</span>
                    <span className="text-xl text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>Proceed to Multi-Step Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Free shipping on all commercial orders over ₹25,000</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
