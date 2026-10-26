import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return Response.json({ notifications, unreadCount });
  } catch (err: any) {
    console.error("Notifications error:", err);
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, markAll } = await req.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { isRead: true },
      });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Notification update error:", err);
    return Response.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
