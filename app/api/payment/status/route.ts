import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// Initialize Midtrans Core API
const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { midtransOrderId } = body;

    if (!midtransOrderId) {
      return NextResponse.json(
        { error: "midtransOrderId is required" },
        { status: 400 }
      );
    }

    // Check transaction status from Midtrans
    const transaction = await coreApi.transaction.status(midtransOrderId);

    let paymentStatus: "pending" | "paid" | "failed" = "pending";

    // Handle settlement status (payment successful)
    if (transaction.transaction_status === "settlement" || transaction.transaction_status === "capture") {
      // For settlement, payment is considered paid
      // fraud_status might not always be present, so we check if it exists
      if (transaction.fraud_status) {
        if (transaction.fraud_status === "accept") {
          paymentStatus = "paid";
        } else {
          paymentStatus = "failed";
        }
      } else {
        // If fraud_status is not present but status is settlement, consider it paid
        paymentStatus = "paid";
      }
    } else if (transaction.transaction_status === "pending") {
      paymentStatus = "pending";
    } else if (
      transaction.transaction_status === "deny" ||
      transaction.transaction_status === "cancel" ||
      transaction.transaction_status === "expire" ||
      transaction.transaction_status === "failure"
    ) {
      paymentStatus = "failed";
    }

    return NextResponse.json({
      success: true,
      midtransOrderId,
      paymentStatus,
      transactionStatus: transaction.transaction_status,
    });
  } catch (error: any) {
    console.error("Check payment status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}

