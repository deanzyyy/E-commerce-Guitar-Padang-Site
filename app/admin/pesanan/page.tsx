"use client";

import { useEffect, useState } from "react";
import NavAdmin from "@/app/components/utilities/navAdmin";
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

export default function AdminPesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/orders?admin=true");
        if (response.ok) {
          const data = await response.json();
          // Filter hanya pesanan yang sudah dibayar atau COD atau pending
          const paidOrders = (data.orders || []).filter(
            (order: Order) => {
              // Tampilkan jika sudah dibayar
              if (order.transaction_status === "PAID") return true;
              // Tampilkan jika COD
              if (order.payment_method === "COD") return true;
              // Tampilkan jika pending (sudah dibuat transaksi)
              if (order.transaction_status === "PENDING") return true;
              return false;
            }
          );
          setOrders(paidOrders);
        } else {
          console.error("Failed to load orders");
        }
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        return "Menunggu";
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

  const handleStatusUpdate = async (orderId: string, newStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED", message: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        setSuccessMessage(message);
        setShowSuccess(true);
        // Refresh orders
        const refreshResponse = await fetch("/api/orders?admin=true");
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const paidOrders = (data.orders || []).filter(
            (order: Order) => {
              if (order.transaction_status === "PAID") return true;
              if (order.payment_method === "COD") return true;
              if (order.transaction_status === "PENDING") return true;
              return false;
            }
          );
          setOrders(paidOrders);
        }
        
        // Update selected order if it's the one being updated
        if (selectedOrder && selectedOrder.order_id === orderId) {
          const updatedOrder = orders.find((o) => o.order_id === orderId);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      } else {
        const data = await response.json();
        setSuccessMessage(data.error || "Gagal mengupdate status");
        setShowSuccess(true);
      }
    } catch (error) {
      setSuccessMessage("Terjadi kesalahan saat mengupdate status");
      setShowSuccess(true);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-black text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      <NotificationModal
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <NavAdmin />

      <div className="px-12 py-8">
        <h1 className="text-black text-4xl font-bold mb-8">Pesanan Pelanggan</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-black text-xl mb-4">Belum ada pesanan yang sudah dibayar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-black rounded-lg p-4 flex items-center justify-between hover:shadow-lg transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-black text-lg font-bold">
                      {order.recipient_name}
                    </h2>
                    <span
                      className={`${getStatusColor(
                        order.transaction_status
                      )} text-white px-3 py-1 rounded text-xs font-semibold`}
                    >
                      {getStatusText(order.transaction_status)}
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>
                      <span className="font-semibold">ID Pesanan:</span> {order.order_id}
                    </p>
                    <p>
                      <span className="font-semibold">Tanggal:</span> {formatDate(order.createdAt)}
                    </p>
                    <p>
                      <span className="font-semibold">Total:</span>{" "}
                      <span className="text-green-600 font-bold">
                        Rp {order.gross_amount.toLocaleString("id-ID")}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Metode Pembayaran:</span>{" "}
                      {order.payment_method === "QRIS"
                        ? "QRIS"
                        : order.payment_method === "TRANSFER"
                        ? "Transfer Bank"
                        : order.payment_method === "DANA"
                        ? "DANA"
                        : order.payment_method === "GOPAY"
                        ? "GoPay"
                        : "COD"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetail(order)}
                  className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition font-semibold ml-4"
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-black text-2xl font-bold">Detail Pesanan</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-black transition text-2xl"
              >
                ×
              </button>
            </div>

            {/* Order Info */}
            <div className="space-y-6">
              {/* Order Header */}
              <div className="border-b border-black pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">ID Pesanan</p>
                    <p className="text-black font-bold text-lg">{selectedOrder.order_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm mb-1">Status</p>
                    <span
                      className={`${getStatusColor(
                        selectedOrder.transaction_status
                      )} text-white px-3 py-1 rounded text-sm font-semibold inline-block`}
                    >
                      {getStatusText(selectedOrder.transaction_status)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              {/* Shipping Info */}
              <div className="border-b border-gray-300 pb-4">
                <h3 className="text-black font-bold text-lg mb-3">
                  Informasi Pengiriman
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Nama Penerima</p>
                    <p className="text-black font-semibold">
                      {selectedOrder.recipient_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Nomor Telepon</p>
                    <p className="text-black font-semibold">
                      {selectedOrder.recipient_phone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-sm mb-1">Alamat Tujuan</p>
                    <p className="text-black font-semibold">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-b border-gray-300 pb-4">
                <h3 className="text-black font-bold text-lg mb-3">
                  Informasi Pembayaran
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Metode Pembayaran</p>
                    <p className="text-black font-semibold">
                      {selectedOrder.payment_method === "QRIS"
                        ? "QRIS"
                        : selectedOrder.payment_method === "TRANSFER"
                        ? "Transfer Bank"
                        : selectedOrder.payment_method === "DANA"
                        ? "DANA"
                        : selectedOrder.payment_method === "GOPAY"
                        ? "GoPay"
                        : "COD (Cash on Delivery)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Status Pembayaran</p>
                    <p className="text-black font-semibold">
                      {selectedOrder.transaction_status === "PAID"
                        ? "Sudah Dibayar"
                        : selectedOrder.transaction_status === "PENDING"
                        ? "Menunggu Pembayaran"
                        : selectedOrder.payment_method === "COD"
                        ? "Bayar saat diterima"
                        : "Gagal"}
                    </p>
                  </div>
                  {selectedOrder.paid_at && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600 text-sm mb-1">Dibayar pada</p>
                      <p className="text-black font-semibold">
                        {formatDate(selectedOrder.paid_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="border-b border-gray-300 pb-4">
                <h3 className="text-black font-bold text-lg mb-3">Daftar Produk</h3>
                <div className="space-y-3">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: OrderItem, index: number) => (
                    <div
                      key={`${item.type || "item"}-${item.id_product}-${index}`}
                      className="bg-gray-50 border border-gray-300 rounded-lg p-3 flex gap-4"
                    >
                      <div className="w-16 h-16 flex-shrink-0">
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
                      <div className="flex-1">
                        <h4 className="text-black font-semibold mb-1">
                          {item.product_name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-1">
                          {item.quantity} x Rp{" "}
                          {item.product_price.toLocaleString("id-ID")}
                        </p>
                        <span className="bg-black text-white px-2 py-0.5 rounded text-xs">
                          {item.Category || item.category || "N/A"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-black font-bold">
                          Rp{" "}
                          {(item.product_price * item.quantity).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="border-b border-gray-300 pb-4">
                <h3 className="text-black font-bold text-lg mb-3">Rincian Biaya</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal Produk:</span>
                    <span>
                      Rp {selectedOrder.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Ongkos Kirim:</span>
                    <span>
                      Rp {selectedOrder.shipping_cost.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-black font-bold text-lg pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span className="text-green-600">
                      Rp {selectedOrder.gross_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Actions - Only show for PENDING orders */}
              {selectedOrder.transaction_status === "PENDING" && (
                <div>
                  <h3 className="text-black font-bold text-lg mb-3">Aksi Admin</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => {
                        handleStatusUpdate(
                          selectedOrder.order_id,
                          "PAID",
                          "Status pesanan berhasil diubah menjadi 'Sudah Dibayar'"
                        );
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition font-semibold"
                    >
                      Tandai Dibayar
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(
                          selectedOrder.order_id,
                          "FAILED",
                          "Status pesanan berhasil diubah menjadi 'Gagal'"
                        );
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold"
                    >
                      Tandai Gagal
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(
                          selectedOrder.order_id,
                          "EXPIRED",
                          "Status pesanan berhasil diubah menjadi 'Kedaluwarsa'"
                        );
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition font-semibold"
                    >
                      Tandai Kedaluwarsa
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
