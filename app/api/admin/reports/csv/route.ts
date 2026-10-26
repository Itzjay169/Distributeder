import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new Response("Unauthorized", { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Order Number",
      "Date",
      "Buyer Name",
      "Buyer Email",
      "Status",
      "Payment Method",
      "Payment Status",
      "Subtotal ($)",
      "Discount ($)",
      "Shipping ($)",
      "Tax ($)",
      "Total ($)",
      "Item Count",
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt.toISOString().split("T")[0]}"`,
      `"${o.user.name.replace(/"/g, '""')}"`,
      `"${o.user.email}"`,
      `"${o.status}"`,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      o.subtotal.toFixed(2),
      o.discount.toFixed(2),
      o.shippingCost.toFixed(2),
      o.tax.toFixed(2),
      o.total.toFixed(2),
      o.items.length,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="distributeder-sales-report-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (err: any) {
    console.error("Admin CSV export error:", err);
    return new Response("Export failed", { status: 500 });
  }
}
