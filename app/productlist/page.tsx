"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProductNavbar from "@/app/components/utilities/ProductNavbar";
import { addToCart } from "@/app/lib/cart";

interface Product {
  id_product: number;
  product_name: string;
  product_price: number;
  Category: string;
  category?: string;
  description: string | null;
  image: string | null;
}

const CATEGORIES = [
  "ACOUSTIC",
  "ELECTRIC",
  "BASS",
  "CLASSIC",
  "UKULELE",
  "ACOUSTIC_ELECTRIC",
] as const;

export default function ProductListPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const isProductListActive = pathname === "/productlist";
  const isAksesorisListActive = pathname === "/aksesorislist";

  const handleAddToCart = (product: Product) => {
    addToCart({
      id_product: product.id_product,
      product_name: product.product_name,
      product_price: product.product_price,
      Category: product.Category || product.category || "",
      category: product.category,
      description: product.description,
      image: product.image,
      type: "product",
    });
    // Redirect ke keranjang setelah menambahkan
    router.push("/keranjang");
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        setAllProducts(data);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allProducts.filter(
        (product) =>
          (product.Category || product.category) === selectedCategory
      );
      setProducts(filtered);
    } else {
      setProducts(allProducts);
    }
  }, [selectedCategory, allProducts]);

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
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border border-black rounded transition font-semibold ${
                selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {category.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="px-12 pb-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-black text-xl">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-black text-xl">Belum ada produk tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id_product}
                className="bg-white border border-black rounded-lg overflow-hidden flex flex-row"
              >
                {/* Gambar di kiri */}
                <div className="w-40 h-auto flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.product_name}
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
                      {product.product_name}
                    </h2>

                    {/* Deskripsi */}
                    {product.description && (
                      <p className="text-black mb-3 text-sm line-clamp-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                        {product.description}
                      </p>
                    )}

                    {/* Harga dan Category */}
                    <div className="flex flex-col space-y-2 mb-3">
                      <p className="text-green-600 font-bold text-base">
                        Rp {product.product_price.toLocaleString("id-ID")}
                      </p>
                      <span className="bg-black text-white px-2 py-1 rounded text-xs font-semibold w-fit">
                        {product.Category || product.category}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col space-y-2">
                    <Link
                      href={`/product/${product.id_product}`}
                      className="border border-black text-black px-4 py-1.5 rounded hover:bg-black hover:text-white transition font-semibold text-center text-sm"
                    >
                      Lihat Detail
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-black text-white px-4 py-1.5 rounded hover:bg-gray-800 transition font-semibold text-sm"
                    >
                      Beli
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

