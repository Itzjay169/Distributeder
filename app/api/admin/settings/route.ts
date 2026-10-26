import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const settings = await prisma.platformSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return Response.json({
      settings: {
        commission_rate: settingsMap["commission_rate"] || "5.0",
        default_tax_rate: settingsMap["default_tax_rate"] || "8.0",
        platform_currency: settingsMap["platform_currency"] || "USD",
        platform_name: settingsMap["platform_name"] || "Distributeder",
        contact_email: settingsMap["contact_email"] || "support@distributeder.com",
      },
    });
  } catch (err: any) {
    console.error("Settings GET error:", err);
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await prisma.platformSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
      }
    }

    return Response.json({ success: true, message: "Settings saved successfully." });
  } catch (err: any) {
    console.error("Settings PUT error:", err);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
