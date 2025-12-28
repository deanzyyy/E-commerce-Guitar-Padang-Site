import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

