import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    take: 100,
  });

  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((c) => ({
    url: `${baseUrl}/products?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rfq`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
