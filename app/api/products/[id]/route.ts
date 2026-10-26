import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        seller: {
          include: {
            user: { select: { name: true, image: true, email: true, createdAt: true } },
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
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Also fetch 4 related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        seller: { select: { storeName: true, storeSlug: true } },
      },
    });

    return Response.json({ product, relatedProducts });
  } catch (err: any) {
    console.error("Product detail error:", err);
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Only product owner seller or admin can edit
    if (session.user.role !== "ADMIN" && product.seller.userId !== session.user.id) {
      return Response.json({ error: "Unauthorized to edit this product" }, { status: 403 });
    }

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
      isActive,
      isFeatured,
    } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
        ...(compareAtPrice !== undefined ? { compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null } : {}),
        ...(sku !== undefined ? { sku } : {}),
        ...(stock !== undefined ? { stock: parseInt(stock) } : {}),
        ...(moq !== undefined ? { moq: parseInt(moq) } : {}),
        ...(wholesaleTiers !== undefined ? { wholesaleTiers: typeof wholesaleTiers === "string" ? wholesaleTiers : JSON.stringify(wholesaleTiers) } : {}),
        ...(images !== undefined ? { images: typeof images === "string" ? images : JSON.stringify(images) } : {}),
        ...(variants !== undefined ? { variants: typeof variants === "string" ? variants : JSON.stringify(variants) } : {}),
        ...(isActive !== undefined ? { isActive: !!isActive } : {}),
        ...(isFeatured !== undefined ? { isFeatured: !!isFeatured } : {}),
      },
    });

    return Response.json({ success: true, product: updated });
  } catch (err: any) {
    console.error("Product update error:", err);
    return Response.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && product.seller.userId !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return Response.json({ success: true, message: "Product deleted successfully." });
  } catch (err: any) {
    console.error("Product delete error:", err);
    return Response.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
