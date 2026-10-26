"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Boxes,
  Search,
  ShoppingCart,
  Bell,
  User,
  ShieldCheck,
  Store,
  ShoppingBag,
  ChevronDown,
  LogOut,
  Heart,
  Menu,
  X,
  Package,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/components/providers/CurrencyProvider";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const { currency, setCurrency } = useCurrency();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const isSeller = Boolean(session?.user?.isSeller);
  const isAdmin = session?.user?.role === "ADMIN";

  const categories = [
    { label: "All Products", href: "/products", isActive: pathname === "/products" },
    { label: "Electronics", href: "/products?category=electronics" },
    { label: "Industrial", href: "/products?category=industrial-supplies" },
    { label: "Bulk Groceries", href: "/products?category=groceries" },
    { label: "Agriculture", href: "/products?category=agriculture" },
    { label: "Home & Kitchen", href: "/products?category=home-kitchen" },
    { label: "Fashion", href: "/products?category=fashion" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/80 text-white shadow-lg shadow-slate-950/20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900/90 px-4 py-1.5 text-[11px] sm:text-xs text-slate-300 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <span className="flex items-center gap-1.5 text-blue-300 font-medium shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Verified B2B & Wholesale Marketplace</span>
            <span className="sm:hidden">B2B Verified</span>
          </span>
          <span className="hidden lg:inline text-slate-500">|</span>
          <span className="hidden lg:inline text-slate-400 truncate">
            Simulated Payments: COD & Instant Demo Cards Enabled
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Currency Dropdown */}
          <div className="relative" ref={currencyDropdownRef}>
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-1 text-slate-200 hover:text-white transition-colors font-medium px-1.5 py-0.5 rounded hover:bg-slate-800/60"
            >
              <span>{currency}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${currencyOpen ? "rotate-180" : ""}`} />
            </button>
            {currencyOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-slate-800/95 backdrop-blur-lg border border-slate-700/60 rounded-xl shadow-2xl py-1 z-50 text-xs animate-slide-down">
                {Object.values(CURRENCIES).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code as CurrencyCode);
                      setCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700/60 transition-colors ${
                      currency === c.code ? "text-orange-400 font-semibold" : "text-slate-300"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-slate-400">{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/portals"
            className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Portals Hub
          </Link>

          <Link
            href="/rfq"
            className="hidden sm:flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            <Zap className="w-3 h-3" />
            <span className="hidden md:inline">Request for Quote</span>
            <span className="md:hidden">RFQ</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:text-orange-400 transition-colors duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                Distributeder
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-blue-400/90 font-semibold -mt-0.5 sm:-mt-1">
                Wholesale & Trade
              </span>
            </div>
          </Link>

          {/* Search Bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, suppliers, SKU..."
                className="w-full pl-10 pr-24 py-2.5 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent focus:bg-slate-800 transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all duration-200 hover:shadow-blue-500/25"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Role Workspace Link — desktop only */}
            {session?.user && (
              isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-all duration-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>Admin</span>
                </Link>
              ) : session.user.isSeller ? (
                <Link
                  href="/seller/dashboard"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all duration-200"
                >
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span>Seller</span>
                </Link>
              ) : (
                <Link
                  href="/buyer/dashboard"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-all duration-200"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Buyer</span>
                </Link>
              )
            )}

            {/* Notifications */}
            {session?.user && (
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    if (!notificationsOpen && unreadCount > 0) {
                      markAllNotificationsRead();
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200 relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-slate-900/95 backdrop-blur-lg border border-slate-800/60 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-down">
                    <div className="p-3.5 bg-slate-800/50 border-b border-slate-700/40 flex items-center justify-between">
                      <div className="font-semibold text-sm text-white">Notifications</div>
                      <span className="text-xs text-slate-400">{notifications.length} recent</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || "#"}
                            onClick={() => setNotificationsOpen(false)}
                            className={`p-3.5 block hover:bg-slate-800/40 transition-colors ${
                              !n.isRead ? "bg-blue-950/15" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-200">
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-500 shrink-0">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {n.message}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200 relative"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth buttons */}
            {session?.user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pl-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-200 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      session.user.name?.charAt(0) || "U"
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium max-w-[80px] truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-lg border border-slate-800/60 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-slide-down">
                    {/* Profile header */}
                    <div className="px-4 py-2.5 border-b border-slate-800/60">
                      <div className="font-semibold text-white text-sm truncate">
                        {session.user.name}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">{session.user.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {isAdmin ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 font-bold text-[10px] border border-rose-500/20">
                            ADMIN
                          </span>
                        ) : session.user.isSeller ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold text-[10px] border border-amber-500/20">
                            DISTRIBUTOR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-bold text-[10px] border border-blue-500/20">
                            BUYER
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      {isAdmin && (
                        <>
                          <Link href="/admin/dashboard" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-rose-400 hover:bg-slate-800/50 hover:text-rose-300 transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Center</span>
                          </Link>
                          <Link href="/admin/sellers" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                            <Store className="w-4 h-4 text-amber-400" />
                            <span>Verify Distributors</span>
                          </Link>
                          <Link href="/admin/orders" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                            <ShoppingBag className="w-4 h-4 text-emerald-400" />
                            <span>Platform Orders</span>
                          </Link>
                        </>
                      )}

                      {session.user.isSeller && (
                        <>
                          <Link href="/seller/dashboard" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-amber-400 hover:bg-slate-800/50 hover:text-amber-300 transition-colors font-semibold">
                            <Store className="w-4 h-4" />
                            <span>Seller Dashboard</span>
                          </Link>
                          <Link href="/seller/products" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                            <Package className="w-4 h-4 text-blue-400" />
                            <span>Products & Inventory</span>
                          </Link>
                          <Link href="/seller/orders" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                            <ShoppingBag className="w-4 h-4 text-emerald-400" />
                            <span>Incoming Orders</span>
                          </Link>
                          <Link href="/seller/payouts" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                            <span>Payouts & Ledger</span>
                          </Link>
                        </>
                      )}

                      {!isAdmin && !session.user.isSeller && (
                        <>
                          <Link href="/buyer/dashboard" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-blue-400 hover:bg-slate-800/50 hover:text-blue-300 transition-colors font-semibold">
                            <ShoppingBag className="w-4 h-4" />
                            <span>Buyer Dashboard</span>
                          </Link>
                          <Link href="/buyer/orders" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                            <Package className="w-4 h-4 text-emerald-400" />
                            <span>My Orders</span>
                          </Link>
                          <Link href="/buyer/rfq" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                            <TrendingUp className="w-4 h-4 text-orange-400" />
                            <span>RFQ Bids</span>
                          </Link>
                          <Link href="/buyer/wishlist" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 flex items-center gap-2.5 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span>Wishlist</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800/60">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-red-400 hover:bg-slate-800/50 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/portals"
                  className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200 border border-slate-800/60"
                >
                  Portals
                </Link>
                <Link
                  href="/login"
                  className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all duration-300 hover-lift"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200"
              aria-label="Toggle navigation"
            >
              <div className="relative w-6 h-6">
                <Menu className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
                <X className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Desktop Categories Nav */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 py-2.5 text-xs font-medium text-slate-300 border-t border-slate-800/40 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`hover:text-white transition-colors whitespace-nowrap relative group py-0.5 ${
                cat.isActive ? "text-orange-400 font-semibold" : ""
              }`}
            >
              {cat.label}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-400 rounded-full transition-all duration-300 ${
                cat.isActive ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </Link>
          ))}
          <Link
            href="/rfq"
            className="text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap font-semibold ml-auto flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Bulk RFQs
          </Link>
        </nav>
      </div>

      {/* Mobile Drawer — slide down with animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/60 px-4 py-4 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, suppliers..."
                className="w-full pl-10 pr-16 py-2.5 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Go
              </button>
            </div>
          </form>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link href="/products" className="p-3 rounded-xl bg-slate-800/60 text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              Browse Catalog
            </Link>
            <Link href="/rfq" className="p-3 rounded-xl bg-slate-800/60 text-orange-400 font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Request Quote
            </Link>
            <Link href="/buyer/orders" className="p-3 rounded-xl bg-slate-800/60 text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              My Orders
            </Link>
            <Link href="/seller/dashboard" className="p-3 rounded-xl bg-slate-800/60 text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              Seller Hub
            </Link>
          </div>

          {/* Categories — mobile horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-3 py-1.5 rounded-full bg-slate-800/60 text-slate-300 text-[11px] font-medium whitespace-nowrap hover:bg-slate-700/60 hover:text-white transition-colors shrink-0"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Portal hub link */}
          <Link
            href="/portals"
            className="block p-3 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 text-blue-300 font-semibold text-xs text-center hover:from-blue-900/40 hover:to-indigo-900/40 transition-all duration-200"
          >
            🏢 Portals Hub — Buyer • Seller • Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
