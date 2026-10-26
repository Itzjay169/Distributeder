import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");
    const session = await getServerAuthSession();

    if (mine === "true" && session?.user?.id) {
      const myRfqs = await prisma.rFQ.findMany({
        where: { buyerId: session.user.id },
        include: {
          quotes: {
            include: {
              seller: { select: { storeName: true, storeSlug: true, rating: true, isVerified: true } },
            },
            orderBy: { unitPrice: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return Response.json({ rfqs: myRfqs });
    }

    const seller = searchParams.get("seller");
    if (seller === "true") {
      let sellerProfile = null;
      if (session?.user?.id) {
        sellerProfile = await prisma.sellerProfile.findUnique({
          where: { userId: session.user.id },
        });
      }

      const openRfqs = await prisma.rFQ.findMany({
        include: {
          buyer: { select: { name: true, email: true } },
          _count: { select: { quotes: true } },
          quotes: sellerProfile
            ? {
                where: { sellerId: sellerProfile.id },
              }
            : false,
        },
        orderBy: { createdAt: "desc" },
      });

      const myQuotes = sellerProfile
        ? await prisma.quote.findMany({
            where: { sellerId: sellerProfile.id },
            include: {
              rfq: {
                include: {
                  buyer: { select: { name: true, email: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : [];

      return Response.json({
        rfqs: openRfqs,
        myQuotes,
        sellerProfile: sellerProfile
          ? {
              id: sellerProfile.id,
              storeName: sellerProfile.storeName,
              isVerified: sellerProfile.isVerified,
            }
          : null,
      });
    }

    // Public RFQ listings
    const rfqs = await prisma.rFQ.findMany({
      include: {
        buyer: { select: { name: true } },
        _count: { select: { quotes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ rfqs });
  } catch (err: any) {
    console.error("RFQ GET error:", err);
    return Response.json({ error: "Failed to fetch RFQs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Please log in to submit a quote request." }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, description, quantity, targetPrice, deliveryLocation, deadline } = body;

    if (!title || !description || !quantity || !deliveryLocation) {
      return Response.json({ error: "Please fill in all required RFQ fields." }, { status: 400 });
    }

    const rfqNumber = `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const rfq = await prisma.rFQ.create({
      data: {
        rfqNumber,
        buyerId: session.user.id,
        title,
        category: category || "General",
        description,
        quantity: Number(quantity),
        targetPrice: targetPrice ? Number(targetPrice) : null,
        deliveryLocation,
        deadline: deadline ? new Date(deadline) : null,
        status: "OPEN",
      },
    });

    return Response.json({ success: true, rfq }, { status: 201 });
  } catch (err: any) {
    console.error("RFQ POST error:", err);
    return Response.json({ error: "Failed to create RFQ" }, { status: 500 });
  }
}
