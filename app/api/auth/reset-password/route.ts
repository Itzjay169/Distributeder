import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return Response.json(
        { error: "Email, token, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || user.resetToken !== token) {
      return Response.json(
        { error: "Invalid or expired password reset link." },
        { status: 400 }
      );
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return Response.json(
        { error: "Password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return Response.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return Response.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
