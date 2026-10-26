import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSeller: true,
        activeMode: true,
        isBanned: true,
        createdAt: true,
        sellerProfile: {
          select: {
            storeName: true,
            isApproved: true,
            isVerified: true,
            rating: true,
          },
        },
        _count: {
          select: { orders: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ users });
  } catch (err: any) {
    console.error("Admin users GET error:", err);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, isBanned, role } = await req.json();

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(isBanned !== undefined ? { isBanned: !!isBanned } : {}),
        ...(role !== undefined ? { role } : {}),
      },
    });

    return Response.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("Admin user update error:", err);
    return Response.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
