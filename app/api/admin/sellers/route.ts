import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const sellers = await prisma.sellerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { products: true, quotes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ sellers });
  } catch (err: any) {
    console.error("Admin sellers GET error:", err);
    return Response.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { sellerId, isApproved, isVerified } = await req.json();

    if (!sellerId) {
      return Response.json({ error: "Seller ID required" }, { status: 400 });
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: {
        ...(isApproved !== undefined ? { isApproved: !!isApproved } : {}),
        ...(isVerified !== undefined ? { isVerified: !!isVerified } : {}),
      },
      include: { user: true },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: "Seller Status Updated",
        message: `Your distributor profile verification status has been updated by platform administration.`,
        type: "SYSTEM",
        link: "/seller/settings",
      },
    });

    return Response.json({ success: true, seller: updated });
  } catch (err: any) {
    console.error("Admin seller update error:", err);
    return Response.json({ error: "Failed to update seller status" }, { status: 500 });
  }
}
