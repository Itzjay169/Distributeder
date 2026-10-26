import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return Response.json({ error: "Product ID required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ reviews });
  } catch (err: any) {
    console.error("Reviews GET error:", err);
    return Response.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Please log in to submit a review." }, { status: 401 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || !comment?.trim()) {
      return Response.json({ error: "Rating and review comment are required." }, { status: 400 });
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating)));

    // Check if buyer has ordered this product (for verified purchase badge)
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: session.user.id },
      },
    });

    const review = await prisma.review.upsert({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
      create: {
        productId,
        userId: session.user.id,
        rating: numericRating,
        comment: comment.trim(),
        isVerifiedPurchase: !!hasOrdered,
      },
      update: {
        rating: numericRating,
        comment: comment.trim(),
        isVerifiedPurchase: !!hasOrdered,
      },
    });

    // Recalculate average rating on product
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Number(avgRating.toFixed(1)),
        reviewCount: allReviews.length,
      },
    });

    return Response.json({ success: true, review });
  } catch (err: any) {
    console.error("Reviews POST error:", err);
    return Response.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
