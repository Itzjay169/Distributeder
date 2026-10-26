import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return Response.json({ addresses });
  } catch (err: any) {
    console.error("Addresses get error:", err);
    return Response.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, street, city, state, postalCode, country, isDefault } = body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return Response.json({ error: "Please fill in all required address fields." }, { status: 400 });
    }

    // If setting as default, remove default from others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country: country || "United States",
        isDefault: !!isDefault,
      },
    });

    return Response.json({ address, success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Create address error:", err);
    return Response.json({ error: "Failed to create address" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Address ID required" }, { status: 400 });
    }

    await prisma.address.deleteMany({
      where: { id, userId: session.user.id },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Delete address error:", err);
    return Response.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
