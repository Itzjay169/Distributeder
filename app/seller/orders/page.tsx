import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SellerLayout from "@/components/seller/SellerLayout";
import SellerOrdersManager from "@/components/seller/SellerOrdersManager";

export default async function SellerOrdersPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/seller/login?callbackUrl=/seller/orders");
  }

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!sellerProfile) {
    redirect("/buyer/dashboard");
  }

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

  return (
    <SellerLayout>
      <SellerOrdersManager initialOrderItems={orderItems} />
    </SellerLayout>
  );
}
