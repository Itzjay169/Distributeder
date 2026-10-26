"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  rate: number; // relative to 1 INR
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { code: "INR", symbol: "₹", rate: 1.0, name: "Indian Rupee (INR)" },
  USD: { code: "USD", symbol: "$", rate: 0.012, name: "US Dollar (USD)" },
  EUR: { code: "EUR", symbol: "€", rate: 0.011, name: "Euro (EUR)" },
  GBP: { code: "GBP", symbol: "£", rate: 0.0095, name: "British Pound (GBP)" },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInINR: number) => string;
  convertPrice: (amountInINR: number) => number;
  currencyInfo: CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");

  useEffect(() => {
    const saved = localStorage.getItem("distributeder_currency") as CurrencyCode;
    if (saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("distributeder_currency", code);
  };

  const currencyInfo = CURRENCIES[currency];

  const convertPrice = (amountInINR: number) => {
    return Number((amountInINR * currencyInfo.rate).toFixed(2));
  };

  const formatPrice = (amountInINR: number) => {
    const converted = convertPrice(amountInINR);
    const locale = currency === "INR" ? "en-IN" : "en-US";
    return `${currencyInfo.symbol}${converted.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatPrice, convertPrice, currencyInfo }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
