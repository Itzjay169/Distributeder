import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getServerAuthSession } from "@/lib/auth";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Invalid file format. Only JPEG, PNG, WEBP, and GIF are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const filename = `${crypto.randomBytes(16).toString("hex")}.${cleanExt}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return Response.json({ url, success: true });
  } catch (err: any) {
    console.error("Upload error:", err);
    return Response.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
