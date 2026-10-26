"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useToast } from "@/components/providers/ToastProvider";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  MapPin,
  Building2,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Lock,
  Plus,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, couponDiscount, appliedCoupon, shippingCost, tax, total, clearCart } =
    useCart();
  const { formatPrice } = useCurrency();
  const { success, error, warning } = useToast();

  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Shipping, 3: Payment, 4: Review
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Address Form
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState("STANDARD"); // "STANDARD" | "EXPRESS"

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD">("CARD");

  // Demo Card Form
  const [cardForm, setCardForm] = useState({
    cardNumber: "4242 •••• •••• 4242",
    cardHolder: "Acme Procurement Corp",
    expiry: "12/28",
    cvv: "321",
  });

  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            setSelectedAddressId(data.addresses[0].id);
            setAddressForm(data.addresses[0]);
          } else {
            setAddressForm((prev) => ({
              ...prev,
              fullName: session.user.name || "",
            }));
          }
        })
        .catch(console.error);
    }
  }, [session]);

  // If cart is empty, redirect
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setAddressForm({
        fullName: session?.user?.name || "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States",
      });
    } else {
      const match = savedAddresses.find((a) => a.id === id);
      if (match) setAddressForm(match);
    }
  };

  const validateAddress = () => {
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.postalCode
    ) {
      warning("Please complete all shipping address fields.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateAddress()) return;
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handlePlaceOrder = async () => {
    if (!session?.user) {
      error("Please sign in or register to complete your order.");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!validateAddress()) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: addressForm,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          notes: orderNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        success(`Order #${data.orderNumber} confirmed!`);
        router.push(`/order-confirmation/${data.orderNumber}`);
      } else {
        error(data.error || "Failed to process order.");
        setIsSubmitting(false);
      }
    } catch (err) {
      error("Network error while submitting order.");
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Address" },
    { num: 2, title: "Shipping" },
    { num: 3, title: "Payment" },
    { num: 4, title: "Review" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Stepper Progress Bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <button
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num);
                  }}
                  disabled={s.num > currentStep}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition shadow ${
                    currentStep === s.num
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : s.num < currentStep
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-400 border border-slate-300"
                  }`}
                >
                  {s.num < currentStep ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </button>
                <span
                  className={`text-[11px] font-semibold mt-1.5 ${
                    currentStep === s.num ? "text-blue-600" : "text-slate-500"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Step Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Checkout Steps Container (Left 8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {/* STEP 1: Address */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">1. Delivery Location</h2>
                    <p className="text-xs text-slate-500">
                      Specify the destination warehouse, jobsite, or corporate dock.
                    </p>
                  </div>
                </div>

                {/* Saved addresses selector */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Saved Company Addresses:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                            selectedAddressId === addr.id
                              ? "border-blue-600 bg-blue-50/50 shadow-sm"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">{addr.fullName}</div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">{addr.phone}</div>
                        </div>
                      ))}

                      <div
                        onClick={() => handleAddressSelect("new")}
                        className={`p-3.5 rounded-2xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition ${
                          selectedAddressId === "new"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-300 hover:border-slate-400 text-slate-600"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-semibold">Enter New Address</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Recipient / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, fullName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Street Address & Dock Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="1234 Commerce Blvd, Bay 4"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, street: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, state: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, postalCode: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Shipping Method */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">2. Freight & Logistics</h2>
                  <p className="text-xs text-slate-500">
                    Select your preferred carrier speed and handling preference.
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setShippingMethod("STANDARD")}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      shippingMethod === "STANDARD"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Standard Commercial Freight
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Estimated delivery: 3–5 business days • Liftgate dock handling
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("EXPRESS")}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      shippingMethod === "EXPRESS"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Priority Expedited Air Cargo
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Estimated delivery: 24–48 hours • Dedicated courier dispatch
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {formatPrice(shippingCost + 45)}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">3. Payment Settlement</h2>
                  <p className="text-xs text-slate-500">
                    Choose between instant Demo Card authorization or Cash on Delivery (COD).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card Option */}
                  <div
                    onClick={() => setPaymentMethod("CARD")}
                    className={`p-5 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === "CARD"
                        ? "border-blue-600 bg-blue-50/40 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Instant Approval (Demo)
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">Demo Corporate Card</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Simulated card checkout that always succeeds. Modularly structured for Stripe & Razorpay.
                    </div>
                  </div>

                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-5 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === "COD"
                        ? "border-blue-600 bg-blue-50/40 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        Pay on Arrival
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Settle invoice via corporate cashier check or verified cash upon receiving freight at dock.
                    </div>
                  </div>
                </div>

                {/* Card Fields (Simulated) */}
                {paymentMethod === "CARD" && (
                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Simulated Secure Card Entry</span>
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={cardForm.cardNumber}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                            Expires
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={cardForm.expiry}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                            CVC / CVV
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={cardForm.cvv}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Review & Confirm */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">4. Review Procurement Order</h2>
                  <p className="text-xs text-slate-500">
                    Verify shipping destination, line items, and tender terms before submitting.
                  </p>
                </div>

                {/* Shipping & Payment Summary pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Shipping To:</span>
                    <div className="text-slate-900 font-semibold">{addressForm.fullName}</div>
                    <div className="text-slate-600">
                      {addressForm.street}, {addressForm.city}, {addressForm.state}{" "}
                      {addressForm.postalCode}
                    </div>
                    <div className="text-slate-500 mt-1">{addressForm.phone}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Settlement Method:</span>
                    <div className="text-slate-900 font-semibold">
                      {paymentMethod === "CARD"
                        ? "Demo Card Payment (Instant Authorization)"
                        : "Cash on Delivery (COD)"}
                    </div>
                    <div className="text-slate-500 mt-1">
                      {paymentMethod === "CARD"
                        ? "Test transaction approved automatically"
                        : "Payment due upon dock delivery"}
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between text-xs text-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Qty: {item.quantity} units {item.selectedVariant ? `• ${item.selectedVariant}` : ""}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Optional order notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Procurement Notes / Delivery Instructions:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Call receiving manager 30 mins prior to dock arrival..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Place & Confirm Order ({formatPrice(total)})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Summary Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 self-start">
            <h3 className="text-base font-bold text-slate-900">Procurement Summary</h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Items ({items.length})</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-blue-600 font-medium">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Freight Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Tax (8%)</span>
                <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-base font-extrabold text-slate-900">
                <span>Total Due</span>
                <span className="text-xl text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Distributeder Escrow Guarantee</span>
              </div>
              <p>
                Funds are released to distributors only upon verified delivery and buyer inspection sign-off.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
