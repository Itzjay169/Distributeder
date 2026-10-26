import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "BUYER";

    if (mode === "SELLER") {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!sellerProfile) {
        return Response.json({ orders: [] });
      }

      // Orders containing items from this seller
      const orderItems = await prisma.orderItem.findMany({
        where: { sellerId: sellerProfile.id },
        include: {
          order: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
              timeline: { orderBy: { createdAt: "desc" } },
            },
          },
        },
        orderBy: { order: { createdAt: "desc" } },
      });

      return Response.json({ orderItems });
    }

    // Default: Buyer's orders
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            seller: { select: { storeName: true, storeSlug: true } },
          },
        },
        timeline: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ orders });
  } catch (err: any) {
    console.error("Orders GET error:", err);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Please log in to place an order." }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingAddress, paymentMethod, couponCode, notes } = body;

    if (!items || !items.length) {
      return Response.json({ error: "No items in cart." }, { status: 400 });
    }

    if (!shippingAddress) {
      return Response.json({ error: "Shipping address is required." }, { status: 400 });
    }

    // Fetch live products to verify stock, price, and wholesale discounts
    const productIds = items.map((i: any) => i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { seller: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const orderItemsData: any[] = [];
    const sellersToNotify = new Set<string>();

    for (const item of items) {
      const dbProd = productMap.get(item.id);
      if (!dbProd) {
        return Response.json({ error: `Product "${item.title}" no longer exists.` }, { status: 400 });
      }

      if (dbProd.stock < item.quantity) {
        return Response.json(
          { error: `Insufficient stock for "${dbProd.title}". Only ${dbProd.stock} available.` },
          { status: 400 }
        );
      }

      if (dbProd.moq && item.quantity < dbProd.moq) {
        return Response.json(
          { error: `Minimum order quantity for "${dbProd.title}" is ${dbProd.moq}.` },
          { status: 400 }
        );
      }

      // Calculate wholesale price
      let unitPrice = dbProd.price;
      if (dbProd.wholesaleTiers) {
        try {
          const tiers = JSON.parse(dbProd.wholesaleTiers);
          const sorted = [...tiers].sort((a: any, b: any) => b.minQty - a.minQty);
          for (const t of sorted) {
            if (item.quantity >= t.minQty) {
              unitPrice = dbProd.price * (1 - t.discountPercent / 100);
              break;
            }
          }
        } catch (e) {
          // fallback to base price
        }
      }

      unitPrice = Number(unitPrice.toFixed(2));
      const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
      calculatedSubtotal += lineTotal;

      let image = "";
      try {
        const parsedImages = JSON.parse(dbProd.images);
        image = parsedImages[0] || "";
      } catch (e) {
        image = dbProd.images;
      }

      orderItemsData.push({
        productId: dbProd.id,
        sellerId: dbProd.sellerId,
        title: dbProd.title,
        price: unitPrice,
        quantity: item.quantity,
        total: lineTotal,
        image,
        variant: item.selectedVariant || null,
      });

      sellersToNotify.add(dbProd.seller.userId);
    }

    // Coupon calculation
    let calculatedDiscount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive && calculatedSubtotal >= coupon.minOrderValue) {
        if (coupon.discountType === "PERCENTAGE") {
          calculatedDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
            calculatedDiscount = coupon.maxDiscount;
          }
        } else {
          calculatedDiscount = coupon.discountValue;
        }
      }
    }
    calculatedDiscount = Number(calculatedDiscount.toFixed(2));

    const shippingCost = calculatedSubtotal >= 300 ? 0 : 25;
    const taxableBase = Math.max(0, calculatedSubtotal - calculatedDiscount);
    const tax = Number((taxableBase * 0.08).toFixed(2));
    const total = Number((taxableBase + shippingCost + tax).toFixed(2));

    const orderNumber = `DST-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Order with Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: "PLACED",
          subtotal: calculatedSubtotal,
          discount: calculatedDiscount,
          couponCode: couponCode || null,
          shippingCost,
          tax,
          total,
          paymentMethod: paymentMethod === "COD" ? "COD" : "CARD",
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
          shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
          notes: notes || null,
          items: {
            create: orderItemsData,
          },
          timeline: {
            create: [
              {
                status: "PLACED",
                description: `Order ${orderNumber} placed via ${
                  paymentMethod === "COD" ? "Cash on Delivery" : "Demo Card Payment (Verified)"
                }.`,
              },
              {
                status: "CONFIRMED",
                description: "Order confirmed and sent to distributors for packing.",
              },
            ],
          },
        },
      });

      // Update product inventory and seller sales
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      return createdOrder;
    });

    // Notify Buyer
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Order Placed Successfully!",
        message: `Your order #${orderNumber} for $${total.toFixed(2)} has been placed.`,
        type: "ORDER",
        link: `/buyer/orders/${orderNumber}`,
      },
    });

    // Notify Sellers
    for (const sellerUserId of sellersToNotify) {
      await prisma.notification.create({
        data: {
          userId: sellerUserId,
          title: "New Incoming Order!",
          message: `Order #${orderNumber} contains items from your store.`,
          type: "ORDER",
          link: `/seller/orders`,
        },
      });
    }

    return Response.json(
      {
        success: true,
        orderNumber: newOrder.orderNumber,
        orderId: newOrder.id,
        total: newOrder.total,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Order create error:", err);
    return Response.json({ error: "Failed to process order." }, { status: 500 });
  }
}
