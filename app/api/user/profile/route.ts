import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        sellerProfile: true,
        addresses: {
          orderBy: { isDefault: "desc" },
        },
        _count: {
          select: {
            orders: true,
            wishlist: true,
            reviews: true,
            rfqs: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Exclude password
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
    return Response.json({ user: safeUser });
  } catch (err: any) {
    console.error("Profile fetch error:", err);
    return Response.json({ error: "Failed to load user profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, image, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return Response.json({ error: "Current password is required to set a new password." }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return Response.json({ error: "Current password is incorrect." }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return Response.json({ error: "New password must be at least 6 characters." }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return Response.json({ success: true, message: "Password updated successfully!" });
    }

    // Update general profile
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(image !== undefined ? { image } : {}),
      },
    });

    return Response.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        image: updated.image,
      },
    });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "ADMIN") {
      return Response.json({ error: "Admin accounts cannot be deleted directly." }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return Response.json({ success: true, message: "Account deleted successfully." });
  } catch (err: any) {
    console.error("Account delete error:", err);
    return Response.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
