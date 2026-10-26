import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { status, trackingNumber, notes, description } = await req.json();

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "PACKED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ];

    if (!allowedStatuses.includes(status)) {
      return Response.json({ error: "Invalid order status." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Check authorization: Admin, or Seller who has items in this order
    if (session.user.role !== "ADMIN") {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!sellerProfile) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
      }

      const hasSellerItem = order.items.some((i) => i.sellerId === sellerProfile.id);
      if (!hasSellerItem) {
        return Response.json({ error: "You do not have items in this order" }, { status: 403 });
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
        ...(notes ? { notes } : {}),
        timeline: {
          create: {
            status,
            description:
              description ||
              `Order status updated to ${status} by ${session.user.name || "merchant"}.`,
          },
        },
      },
      include: {
        timeline: { orderBy: { createdAt: "desc" } },
      },
    });

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order #${order.orderNumber} ${status}`,
        message: `Your order status has been updated to ${status}.${
          trackingNumber ? ` Tracking Number: ${trackingNumber}` : ""
        }`,
        type: "ORDER",
        link: `/buyer/orders/${order.orderNumber}`,
      },
    });

    return Response.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    console.error("Order status update error:", err);
    return Response.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
