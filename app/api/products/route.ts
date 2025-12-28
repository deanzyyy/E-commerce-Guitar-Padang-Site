import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const product_name = form.get("product_name") as string;
    const product_price = Number(form.get("product_price"));
    const category = form.get("category") as string;
    const description = form.get("description") as string;
    const image = form.get("image") as File | null;

    if (!product_name || !product_price || !category) {
      return NextResponse.json(
        { error: "product_name, product_price, dan category wajib diisi" },
        { status: 400 }
      );
    }

    let imagePath = null;

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${image.name}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

      await writeFile(uploadPath, buffer);

      imagePath = `/uploads/${fileName}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        product_name,
        product_price,
        Category: category,
        description,
        image: imagePath,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Terjadi error saat membuat product", detail: error },
      { status: 500 }
    );
  }
}

export async function GET(){
  try{
    const products = await prisma.product.findMany({
      orderBy: {id_product:"desc"}
    });
    return NextResponse.json(products);
  }catch(error){
    console.error("GET error:",error);
    return NextResponse.json(
      {error: "Gagal mengambil produk"},
      {status: 500}
    );
  }
}