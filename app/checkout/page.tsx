"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductNavbar from "@/app/components/utilities/ProductNavbar";
import { getCart, CartItem, clearCart } from "@/app/lib/cart";
import NotificationModal from "@/app/components/utilities/NotificationModal";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "TRANSFER" | "COD" | "DANA" | "GOPAY">("COD");
  const [shippingCost, setShippingCost] = useState(15000); // Default shipping cost

  useEffect(() => {
    const loadCart = () => {
      const cart = getCart();
      if (cart.length === 0) {
        router.push("/keranjang");
        return;
      }
      setCartItems(cart);
      setLoading(false);
    };

    loadCart();
  }, [router]);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product_price * item.quantity,
    0
  );
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProcessing(true);

    // Validation
    if (!recipientName.trim()) {
      setError("Nama penerima harus diisi");
      setProcessing(false);
      return;
    }
    if (!recipientPhone.trim()) {
      setError("Nomor telepon harus diisi");
      setProcessing(false);
      return;
    }
    if (!shippingAddress.trim()) {
      setError("Alamat tujuan harus diisi");
      setProcessing(false);
      return;
    }

    try {
      if (paymentMethod === "QRIS" || paymentMethod === "TRANSFER" || paymentMethod === "DANA" || paymentMethod === "GOPAY") {
        // Process payment via Midtrans
        const response = await fetch("/api/payment/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cartItems,
            subtotal,
            shippingCost,
            total,
            recipientName,
            recipientPhone,
            shippingAddress,
            paymentMethod,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Gagal membuat pembayaran");
          setProcessing(false);
          return;
        }

        // Order sudah disimpan ke database di API route
        // Clear cart
        clearCart();

        // Redirect to payment page
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          setShowSuccess(true);
          setTimeout(() => {
            router.push("/pesanan");
          }, 2000);
        }
      } else {
        // COD - Create order via API
        const codResponse = await fetch("/api/payment/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cartItems,
            subtotal,
            shippingCost,
            total,
            recipientName,
            recipientPhone,
            shippingAddress,
            paymentMethod: "COD",
          }),
        });

        const codData = await codResponse.json();

        if (!codResponse.ok) {
          setError(codData.error || "Gagal membuat pesanan");
          setProcessing(false);
          return;
        }

        // Clear cart
        clearCart();

        setShowSuccess(true);
        setTimeout(() => {
          router.push("/pesanan");
        }, 2000);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memproses pesanan");
      setProcessing(false);
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
        message="Pesanan berhasil dibuat!"
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <ProductNavbar />

      <div className="px-12 py-8 max-w-6xl mx-auto">
        <h1 className="text-black text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white border border-black rounded-lg p-6">
                <h2 className="text-black text-2xl font-bold mb-4">
                  Informasi Pengiriman
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="recipientName"
                      className="block text-black font-semibold mb-2"
                    >
                      Nama Penerima *
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                      className="w-full border border-black text-black px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Masukkan nama penerima"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="recipientPhone"
                      className="block text-black font-semibold mb-2"
                    >
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      id="recipientPhone"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      required
                      className="w-full border border-black text-black px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="shippingAddress"
                      className="block text-black font-semibold mb-2"
                    >
                      Alamat Tujuan *
                    </label>
                    <textarea
                      id="shippingAddress"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      rows={4}
                      className="w-full border border-black text-black px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-black resize-none"
                      placeholder="Masukkan alamat lengkap tujuan pengiriman"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-black rounded-lg p-6">
                <h2 className="text-black text-2xl font-bold mb-4">
                  Metode Pembayaran
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-black rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "COD")
                      }
                      className="mr-3 w-5 h-5 text-black focus:ring-black"
                    />
                    <div className="flex-1">
                      <span className="text-black font-semibold text-lg">
                        COD (Cash on Delivery)
                      </span>
                      <p className="text-gray-600 text-sm">
                        Bayar saat barang diterima
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-black rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="QRIS"
                      checked={paymentMethod === "QRIS"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "QRIS")
                      }
                      className="mr-3 w-5 h-5 text-black focus:ring-black"
                    />
                    <div className="flex-1">
                      <span className="text-black font-semibold text-lg">
                        QRIS
                      </span>
                      <p className="text-gray-600 text-sm">
                        Bayar dengan scan QR code
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-black rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="TRANSFER"
                      checked={paymentMethod === "TRANSFER"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "TRANSFER")
                      }
                      className="mr-3 w-5 h-5 text-black focus:ring-black"
                    />
                    <div className="flex-1">
                      <span className="text-black font-semibold text-lg">
                        Transfer Bank
                      </span>
                      <p className="text-gray-600 text-sm">
                        Transfer melalui bank
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-black rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="DANA"
                      checked={paymentMethod === "DANA"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "DANA")
                      }
                      className="mr-3 w-5 h-5 text-black focus:ring-black"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src="https://logos-world.net/wp-content/uploads/2021/02/Dana-Logo.png"
                        alt="DANA"
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          // Fallback jika gambar tidak bisa dimuat
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <div className="flex-1">
                        <span className="text-black font-semibold text-lg">
                          DANA
                        </span>
                        <p className="text-gray-600 text-sm">
                          Bayar dengan DANA
                        </p>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-black rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="GOPAY"
                      checked={paymentMethod === "GOPAY"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "GOPAY")
                      }
                      className="mr-3 w-5 h-5 text-black focus:ring-black"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src="https://logos-world.net/wp-content/uploads/2021/02/GoPay-Logo.png"
                        alt="GoPay"
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          // Fallback jika gambar tidak bisa dimuat
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <div className="flex-1">
                        <span className="text-black font-semibold text-lg">
                          GoPay
                        </span>
                        <p className="text-gray-600 text-sm">
                          Bayar dengan GoPay
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-500 text-white px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Link
                  href="/keranjang"
                  className="border-2 border-black text-black px-6 py-3 rounded hover:bg-black hover:text-white transition font-semibold"
                >
                  Kembali ke Keranjang
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition font-semibold flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Memproses..." : "Buat Pesanan"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-black rounded-lg p-6 sticky top-8">
              <h2 className="text-black text-2xl font-bold mb-4">
                Ringkasan Pesanan
              </h2>

              {/* Product List */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id_product}`}
                    className="flex gap-3 pb-3 border-b border-gray-300"
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
                    <div className="flex-1 min-w-0">
                      <h3 className="text-black font-semibold text-sm truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-gray-600 text-xs">
                        {item.quantity} x Rp{" "}
                        {item.product_price.toLocaleString("id-ID")}
                      </p>
                      <p className="text-black font-bold text-sm mt-1">
                        Rp{" "}
                        {(item.product_price * item.quantity).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-black">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span>Ongkos Kirim</span>
                  <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-black pt-3 flex justify-between">
                  <span className="text-black font-bold text-lg">Total</span>
                  <span className="text-green-600 font-bold text-xl">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

