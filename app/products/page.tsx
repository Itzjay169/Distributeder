import React from "react";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductsView from "@/components/products/ProductsView";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;

  const category = params.category;
  const q = params.q;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sort = params.sort || "featured";
  const inStock = params.inStock === "true";
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 12;

  const where: any = { isActive: true };

  if (category) {
    where.category = { slug: category };
  }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (inStock) {
    where.stock = { gt: 0 };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };
  if (sort === "popular") orderBy = { reviewCount: "desc" };
  if (sort === "featured") orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { storeName: true, storeSlug: true, isVerified: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <ProductsView
        initialProducts={products}
        categories={categories}
        total={totalCount}
        currentPage={page}
        totalPages={Math.ceil(totalCount / limit)}
      />
      <Footer />
    </div>
  );
}
