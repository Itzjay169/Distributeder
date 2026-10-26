import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ items: [] });
    }

    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            seller: { select: { storeName: true, storeSlug: true } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ items: wishlist.map((w) => w.product) });
  } catch (err: any) {
    console.error("Wishlist GET error:", err);
    return Response.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Please log in to add to wishlist." }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return Response.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Upsert wishlist item
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      create: {
        userId: session.user.id,
        productId,
      },
      update: {},
    });

    return Response.json({ success: true, message: "Added to wishlist" });
  } catch (err: any) {
    console.error("Wishlist POST error:", err);
    return Response.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return Response.json({ error: "Product ID required" }, { status: 400 });
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return Response.json({ success: true, message: "Removed from wishlist" });
  } catch (err: any) {
    console.error("Wishlist DELETE error:", err);
    return Response.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
