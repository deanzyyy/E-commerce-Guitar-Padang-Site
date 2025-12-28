"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductNavbar from "@/app/components/utilities/ProductNavbar";
import { getCart, removeFromCart, updateCartQuantity, clearCart, CartItem } from "@/app/lib/cart";

export default function KeranjangPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load cart function
  const loadCart = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      const cart = getCart();
      setCartItems(cart);
      setLoading(false);
    } catch (error) {
      console.error("Error loading cart:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set mounted flag to ensure client-side only
    setMounted(true);
    loadCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("cartUpdated", handleCartUpdate);
      return () => {
        window.removeEventListener("cartUpdated", handleCartUpdate);
      };
    }
  }, [loadCart]);

  const handleRemove = useCallback((id_product: number, type: "product" | "aksesoris") => {
    if (typeof window === "undefined") return;
    removeFromCart(id_product, type);
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = useCallback((id_product: number, type: "product" | "aksesoris", newQuantity: number) => {
    if (typeof window === "undefined") return;
    updateCartQuantity(id_product, type, newQuantity);
    loadCart();
  }, [loadCart]);

  const handleClearCart = useCallback(() => {
    if (typeof window === "undefined") return;
    clearCart();
    setCartItems([]);
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      alert("Keranjang kosong, tidak bisa checkout");
      return;
    }
    router.push("/checkout");
  }, [cartItems.length, router]);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product_price * item.quantity,
    0
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-black text-xl">Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-black text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ProductNavbar />

      <div className="px-12 py-8">
        <h1 className="text-black text-4xl font-bold mb-8">Keranjang</h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-black text-xl mb-4">Keranjang Anda Kosong</p>
            <Link
              href="/productlist"
              className="text-black border border-black px-6 py-2 rounded hover:bg-black hover:text-white transition"
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {cartItems.map((item) => (
                <div
                  key={`${item.type}-${item.id_product}`}
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
                    <h2 className="text-black text-base font-bold mb-1 truncate">
                      {item.product_name}
                    </h2>
                    <p className="text-green-600 font-bold text-sm mb-1">
                      Rp {item.product_price.toLocaleString("id-ID")}
                    </p>
                    <span className="bg-black text-white px-2 py-0.5 rounded text-xs font-semibold">
                      {item.Category || item.category}
                    </span>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemove(item.id_product, item.type)}
                      className="text-red-600 hover:text-red-700 transition text-xs mb-2"
                    >
                      Hapus
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id_product,
                            item.type,
                            item.quantity - 1
                          )
                        }
                        className="border border-black text-black w-7 h-7 rounded hover:bg-black hover:text-white transition flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="text-black text-sm font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id_product,
                            item.type,
                            item.quantity + 1
                          )
                        }
                        className="border border-black text-black w-7 h-7 rounded hover:bg-black hover:text-white transition flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-black font-bold text-sm mt-2">
                      Rp {(item.product_price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Checkout */}
            <div className="border-t border-black pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-black text-2xl font-bold">Total</h2>
                <p className="text-green-600 font-bold text-3xl">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleClearCart}
                  className="border-2 border-black text-black px-6 py-3 rounded hover:bg-black hover:text-white transition font-semibold"
                >
                  Hapus Semua
                </button>
                <button
                  onClick={handleCheckout}
                  className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition font-semibold flex-1"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

