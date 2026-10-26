import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return Response.json(
        { error: "You must have an active seller profile to submit quotes." },
        { status: 403 }
      );
    }

    const { unitPrice, deliveryDays, note } = await req.json();

    if (!unitPrice) {
      return Response.json({ error: "Unit price is required." }, { status: 400 });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
    });

    if (!rfq) {
      return Response.json({ error: "RFQ not found." }, { status: 404 });
    }

    const totalPrice = Number((Number(unitPrice) * rfq.quantity).toFixed(2));

    const existingPending = await prisma.quote.findFirst({
      where: {
        rfqId: rfq.id,
        sellerId: sellerProfile.id,
        status: "PENDING",
      },
    });

    let quote;
    if (existingPending) {
      quote = await prisma.quote.update({
        where: { id: existingPending.id },
        data: {
          unitPrice: Number(unitPrice),
          totalPrice,
          deliveryDays: Number(deliveryDays) || 5,
          note: note || null,
        },
      });
    } else {
      quote = await prisma.quote.create({
        data: {
          rfqId: rfq.id,
          sellerId: sellerProfile.id,
          unitPrice: Number(unitPrice),
          totalPrice,
          deliveryDays: Number(deliveryDays) || 5,
          note: note || null,
          status: "PENDING",
        },
      });
    }

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: rfq.buyerId,
        title: "New Quote Received!",
        message: `${sellerProfile.storeName} submitted a quote of ₹${Number(unitPrice).toFixed(2)}/unit for ${rfq.title}.`,
        type: "RFQ",
        link: `/buyer/rfq`,
      },
    });

    return Response.json({ success: true, quote }, { status: 201 });
  } catch (err: any) {
    console.error("Quote create error:", err);
    return Response.json({ error: "Failed to submit quote." }, { status: 500 });
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

    const { quoteId, status } = await req.json();

    if (!quoteId || !["ACCEPTED", "REJECTED"].includes(status)) {
      return Response.json({ error: "Invalid status or quoteId" }, { status: 400 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { rfq: true, seller: true },
    });

    if (!quote) {
      return Response.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.rfq.buyerId !== session.user.id) {
      return Response.json({ error: "Unauthorized to update this quote" }, { status: 403 });
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: { status },
    });

    if (status === "ACCEPTED") {
      await prisma.rFQ.update({
        where: { id: quote.rfqId },
        data: { status: "FULFILLED" },
      });
    }

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: quote.seller.userId,
        title: `Quote ${status}!`,
        message: `Your quote for ${quote.rfq.title} was ${status.toLowerCase()} by the buyer.`,
        type: "RFQ",
        link: `/seller/rfq`,
      },
    });

    return Response.json({ success: true, quote: updated });
  } catch (err: any) {
    console.error("Quote status update error:", err);
    return Response.json({ error: "Failed to update quote status" }, { status: 500 });
  }
}
