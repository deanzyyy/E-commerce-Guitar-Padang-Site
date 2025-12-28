import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await deleteSession();
    return NextResponse.json(
      { message: "Logout berhasil" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}

