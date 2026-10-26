import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const peerId = searchParams.get("peerId");

    if (peerId) {
      // Get conversation with specific peer
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: peerId },
            { senderId: peerId, receiverId: session.user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      // Mark received as read
      await prisma.message.updateMany({
        where: { senderId: peerId, receiverId: session.user.id, isRead: false },
        data: { isRead: true },
      });

      const peer = await prisma.user.findUnique({
        where: { id: peerId },
        select: { id: true, name: true, image: true, sellerProfile: { select: { storeName: true } } },
      });

      return Response.json({ messages, peer });
    }

    // Get all user messages grouped by peers
    const allMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { id: true, name: true, image: true, sellerProfile: { select: { storeName: true } } },
        },
        receiver: {
          select: { id: true, name: true, image: true, sellerProfile: { select: { storeName: true } } },
        },
      },
    });

    // Unique conversations
    const conversationMap = new Map();
    for (const msg of allMessages) {
      const isSender = msg.senderId === session.user.id;
      const peer = isSender ? msg.receiver : msg.sender;
      if (!conversationMap.has(peer.id)) {
        conversationMap.set(peer.id, {
          peer,
          lastMessage: msg,
          unread: !isSender && !msg.isRead,
        });
      }
    }

    return Response.json({ conversations: Array.from(conversationMap.values()) });
  } catch (err: any) {
    console.error("Messages fetch error:", err);
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content, productId, orderId } = await req.json();

    if (!receiverId || !content?.trim()) {
      return Response.json({ error: "Receiver and message content are required." }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
        productId,
        orderId,
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: "New Message Received",
        message: `${session.user.name || "A user"} sent you a message: "${content.trim().substring(0, 40)}..."`,
        type: "MESSAGE",
        link: "/buyer/messages",
      },
    });

    return Response.json({ message, success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Message send error:", err);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
