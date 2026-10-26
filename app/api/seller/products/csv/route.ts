import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return new Response("Seller profile not found", { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { sellerId: sellerProfile.id },
      include: { category: true },
    });

    const headers = ["title", "sku", "price", "stock", "moq", "category", "description", "images"];
    const rows = products.map((p) => {
      let img = "";
      try {
        const arr = JSON.parse(p.images);
        img = arr[0] || "";
      } catch (e) {
        img = p.images;
      }

      return [
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.sku || ""}"`,
        p.price,
        p.stock,
        p.moq,
        `"${p.category.name}"`,
        `"${(p.description || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${img}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products-${sellerProfile.storeSlug}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("CSV export error:", err);
    return new Response("Export failed", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return Response.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { csvData } = body;

    if (!csvData) {
      return Response.json({ error: "No CSV content provided." }, { status: 400 });
    }

    const lines = csvData
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    if (lines.length < 2) {
      return Response.json({ error: "CSV must contain header and at least one item row." }, { status: 400 });
    }

    // Default category fallback
    const defaultCategory = await prisma.category.findFirst();
    if (!defaultCategory) {
      return Response.json({ error: "No categories exist." }, { status: 400 });
    }

    let importedCount = 0;
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      // Split by comma outside quotes
      const line = lines[i];
      const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (!match || match.length < 3) continue;

      const cleanCol = (idx: number) => {
        if (!match[idx]) return "";
        let val = match[idx].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val;
      };

      const title = cleanCol(0);
      const sku = cleanCol(1);
      const price = parseFloat(cleanCol(2)) || 29.99;
      const stock = parseInt(cleanCol(3)) || 50;
      const moq = parseInt(cleanCol(4)) || 1;
      const description = cleanCol(6) || "Imported commercial inventory.";
      const img = cleanCol(7) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

      if (!title) continue;

      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") + `-${Math.floor(1000 + Math.random() * 9000)}`;

      await prisma.product.create({
        data: {
          sellerId: sellerProfile.id,
          categoryId: defaultCategory.id,
          title,
          slug,
          sku: sku || null,
          price,
          stock,
          moq,
          description,
          images: JSON.stringify([img]),
          isActive: true,
        },
      });

      importedCount++;
    }

    return Response.json({
      success: true,
      importedCount,
      message: `Successfully imported ${importedCount} products from CSV!`,
    });
  } catch (err: any) {
    console.error("CSV import error:", err);
    return Response.json({ error: "Failed to parse and import CSV." }, { status: 500 });
  }
}
