import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";

// GET orders - untuk user melihat pesanan mereka
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const status = searchParams.get("status");

    // Admin can see all orders, user can only see their own
    // For now, we'll show all orders (you can add user_id later if needed)
    const where: any = {};

    // Filter by status if provided
    if (status) {
      where.transaction_status = status;
    } else if (!isAdmin) {
      // For user, only show paid orders or COD
      where.OR = [
        { transaction_status: "PAID" },
        { payment_method: "COD" },
        { transaction_status: "PENDING" }, // Show pending for user to see payment status
      ];
    }

    try {
      const orders = await prisma.order.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ orders });
    } catch (dbError: any) {
      // Handle Prisma errors specifically
      if (dbError.code === "P2001" || dbError.message?.includes("does not exist")) {
        console.error("Database table not found. Please run migrations.");
        return NextResponse.json(
          { 
            error: "Database table not found",
            details: "Please run: npx prisma migrate dev"
          },
          { status: 500 }
        );
      }
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error("Get orders error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch orders",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE order - untuk cancel order
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: "order_id is required" },
        { status: 400 }
      );
    }

    // Only allow delete if status is PENDING
    const order = await prisma.order.findUnique({
      where: { order_id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.transaction_status !== "PENDING") {
      return NextResponse.json(
        { error: "Order cannot be cancelled" },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { order_id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

