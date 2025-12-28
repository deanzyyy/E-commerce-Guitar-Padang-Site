"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const AKESORIS_CATEGORIES = [
  "STRINGS",
  "PICK",
  "CAPO",
  "TUNER",
  "CASE",
  "STRAP",
  "CABLE",
  "AMPLIFIER",
] as const;

export default function AksesorisListPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [aksesoris, setAksesoris] = useState<Aksesoris[]>([]);
  const [allAksesoris, setAllAksesoris] = useState<Aksesoris[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const isProductListActive = pathname === "/productlist";
  const isAksesorisListActive = pathname === "/aksesorislist";

  const handleAddToCart = (item: Aksesoris) => {
    addToCart({
      id_product: item.id_aksesoris,
      product_name: item.product_name,
      product_price: item.product_price,
      Category: item.Category || item.category || "",
      category: item.category,
      description: item.description,
      image: item.image,
      type: "aksesoris",
    });
    // Redirect ke keranjang setelah menambahkan
    router.push("/keranjang");
  };

  useEffect(() => {
    async function fetchAksesoris() {
      try {
        const res = await fetch("/api/aksesoris", { cache: "no-store" });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Pastikan data adalah array
        if (Array.isArray(data)) {
          setAllAksesoris(data);
          setAksesoris(data);
        } else {
          console.error("API returned non-array data:", data);
          setAllAksesoris([]);
          setAksesoris([]);
        }
      } catch (error) {
        console.error("Failed to fetch aksesoris:", error);
        // Set empty array sebagai fallback
        setAllAksesoris([]);
        setAksesoris([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAksesoris();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allAksesoris.filter(
        (item) =>
          (item.Category || item.category) === selectedCategory
      );
      setAksesoris(filtered);
    } else {
      setAksesoris(allAksesoris);
    }
  }, [selectedCategory, allAksesoris]);

  return (
    <div className="bg-white min-h-screen">
      <ProductNavbar />

      {/* Header */}
      <div className="px-12 py-8">
        <div className="flex justify-center items-center space-x-8">
          <Link
            href="/productlist"
            className={`text-black font-bold hover:text-gray-600 transition text-center ${
              isProductListActive ? "text-4xl" : "text-2xl opacity-50"
            }`}
          >
            Gitar Produk
          </Link>
          <Link
            href="/aksesorislist"
            className={`text-black font-bold hover:text-gray-600 transition text-center ${
              isAksesorisListActive ? "text-4xl" : "text-2xl opacity-50"
            }`}
          >
            Aksesoris Produk
          </Link>
        </div>
      </div>

      {/* Category Menu */}
      <div className="px-12 pb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 border border-black rounded transition font-semibold ${
              selectedCategory === null
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            Semua
          </button>
          {AKESORIS_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border border-black rounded transition font-semibold ${
                selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Aksesoris List */}
      <div className="px-12 pb-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-black text-xl">Loading...</p>
          </div>
        ) : aksesoris.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-black text-xl">Belum ada aksesoris tersedia</p>
          </div>
        ) : Array.isArray(aksesoris) && aksesoris.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aksesoris.map((item) => (
              <div
                key={item.id_aksesoris}
                className="bg-white border border-black rounded-lg overflow-hidden flex flex-row"
              >
                {/* Gambar di kiri */}
                <div className="w-40 h-auto flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[200px] bg-gray-200 flex items-center justify-center border-r border-black">
                      <p className="text-gray-600 text-xs">No Image</p>
                    </div>
                  )}
                </div>

                {/* Konten di kanan */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    {/* Judul */}
                    <h2 className="text-lg font-bold text-black mb-2">
                      {item.product_name}
                    </h2>

                    {/* Deskripsi */}
                    {item.description && (
                      <p className="text-black mb-3 text-sm line-clamp-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                        {item.description}
                      </p>
                    )}

                    {/* Harga dan Category */}
                    <div className="flex flex-col space-y-2 mb-3">
                      <p className="text-green-600 font-bold text-base">
                        Rp {item.product_price.toLocaleString("id-ID")}
                      </p>
                      <span className="bg-black text-white px-2 py-1 rounded text-xs font-semibold w-fit">
                        {item.Category || item.category}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col space-y-2">
                    <Link
                      href={`/aksesoris/${item.id_aksesoris}`}
                      className="border border-black text-black px-4 py-1.5 rounded hover:bg-black hover:text-white transition font-semibold text-center text-sm"
                    >
                      Lihat Detail
                    </Link>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-black text-white px-4 py-1.5 rounded hover:bg-gray-800 transition font-semibold text-sm"
                    >
                      Beli
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <p className="text-black text-xl">Belum ada aksesoris tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
}

