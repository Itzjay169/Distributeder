import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isSeller: z.boolean().optional(),
  storeName: z.string().optional(),
  companyType: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, password, isSeller, storeName, companyType } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return Response.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with optional seller profile
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: "USER",
        isSeller: !!isSeller,
        activeMode: isSeller ? "SELLER" : "BUYER",
        isEmailVerified: true, // Demo simulation
        ...(isSeller && storeName
          ? {
              sellerProfile: {
                create: {
                  storeName: storeName.trim(),
                  storeSlug: storeName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "") + `-${Math.floor(1000 + Math.random() * 9000)}`,
                  companyType: companyType || "Distributor",
                  isApproved: true,
                  isVerified: true,
                },
              },
            }
          : {}),
      },
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to Distributeder!",
        message:
          "Your account is set up. You can easily switch between Buyer and Seller modes from the navigation bar anytime.",
        type: "SYSTEM",
        link: "/buyer/dashboard",
      },
    });

    return Response.json(
      {
        message: "Account created successfully!",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register error:", err);
    return Response.json(
      { error: "An unexpected error occurred while creating your account." },
      { status: 500 }
    );
  }
}
