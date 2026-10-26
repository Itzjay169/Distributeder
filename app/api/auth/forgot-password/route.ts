import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Please enter your email address." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return Response.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // In demo mode, return the reset URL directly for immediate testing
    const resetUrl = `/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    return Response.json({
      success: true,
      message: "Reset link generated successfully (Demo Mode)",
      resetUrl,
      token,
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return Response.json({ error: "Failed to generate password reset link." }, { status: 500 });
  }
}
