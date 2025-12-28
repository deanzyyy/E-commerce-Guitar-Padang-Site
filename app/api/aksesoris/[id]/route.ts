import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const aksesorisId = Number(id);

  try {
    const aksesoris = await prisma.aksesoris.findUnique({
      where: { id_aksesoris: aksesorisId },
    });

    if (!aksesoris) {
      return NextResponse.json(
        { error: "Aksesoris tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(aksesoris);
  } catch (error) {
    console.error("GET aksesoris by ID error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const idNumber = Number(id);

    if (!idNumber) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.aksesoris.delete({
      where: { id_aksesoris: idNumber },
    });

    return NextResponse.json({ message: "Aksesoris berhasil dihapus" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus aksesoris" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const aksesorisId = Number(id);

    const form = await req.formData();

    const product_name = form.get("product_name") as string;
    const product_price = Number(form.get("product_price"));
    const category = form.get("category") as string;
    const description = form.get("description") as string;
    const image = form.get("image") as File | null;

    let imagePath = undefined;

    // Jika upload gambar baru
    if (image && typeof image !== "string") {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${image.name}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

      await writeFile(uploadPath, buffer);

      imagePath = `/uploads/${fileName}`;
    }

    const updated = await prisma.aksesoris.update({
      where: { id_aksesoris: aksesorisId },
      data: {
        product_name,
        product_price,
        Category: category,
        description,
        ...(imagePath ? { image: imagePath } : {}), // hanya update gambar jika upload baru
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE error:", error);
    return NextResponse.json(
      { error: "Gagal update aksesoris" },
      { status: 500 }
    );
  }
}

