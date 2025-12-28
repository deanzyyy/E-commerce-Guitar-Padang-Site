import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";


export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    const productId = Number(id);
  
    try {
      const product = await prisma.product.findUnique({
        where: { id_product: productId },
      });
  
      if (!product) {
        return NextResponse.json(
          { error: "Produk tidak ditemukan" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(product);
    } catch (error) {
      console.error("GET product by ID error:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan server" },
        { status: 500 }
      );
    }
  }

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 

  try {
    const idNumber = Number(id);

    if (!idNumber) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id_product: idNumber },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const productId = Number(id);
  
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
  
      const updated = await prisma.product.update({
        where: { id_product: productId },
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
        { error: "Gagal update produk" },
        { status: 500 }
      );
    }
  }
  
