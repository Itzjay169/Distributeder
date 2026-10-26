import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Distributeder | Two-Sided B2B & B2C Marketplace",
  description:
    "Distributeder connects verified distributors, manufacturers, suppliers, and bulk buyers with wholesale pricing tiers, RFQ procurement, and verified commerce.",
  keywords: [
    "Distributeder",
    "B2B marketplace",
    "wholesale",
    "distributor",
    "supplier",
    "procurement",
    "RFQ",
    "bulk orders",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
