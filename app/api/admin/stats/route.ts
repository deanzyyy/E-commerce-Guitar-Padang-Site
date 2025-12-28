import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Verify admin
    await requireAdmin();

    // Get current month and year for monthly revenue calculation
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Count products
    const totalProducts = await prisma.product.count();
    
    // Count aksesoris
    const totalAksesoris = await prisma.aksesoris.count();

    // For now, we'll use dummy data for revenue and sales
    // In a real app, you'd have an Order/Transaction model
    // TODO: Implement Order model for real revenue and sales tracking
    const monthlyRevenue = 0; // Will be calculated from orders when Order model exists
    const totalProductsSold = 0; // Will be calculated from orders
    const totalAksesorisSold = 0; // Will be calculated from orders

    return NextResponse.json({
      monthlyRevenue,
      totalProducts,
      totalAksesoris,
      totalProductsSold,
      totalAksesorisSold,
      month: now.toLocaleString("id-ID", { month: "long", year: "numeric" }),
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}

