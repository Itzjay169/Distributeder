import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/products/ProductDetailView";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      isActive: true,
    },
    include: {
      seller: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      category: true,
      reviews: {
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Related products in the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: {
      category: { select: { name: true, slug: true } },
      seller: { select: { storeName: true, storeSlug: true, isVerified: true } },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
      <Footer />
    </div>
  );
}
