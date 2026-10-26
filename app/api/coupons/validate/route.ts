import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return Response.json({ error: "Please enter a coupon code" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return Response.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return Response.json({ error: "This coupon code has expired" }, { status: 400 });
    }

    if (subtotal < coupon.minOrderValue) {
      return Response.json(
        {
          error: `Minimum order value of $${coupon.minOrderValue.toFixed(
            2
          )} required for this coupon.`,
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
      },
    });
  } catch (err: any) {
    console.error("Coupon validate error:", err);
    return Response.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
