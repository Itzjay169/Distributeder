import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SellerLayout from "@/components/seller/SellerLayout";
import SellerProductsManager from "@/components/seller/SellerProductsManager";

export default async function SellerProductsPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/seller/login?callbackUrl=/seller/products");
  }

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!sellerProfile) {
    redirect("/buyer/dashboard");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <SellerLayout>
      <SellerProductsManager
        initialProducts={sellerProfile.products}
        categories={categories}
        storeSlug={sellerProfile.storeSlug}
      />
    </SellerLayout>
  );
}
