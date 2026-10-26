"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Star,
  ShieldCheck,
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  RotateCcw,
  MessageSquare,
  Building2,
  Check,
  Minus,
  Plus,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";
import ProductCard from "./ProductCard";

interface ProductDetailProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { success, warning, error } = useToast();

  // Images
  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch (e) {
    images = [product.images];
  }
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  // Wholesale Tiers
  let wholesaleTiers: Array<{ minQty: number; discountPercent: number }> = [];
  if (product.wholesaleTiers) {
    try {
      wholesaleTiers = JSON.parse(product.wholesaleTiers);
      wholesaleTiers.sort((a, b) => a.minQty - b.minQty);
    } catch (e) {}
  }

  // Variants
  let variants: Array<{ name: string; options: string[] }> = [];
  if (product.variants) {
    try {
      variants = JSON.parse(product.variants);
    } catch (e) {}
  }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    variants.forEach((v) => {
      if (v.options && v.options[0]) initial[v.name] = v.options[0];
    });
    return initial;
  });

  const variantString = Object.entries(selectedVariants)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  // Quantity
  const moq = product.moq || 1;
  const [quantity, setQuantity] = useState(moq);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>(product.reviews || []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Recently viewed
  useEffect(() => {
    try {
      const stored = localStorage.getItem("distributeder_recent");
      let recent = stored ? JSON.parse(stored) : [];
      recent = recent.filter((r: any) => r.id !== product.id);
      recent.unshift({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: images[0] || "",
        rating: product.rating,
      });
      localStorage.setItem("distributeder_recent", JSON.stringify(recent.slice(0, 6)));
    } catch (e) {}
  }, [product.id, product.title, product.slug, product.price, product.rating, images]);

  // Calculate current active tier discount
  let activeDiscountPercent = 0;
  for (const tier of wholesaleTiers) {
    if (quantity >= tier.minQty) {
      activeDiscountPercent = tier.discountPercent;
    }
  }

  const effectiveUnitPrice = Number(
    (product.price * (1 - activeDiscountPercent / 100)).toFixed(2)
  );
  const lineTotal = Number((effectiveUnitPrice * quantity).toFixed(2));

  const handleQuantityChange = (newQty: number) => {
    if (newQty < moq) {
      warning(`Minimum Order Quantity (MOQ) for this distributor product is ${moq} units.`);
      setQuantity(moq);
      return;
    }
    if (newQty > product.stock) {
      warning(`Only ${product.stock} units currently in warehouse.`);
      setQuantity(product.stock);
      return;
    }
    setQuantity(newQty);
  };

  const handleAddToCart = (isBuyNow = false) => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: images[0] || "",
        moq: product.moq,
        sellerId: product.seller.storeSlug,
        storeName: product.seller.storeName,
        selectedVariant: variantString || undefined,
        wholesaleTiers,
      },
      quantity
    );

    if (isBuyNow) {
      router.push("/checkout");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      error("Please sign in to contact the seller.");
      return;
    }

    if (!contactMessage.trim()) return;

    setIsSendingMessage(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: product.seller.userId || product.seller.user?.id,
          productId: product.id,
          content: `Inquiry regarding "${product.title}": ${contactMessage.trim()}`,
        }),
      });

      if (res.ok) {
        success("Message sent to distributor! They will respond via your inbox.");
        setContactMessage("");
        setContactModalOpen(false);
      } else {
        error("Failed to deliver message");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      error("Please sign in to submit a review.");
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Review submitted successfully!");
        setReviews([
          {
            ...data.review,
            user: { name: session.user.name, image: session.user.image },
          },
          ...reviews,
        ]);
        setNewComment("");
      } else {
        error(data.error || "Failed to submit review");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600 transition">
          Catalog
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category?.slug}`}
          className="hover:text-blue-600 transition"
        >
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Grid: Gallery + Purchasing Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-16">
        {/* Gallery (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.moq > 1 && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-white backdrop-blur-md shadow">
                Minimum Order Quantity: {product.moq} Units
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === img
                      ? "border-blue-600 shadow-md ring-2 ring-blue-600/30"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Seller / Distributor Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    product.seller.logo ||
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=100&q=80"
                  }
                  alt={product.seller.storeName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <span>{product.seller.storeName}</span>
                    {product.seller.isVerified && (
                      <span title="Verified Distributor">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {product.seller.companyType} • {product.seller.rating.toFixed(2)} ★ (
                    {product.seller.totalSales} fulfilled)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact Seller</span>
                </button>
                <Link
                  href={`/store/${product.seller.storeSlug}`}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  Storefront
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing, Wholesale Tiers & Buy Action (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-blue-600">
                {product.category?.name}
              </span>
              <span>SKU: {product.sku || "N/A"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500 text-sm font-bold">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-400">
                ({product.reviewCount} verified buyer reviews)
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`text-xs font-semibold ${
                  product.stock > 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Dynamic Pricing Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium">Wholesale Unit Price:</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold tracking-tight text-white">
                    {formatPrice(effectiveUnitPrice)}
                  </span>
                  {activeDiscountPercent > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">
                      {activeDiscountPercent}% OFF Tier
                    </span>
                  )}
                </div>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through">
                    MSRP: {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-300">Total for {quantity} units:</span>
                <div className="text-xl font-bold text-orange-400">
                  {formatPrice(lineTotal)}
                </div>
              </div>
            </div>

            {/* Wholesale Tier Table */}
            {wholesaleTiers.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Volume Wholesale Pricing Tiers:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`p-2 rounded-xl text-center border transition ${
                      activeDiscountPercent === 0
                        ? "bg-blue-600/30 border-blue-400 text-white font-bold"
                        : "bg-slate-800/60 border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="text-[11px]">1 - {wholesaleTiers[0].minQty - 1}</div>
                    <div className="text-xs font-bold">{formatPrice(product.price)}</div>
                    <div className="text-[10px] text-slate-400">Base Price</div>
                  </div>

                  {wholesaleTiers.map((tier, idx) => {
                    const isCurrent = activeDiscountPercent === tier.discountPercent;
                    const nextTier = wholesaleTiers[idx + 1];
                    const rangeLabel = nextTier
                      ? `${tier.minQty} - ${nextTier.minQty - 1}`
                      : `${tier.minQty}+`;
                    const tierUnitPrice = Number(
                      (product.price * (1 - tier.discountPercent / 100)).toFixed(2)
                    );

                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-center border transition ${
                          isCurrent
                            ? "bg-orange-500/30 border-orange-400 text-white font-bold"
                            : "bg-slate-800/60 border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="text-[11px]">{rangeLabel} units</div>
                        <div className="text-xs font-bold">{formatPrice(tierUnitPrice)}</div>
                        <div className="text-[10px] text-orange-300">
                          {tier.discountPercent}% Off
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Variants Selector */}
          {variants.length > 0 && (
            <div className="space-y-3">
              {variants.map((v) => (
                <div key={v.name}>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select {v.name}:{" "}
                    <span className="text-blue-600 font-normal">
                      {selectedVariants[v.name]}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setSelectedVariants((prev) => ({ ...prev, [v.name]: opt }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          selectedVariants[v.name] === opt
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Stepper (Enforcing MOQ) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Order Quantity:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= moq}
                  className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  min={moq}
                  max={product.stock}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || moq)}
                  className="w-16 text-center text-sm font-bold text-slate-900 focus:outline-none"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Minimum order: <strong className="text-slate-800">{moq} units</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={product.stock <= 0}
                className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                disabled={product.stock <= 0}
                className="py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

            <Link
              href="/rfq"
              className="block w-full py-2.5 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-50 rounded-xl transition border border-blue-200"
            >
              Need a Custom Bulk Quote? Submit an RFQ →
            </Link>
          </div>

          {/* Logistics highlights */}
          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Standard Freight Dispatch in 24-48 business hours</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Material Test Certificate (MTC) & Commercial Invoice Included</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Zero-Risk Settlement: COD or Verified Demo Card</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications Tabs */}
      <div className="border-t border-slate-200 pt-12 pb-16">
        <div className="max-w-4xl space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Product Overview & Specifications
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              {product.description}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Customer Reviews ({reviews.length})
              </h2>
              <div className="flex items-center gap-2 text-amber-500 font-bold">
                <Star className="w-5 h-5 fill-current" />
                <span>{product.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {/* Submit Review Box */}
            <form
              onSubmit={handleReviewSubmit}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-900">Leave a Product Review</h3>
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">
                  Rating:
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? "fill-current" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">
                  Your Feedback:
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details on product quality, packaging, delivery speed, and wholesale reliability..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
              >
                {isSubmittingReview ? "Submitting..." : "Post Review"}
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((r, idx) => (
                <div
                  key={r.id || idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {r.user?.name?.charAt(0) || "B"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {r.user?.name || "Verified Buyer"}
                        </div>
                        {r.isVerifiedPurchase && (
                          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verified Procurement
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400 text-xs">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-200 pt-12 pb-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Related Items in {product.category?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Contact {product.seller.storeName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Inquire about technical specifications, sample requests, or custom container orders.
            </p>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Type your inquiry here..."
                rows={4}
                required
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingMessage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {isSendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
