"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartCount } from "@/app/lib/cart";
import Image from "next/image";


export default function ProductNavbar() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Set initial cart count
    setCartCount(getCartCount());

    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  return (
    <div className="w-full h-auto px-12 flex justify-between items-center bg-white border-b border-black">
      {/* logo kiri */}
      <div className="flex flex-row items-center">
      <Image
      src="/img/LOGO.png"
      alt="Hero Image"
      width={100}
      height={50}
    />
        <h1 className="text-black font-bold text-2xl">Guitar Padang</h1>
      </div>

      {/* tengah */}
      <div className="space-x-6">
       
      </div>

      {/* kanan - logout */}
      <div className="space-x-5 items-center">
      <Link href="/pesanan" className="text-black font-semibold text-xl hover:text-gray-600 transition">
          Pesanan
        </Link>
        <Link href="/keranjang" className="text-black font-semibold text-xl hover:text-gray-600 transition relative">
          Keranjang
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link> 

        <button
          onClick={handleLogout}
          className="text-black hover:text-gray-600 transition"
          title="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

