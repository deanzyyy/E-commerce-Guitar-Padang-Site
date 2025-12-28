"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductNavbar from "@/app/components/utilities/ProductNavbar";
import NotificationModal from "@/app/components/utilities/NotificationModal";

interface OrderItem {
  id_product: number;
  product_name: string;
  product_price: number;
  Category?: string;
  category?: string;
  description: string | null;
  image: string | null;
  quantity: number;
  type: "product" | "aksesoris";
}

interface Order {
  id: number;
  order_id: string;
  gross_amount: number;
  transaction_status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  payment_type: string | null;
  fraud_status: string | null;
  paid_at: string | null;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  createdAt: string;
  updatedAt: string;
}

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">("success");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to load orders:", response.status, errorData);
          // Set empty array on error instead of showing error
          setOrders([]);
        }
      } catch (error: any) {
        console.error("Error loading orders:", error);
        // Set empty array on error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Auto refresh every 5 seconds to check for status updates
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Order["transaction_status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "PAID":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "EXPIRED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Order["transaction_status"]) => {
    switch (status) {
      case "PENDING":
        return "Menunggu Pembayaran";
      case "PAID":
        return "Sudah Dibayar";
      case "FAILED":
        return "Gagal";
      case "EXPIRED":
        return "Kedaluwarsa";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = async (order: Order) => {
    // Hanya bisa dibatalkan jika status masih PENDING
    if (order.transaction_status === "PENDING") {
      if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
        try {
          const response = await fetch("/api/orders", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              order_id: order.order_id,
            }),
          });

          if (response.ok) {
            setModalMessage("Pesanan berhasil dibatalkan");
            setModalType("success");
            setShowModal(true);
            // Refresh orders
            const refreshResponse = await fetch("/api/orders");
            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              setOrders(data.orders || []);
            }
          } else {
            const data = await response.json();
            setModalMessage(data.error || "Gagal membatalkan pesanan");
            setModalType("error");
            setShowModal(true);
          }
        } catch (error) {
          setModalMessage("Terjadi kesalahan saat membatalkan pesanan");
          setModalType("error");
          setShowModal(true);
        }
      }
    } else {
      // Tampilkan modal bahwa pesanan tidak dapat dibatalkan
      setModalMessage("Pesanan tidak dapat dibatalkan atau dihapus karena status sudah berubah");
      setModalType("error");
      setShowModal(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-black text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <NotificationModal
        message={modalMessage}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
      />
      <ProductNavbar />

      <div className="px-12 py-8">
        <h1 className="text-black text-4xl font-bold mb-8">Pesanan Saya</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-black text-xl mb-4">Belum ada pesanan</p>
            <Link
              href="/productlist"
              className="text-black border border-black px-6 py-2 rounded hover:bg-black hover:text-white transition"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-black rounded-lg p-6"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-black">
                  <div>
                    <h2 className="text-black text-xl font-bold mb-2">
                      {order.order_id}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {formatDate(order.createdAt)}
                    </p>
                    {/* Keterangan "Produk sudah dibayar" */}
                    {order.transaction_status === "PAID" && (
                      <div className="mt-2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold">
                          ✓ Produk sudah dibayar
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`${getStatusColor(
                        order.transaction_status
                      )} text-white px-3 py-1 rounded text-sm font-semibold mb-2`}
                    >
                      {getStatusText(order.transaction_status)}
                    </span>
                    <p className="text-green-600 font-bold text-lg">
                      Rp {order.gross_amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Shipping & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-300">
                  <div>
                    <h3 className="text-black font-semibold mb-2">
                      Informasi Pengiriman
                    </h3>
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Nama:</span>{" "}
                      {order.recipient_name || "-"}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Telepon:</span>{" "}
                      {order.recipient_phone || "-"}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Alamat:</span>{" "}
                      {order.shipping_address || "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-black font-semibold mb-2">
                      Informasi Pembayaran
                    </h3>
                    <p className="text-gray-700 text-sm mb-2">
                      <span className="font-semibold">Metode:</span>{" "}
                      {order.payment_method === "QRIS"
                        ? "QRIS"
                        : order.payment_method === "TRANSFER"
                        ? "Transfer Bank"
                        : order.payment_method === "DANA"
                        ? "DANA"
                        : order.payment_method === "GOPAY"
                        ? "GoPay"
                        : "COD (Cash on Delivery)"}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">Status:</span>{" "}
                        {order.transaction_status === "PAID"
                          ? "Sudah Dibayar"
                          : order.transaction_status === "PENDING"
                          ? "Menunggu Pembayaran"
                          : order.payment_method === "COD"
                          ? "Bayar saat diterima"
                          : "Gagal"}
                      </p>
                      {order.transaction_status === "PAID" && (
                        <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                          ✓ Dibayar
                        </span>
                      )}
                    </div>
                    {order.paid_at && (
                      <p className="text-gray-700 text-sm mt-1">
                        <span className="font-semibold">Dibayar pada:</span>{" "}
                        {formatDate(order.paid_at)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mb-4 pb-4 border-b border-gray-300">
                  <div className="flex justify-between text-gray-700 text-sm mb-1">
                    <span>Subtotal Produk:</span>
                    <span>
                      Rp {order.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-sm mb-1">
                    <span>Ongkos Kirim:</span>
                    <span>
                      Rp {order.shipping_cost.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-black font-bold text-base mt-2 pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span className="text-green-600">
                      Rp {order.gross_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {Array.isArray(order.items) && order.items.map((item: OrderItem, index: number) => (
                    <div
                      key={`${item.type || "item"}-${item.id_product}-${index}`}
                      className="bg-white border border-black rounded-lg p-3 flex flex-row gap-4"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                            <p className="text-gray-600 text-xs">No Image</p>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-black text-base font-bold mb-1 truncate">
                          {item.product_name}
                        </h3>
                        <p className="text-green-600 font-bold text-sm mb-1">
                          Rp {item.product_price.toLocaleString("id-ID")} x {item.quantity}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="bg-black text-white px-2 py-0.5 rounded text-xs font-semibold">
                            {item.Category || item.category || "N/A"}
                          </span>
                          <span className="text-gray-600 text-xs">
                            {item.type === "product" ? "Produk" : "Aksesoris"}
                          </span>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="flex flex-col items-end justify-center">
                        <p className="text-black font-bold text-base">
                          Rp {(item.product_price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cancel Button */}
                {order.transaction_status === "PENDING" && (
                  <div className="flex justify-end pt-4 border-t border-gray-300">
                    <button
                      onClick={() => handleCancelOrder(order)}
                      className="bg-red-500 text-white px-6 py-2 rounded font-semibold hover:bg-red-600 transition"
                    >
                      Batalkan Pesananku
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
