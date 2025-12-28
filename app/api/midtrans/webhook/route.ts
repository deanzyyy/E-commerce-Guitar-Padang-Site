import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";

// Verify webhook signature (optional but recommended)
function verifySignature(payload: string, signature: string, serverKey: string): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(payload + serverKey)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-midtrans-signature") || "";
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    // Verify signature (optional, but recommended for production)
    // if (!verifySignature(payload, signature, serverKey)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const data = JSON.parse(payload);

    const orderId = data.order_id;
    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;
    const paymentType = data.payment_type;

    console.log("Webhook Midtrans received:", {
      order_id: orderId,
      transaction_status: transactionStatus,
      payment_type: paymentType,
      fraud_status: fraudStatus,
    });

    // 🔥 WEBHOOK ADALAH SATU-SATUNYA PENENTU STATUS
    // Convert Midtrans status to internal status
    let newStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" = "PENDING";

    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      // For settlement/capture, check fraud status if available
      if (fraudStatus === "accept" || !fraudStatus) {
        newStatus = "PAID";
      } else {
        newStatus = "FAILED";
      }
    } else if (transactionStatus === "pending") {
      newStatus = "PENDING";
    } else if (transactionStatus === "expire") {
      newStatus = "EXPIRED";
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "failure"
    ) {
      newStatus = "FAILED";
    }

    // 🔥 UPDATE DATABASE - INI ADALAH SATU-SATUNYA CARA UPDATE STATUS
    await prisma.order.update({
      where: { order_id: orderId },
      data: {
        transaction_status: newStatus,
        payment_type: paymentType || null,
        fraud_status: fraudStatus || null,
        paid_at: newStatus === "PAID" ? new Date() : null,
      },
    });

    console.log("Order updated via webhook:", orderId, "->", newStatus);

    return NextResponse.json({ 
      received: true,
      order_id: orderId,
      status: newStatus 
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    
    // If order not found, log but don't fail (might be test webhook)
    if (error.code === "P2025") {
      console.warn("Order not found in database:", error.meta?.cause);
      return NextResponse.json({ received: true, warning: "Order not found" });
    }
    
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
