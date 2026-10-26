import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const disputes = await prisma.disputeReport.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ disputes });
  } catch (err: any) {
    console.error("Disputes GET error:", err);
    return Response.json({ error: "Failed to fetch disputes" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id, status } = await req.json();

    if (!id || !["OPEN", "RESOLVED", "DISMISSED"].includes(status)) {
      return Response.json({ error: "Invalid status or dispute ID" }, { status: 400 });
    }

    const updated = await prisma.disputeReport.update({
      where: { id },
      data: { status },
    });

    return Response.json({ success: true, dispute: updated });
  } catch (err: any) {
    console.error("Dispute update error:", err);
    return Response.json({ error: "Failed to update dispute" }, { status: 500 });
  }
}
