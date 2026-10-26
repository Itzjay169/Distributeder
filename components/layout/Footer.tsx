"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Boxes, ShieldCheck, ArrowRight, Truck, RefreshCw, Award, Zap, ChevronUp } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { success } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      success("Thank you for subscribing to Distributeder Wholesale updates!");
      setEmail("");
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const valueProps = [
    { icon: Truck, title: "Freight & Bulk Delivery", desc: "Direct dock-to-dock shipping", color: "blue" },
    { icon: Award, title: "Verified Distributors", desc: "ISO & quality certified sellers", color: "orange" },
    { icon: ShieldCheck, title: "Escrow & COD Protected", desc: "Demo card & cash on delivery", color: "emerald" },
    { icon: RefreshCw, title: "Wholesale Tier Pricing", desc: "Up to 35% volume discounts", color: "indigo" },
  ];

  const footerSections = [
    {
      title: "Categories",
      links: [
        { label: "Electronics & Computing", href: "/products?category=electronics" },
        { label: "Industrial & Machinery", href: "/products?category=industrial-supplies" },
        { label: "Agriculture & Fertilizers", href: "/products?category=agriculture" },
        { label: "Bulk Groceries & Oils", href: "/products?category=groceries" },
        { label: "Hospitality & Kitchenware", href: "/products?category=home-kitchen" },
        { label: "Apparel & Workwear", href: "/products?category=fashion" },
      ],
    },
    {
      title: "For Buyers",
      links: [
        { label: "Submit Bulk RFQ", href: "/rfq", highlight: "orange" },
        { label: "Wholesale Catalog", href: "/products" },
        { label: "Track Shipments", href: "/buyer/orders" },
        { label: "Saved Procurement List", href: "/buyer/wishlist" },
        { label: "Buyer Account Portal", href: "/buyer/dashboard" },
        { label: "Buyer Sign In Page →", href: "/buyer/login", highlight: "blue" },
      ],
    },
    {
      title: "Workspaces",
      links: [
        { label: "Seller Sign In →", href: "/seller/login", highlight: "amber" },
        { label: "Supplier Dashboard", href: "/seller/dashboard" },
        { label: "Admin Sign In →", href: "/admin/login", highlight: "rose" },
        { label: "Admin Control Panel", href: "/admin/dashboard" },
        { label: "Portals Hub ⚡", href: "/portals", highlight: "purple" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-auto">
      {/* Value Propositions */}
      <div className="border-b border-slate-900/60 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {valueProps.map((prop) => (
              <div key={prop.title} className="flex items-center gap-3 group">
                <div className={`w-10 h-10 rounded-xl bg-${prop.color}-500/10 text-${prop.color}-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <prop.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold text-xs sm:text-sm truncate">{prop.title}</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs truncate">{prop.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Company Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-orange-500 p-0.5 group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Boxes className="w-4 h-4 text-blue-400 group-hover:text-orange-400 transition-colors duration-300" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Distributeder
              </span>
            </Link>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              The premier two-sided commercial marketplace enabling direct transactions between verified manufacturers, distributors, and volume buyers worldwide.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="pt-2">
              <div className="text-xs font-semibold text-slate-200 mb-2">
                Subscribe for Market Intelligence
              </div>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your business email"
                  required
                  className="flex-1 px-3 py-2.5 bg-slate-900/80 border border-slate-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all duration-200 shrink-0 flex items-center gap-1 hover-lift shadow-md shadow-blue-500/15"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Footer link sections — desktop: columns, mobile: accordions */}
          {footerSections.map((section) => (
            <div key={section.title}>
              {/* Desktop: always visible */}
              <div className="hidden sm:block">
                <div className="text-white font-semibold mb-3 text-sm">{section.title}</div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`transition-colors hover:translate-x-0.5 inline-block duration-200 ${
                          link.highlight
                            ? `text-${link.highlight}-400 hover:text-${link.highlight}-300 font-semibold`
                            : "hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile: accordion */}
              <div className="sm:hidden">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between py-3 border-b border-slate-800/40 text-white font-semibold text-sm"
                >
                  <span>{section.title}</span>
                  <ChevronUp
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                      expandedSection === section.title ? "rotate-0" : "rotate-180"
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedSection === section.title ? "max-h-60 opacity-100 py-2" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`transition-colors ${
                            link.highlight
                              ? `text-${link.highlight}-400 font-semibold`
                              : "hover:text-white"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900/80 mt-8 sm:mt-10 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-slate-500 text-center sm:text-left text-[11px] sm:text-xs">
            © {new Date().getFullYear()} Distributeder Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-500 text-[11px] sm:text-xs">
            <span>Demo Payments</span>
            <span className="text-slate-700">•</span>
            <span>Verified Escrow</span>
            <span className="text-slate-700">•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
