"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./ToastProvider";
import { CurrencyProvider } from "./CurrencyProvider";
import { CartProvider } from "./CartProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CurrencyProvider>
          <CartProvider>{children}</CartProvider>
        </CurrencyProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
