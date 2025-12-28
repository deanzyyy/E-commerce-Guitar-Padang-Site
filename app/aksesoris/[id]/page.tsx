"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ProductNavbar from "@/app/components/utilities/ProductNavbar";
import { addToCart } from "@/app/lib/cart";

interface Aksesoris {
  id_aksesoris: number;
  product_name: string;
  product_price: number;
  Category: string;
  category?: string;
  description: string | null;
  image: string | null;
}

export default function AksesorisDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [aksesoris, setAksesoris] = useState<Aksesoris | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchAksesoris() {
      try {
        const res = await fetch(`/api/aksesoris/${id}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Aksesoris not found");
        }
        const data = await res.json();
        setAksesoris(data);
      } catch (error) {
        console.error("Failed to fetch aksesoris:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAksesoris();
    }
  }, [id]);

  // Untuk sekarang, kita hanya punya 1 gambar
  // Tapi struktur ini bisa di-extend untuk multiple images
  const images = aksesoris?.image ? [aksesoris.image] : [];
  const hasMultipleImages = images.length > 1;
  const canGoPrevious = hasMultipleImages && currentImageIndex > 0;
  const canGoNext = hasMultipleImages && currentImageIndex < images.length - 1;

  const handlePreviousImage = () => {
    if (canGoPrevious) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (canGoNext) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleAddToCart = () => {
    if (aksesoris) {
      addToCart({
        id_product: aksesoris.id_aksesoris,
        product_name: aksesoris.product_name,
        product_price: aksesoris.product_price,
        Category: aksesoris.Category || aksesoris.category || "",
        category: aksesoris.category,
        description: aksesoris.description,
        image: aksesoris.image,
        type: "aksesoris",
      });
      // Redirect ke keranjang setelah menambahkan
      router.push("/keranjang");
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-black text-xl">Loading...</p>
      </div>
    );
  }

  if (!aksesoris) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-black text-xl mb-4">Aksesoris tidak ditemukan</p>
          <Link
            href="/aksesorislist"
            className="text-black border border-black px-4 py-2 rounded hover:bg-black hover:text-black transition"
          >
            Kembali ke Aksesoris List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen overflow-hidden flex flex-col">
      <ProductNavbar />
      
      {/* Back Button */}
      <div className="px-12 py-4 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="text-black hover:text-gray-600 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-12 pb-6 flex-1 overflow-hidden">
        <div className="flex flex-row gap-8 h-full">
          {/* Left Column - Image */}
          <div className="w-1/2 relative h-full">
            <div className="h-full flex items-center justify-center bg-white border border-black rounded-lg overflow-hidden relative">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={aksesoris.product_name}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Left Arrow */}
                  {hasMultipleImages && (
                    <button
                      onClick={handlePreviousImage}
                      disabled={!canGoPrevious}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition ${
                        canGoPrevious
                          ? "bg-black/80 text-white hover:bg-black"
                          : "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                      }`}
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Right Arrow */}
                  {hasMultipleImages && (
                    <button
                      onClick={handleNextImage}
                      disabled={!canGoNext}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition ${
                        canGoNext
                          ? "bg-black/80 text-white hover:bg-black"
                          : "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                      }`}
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <p className="text-gray-600">No Image</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="w-1/2 flex flex-col justify-center border border-black rounded-lg p-8">
            {/* Judul */}
            <h1 className="text-4xl font-bold text-black mb-6">
              {aksesoris.product_name}
            </h1>

            {/* Deskripsi */}
            {aksesoris.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-black mb-3">Deskripsi</h2>
                <p
                  className="text-black text-lg"
                  style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {aksesoris.description}
                </p>
              </div>
            )}

            {/* Harga */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-black mb-2">Harga</h2>
              <p className="text-green-600 font-bold text-3xl">
                Rp {aksesoris.product_price.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Category */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-2">Kategori</h2>
              <span className="bg-black text-white px-4 py-2 rounded text-base font-semibold inline-block">
                {aksesoris.Category || aksesoris.category}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleAddToCart}
                className="bg-black text-white px-8 py-4 rounded hover:bg-gray-200 transition font-semibold text-lg"
              >
                Beli
              </button>
              <button
                onClick={handleAddToCart}
                className="border-2 border-black text-black px-8 py-4 rounded hover:bg-black hover:text-black transition font-semibold text-lg"
              >
                Masukkan Keranjang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

