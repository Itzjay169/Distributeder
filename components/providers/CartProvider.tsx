"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastProvider";

export interface CartItemType {
  id: string; // product id
  title: string;
  slug: string;
  price: number; // base price
  image: string;
  quantity: number;
  moq: number;
  sellerId: string;
  storeName?: string;
  selectedVariant?: string;
  wholesaleTiers?: Array<{ minQty: number; discountPercent: number }>;
}

export interface CouponType {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
}

interface CartContextType {
  items: CartItemType[];
  itemCount: number;
  subtotal: number;
  tierSavings: number;
  couponDiscount: number;
  appliedCoupon: CouponType | null;
  shippingCost: number;
  tax: number;
  total: number;
  addToCart: (item: Omit<CartItemType, "quantity">, quantity?: number) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  applyCoupon: (coupon: CouponType) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getItemPrice: (item: CartItemType) => number; // effective unit price after wholesale tier
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { success, warning } = useToast();

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("distributeder_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem("distributeder_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("distributeder_cart", JSON.stringify(items));
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (appliedCoupon) {
      localStorage.setItem("distributeder_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("distributeder_coupon");
    }
  }, [appliedCoupon, isLoaded]);

  // Calculate unit price considering wholesale tiers
  const getItemPrice = (item: CartItemType): number => {
    let effectivePrice = item.price;
    if (item.wholesaleTiers && item.wholesaleTiers.length > 0) {
      const sortedTiers = [...item.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
      for (const tier of sortedTiers) {
        if (item.quantity >= tier.minQty) {
          effectivePrice = item.price * (1 - tier.discountPercent / 100);
          break;
        }
      }
    }
    return Number(effectivePrice.toFixed(2));
  };

  const addToCart = (product: Omit<CartItemType, "quantity">, requestedQty?: number) => {
    const qtyToAdd = Math.max(product.moq || 1, requestedQty || 1);

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === product.id && i.selectedVariant === product.selectedVariant
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + (requestedQty || 1);
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [...prev, { ...product, quantity: qtyToAdd }];
      }
    });

    success(`Added ${product.title.substring(0, 30)}... to cart!`);
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.selectedVariant === variant))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variant?: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === productId && item.selectedVariant === variant) {
          const validQty = Math.max(item.moq || 1, quantity);
          if (quantity < (item.moq || 1)) {
            warning(`Minimum order quantity for this item is ${item.moq} units.`);
          }
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const applyCoupon = (coupon: CouponType) => {
    setAppliedCoupon(coupon);
    success(`Coupon "${coupon.code}" applied!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem("distributeder_cart");
    localStorage.removeItem("distributeder_coupon");
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal with wholesale discounts already applied to items
  let baseSubtotal = 0;
  let discountedSubtotal = 0;

  items.forEach((item) => {
    baseSubtotal += item.price * item.quantity;
    discountedSubtotal += getItemPrice(item) * item.quantity;
  });

  const tierSavings = Number((baseSubtotal - discountedSubtotal).toFixed(2));
  const subtotal = Number(discountedSubtotal.toFixed(2));

  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      couponDiscount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
  }

  couponDiscount = Number(couponDiscount.toFixed(2));

  // Flat estimated shipping (₹500 if < ₹25,000, free if >= ₹25,000 or coupon)
  const shippingCost = items.length === 0 ? 0 : subtotal >= 25000 ? 0 : 500;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = Number((taxableAmount * 0.08).toFixed(2)); // 8% platform tax
  const total = Number(Math.max(0, taxableAmount + shippingCost + tax).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        tierSavings,
        couponDiscount,
        appliedCoupon,
        shippingCost,
        tax,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        getItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
