import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { prisma } from "@/app/lib/prisma";

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      subtotal,
      shippingCost,
      total,
      recipientName,
      recipientPhone,
      shippingAddress,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Items tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!recipientName || !recipientPhone || !shippingAddress) {
      return NextResponse.json(
        { error: "Data pengiriman harus lengkap" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // 🔥 STEP 1: SIMPAN ORDER KE DATABASE TERLEBIH DAHULU dengan status PENDING
    const order = await prisma.order.create({
      data: {
        order_id: orderId,
        gross_amount: total,
        transaction_status: "PENDING",
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        items: items as any, // Store as JSON
        subtotal: subtotal,
        shipping_cost: shippingCost,
      },
    });

    // Handle COD - no need to send to Midtrans
    if (paymentMethod === "COD") {
      // For COD, order is already created with PENDING status
      return NextResponse.json({
        success: true,
        orderId,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pesanan`,
      });
    }

    // Prepare item details for Midtrans
    const itemDetails = items.map((item: any) => ({
      id: `${item.type}-${item.id_product}`,
      price: item.product_price,
      quantity: item.quantity,
      name: item.product_name,
    }));

    // Add shipping as item
    itemDetails.push({
      id: "SHIPPING",
      price: shippingCost,
      quantity: 1,
      name: "Ongkos Kirim",
    });

    // Prepare customer details
    const customerDetails = {
      first_name: recipientName.split(" ")[0] || recipientName,
      last_name: recipientName.split(" ").slice(1).join(" ") || "",
      phone: recipientPhone,
      shipping_address: {
        first_name: recipientName.split(" ")[0] || recipientName,
        last_name: recipientName.split(" ").slice(1).join(" ") || "",
        phone: recipientPhone,
        address: shippingAddress,
      },
    };

    // Prepare transaction details
    const transactionDetails = {
      order_id: orderId,
      gross_amount: total,
    };

    // Prepare payment method based on selection
    let enabledPayments: string[] = [];
    if (paymentMethod === "QRIS") {
      enabledPayments = ["qris"];
    } else if (paymentMethod === "TRANSFER") {
      enabledPayments = ["bank_transfer"];
    } else if (paymentMethod === "DANA") {
      enabledPayments = ["dana"];
    } else if (paymentMethod === "GOPAY") {
      enabledPayments = ["gopay"];
    } else {
      return NextResponse.json(
        { error: "Metode pembayaran tidak valid" },
        { status: 400 }
      );
    }

    // Create transaction parameters
    const parameter = {
      transaction_details: transactionDetails,
      item_details: itemDetails,
      customer_details: customerDetails,
      enabled_payments: enabledPayments,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pesanan`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pesanan`,
      },
    };

    // 🔥 STEP 2: BARU KIRIM KE MIDTRANS setelah order tersimpan di database
    const transaction = await snap.createTransaction(parameter);
    const token = transaction.token;
    const redirectUrl = transaction.redirect_url;

    return NextResponse.json({
      success: true,
      token,
      orderId,
      redirectUrl,
    });
  } catch (error: any) {
    console.error("Midtrans error:", error);
    
    // If order was created but Midtrans failed, you might want to update status to FAILED
    // For now, we'll just return error
    
    return NextResponse.json(
      {
        error: error.message || "Gagal membuat transaksi pembayaran",
      },
      { status: 500 }
    );
  }
}

