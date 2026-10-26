import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "featured";
    const inStock = searchParams.get("inStock");
    const sellerId = searchParams.get("sellerId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12"));

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { sku: { contains: query } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock === "true") {
      where.stock = { gt: 0 };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };
    if (sort === "rating") orderBy = { rating: "desc" };
    if (sort === "popular") orderBy = { reviewCount: "desc" };
    if (sort === "featured") orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: {
            select: { storeName: true, storeSlug: true, rating: true, isVerified: true },
          },
          category: { select: { name: true, slug: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: any) {
    console.error("Products GET error:", err);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return Response.json(
        { error: "Seller profile required to list products" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      categoryId,
      description,
      price,
      compareAtPrice,
      sku,
      stock,
      moq,
      wholesaleTiers,
      images,
      variants,
    } = body;

    if (!title || !categoryId || !price) {
      return Response.json(
        { error: "Title, category, and price are required." },
        { status: 400 }
      );
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await prisma.product.create({
      data: {
        sellerId: sellerProfile.id,
        categoryId,
        title,
        slug,
        description: description || "",
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        sku: sku || null,
        stock: stock !== undefined ? parseInt(stock) : 100,
        moq: moq !== undefined ? parseInt(moq) : 1,
        wholesaleTiers: wholesaleTiers ? (typeof wholesaleTiers === "string" ? wholesaleTiers : JSON.stringify(wholesaleTiers)) : null,
        images: images ? (typeof images === "string" ? images : JSON.stringify(images)) : JSON.stringify(["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"]),
        variants: variants ? (typeof variants === "string" ? variants : JSON.stringify(variants)) : null,
        isActive: true,
      },
    });

    return Response.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error("Product create error:", err);
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}
