import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const product_name = form.get("product_name") as string;
    const product_priceStr = form.get("product_price") as string;
    const category = form.get("category") as string;
    const description = form.get("description") as string | null;
    const image = form.get("image") as File | null;

    // Validasi input
    if (!product_name || !product_name.trim()) {
      return NextResponse.json(
        { error: "Nama aksesoris wajib diisi" },
        { status: 400 }
      );
    }

    if (!product_priceStr) {
      return NextResponse.json(
        { error: "Harga wajib diisi" },
        { status: 400 }
      );
    }

    const product_price = Number(product_priceStr);
    if (!Number.isFinite(product_price) || product_price <= 0) {
      return NextResponse.json(
        { error: "Harga harus berupa angka positif" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi category sesuai enum
    const validCategories = [
      "STRINGS",
      "PICK",
      "CAPO",
      "TUNER",
      "CASE",
      "STRAP",
      "CABLE",
      "AMPLIFIER",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Kategori tidak valid. Pilih dari: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    let imagePath = null;

    if (image && image instanceof File && image.size > 0) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${Date.now()}-${image.name}`;
        const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

        await writeFile(uploadPath, buffer);

        imagePath = `/uploads/${fileName}`;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        // Continue without image if upload fails
      }
    }

    const newAksesoris = await prisma.aksesoris.create({
      data: {
        product_name: product_name.trim(),
        product_price,
        Category: category as any,
        description: description?.trim() || null,
        image: imagePath,
      },
    });

    return NextResponse.json(newAksesoris, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    
    // Provide more detailed error message
    let errorMessage = "Terjadi error saat membuat aksesoris";
    if (error?.code === "P2002") {
      errorMessage = "Aksesoris dengan nama tersebut sudah ada";
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        code: error?.code,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const aksesoris = await prisma.aksesoris.findMany({
      orderBy: { id_aksesoris: "desc" },
    });
    return NextResponse.json(aksesoris);
  } catch (error: any) {
    console.error("GET error:", error);
    
    // Check if table doesn't exist
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      return NextResponse.json(
        { 
          error: "Tabel Aksesoris belum ada. Silakan jalankan migration terlebih dahulu.",
          code: error?.code 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Gagal mengambil aksesoris",
        message: error?.message 
      },
      { status: 500 }
    );
  }
}

