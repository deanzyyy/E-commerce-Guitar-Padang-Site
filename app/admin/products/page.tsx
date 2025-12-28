"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavAdmin from "@/app/components/utilities/navAdmin";

export default function ProductListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

    const router = useRouter();


  // STATE UNTUK MODAL DELETE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Fetch semua produk
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // DELETE HANDLE (Tanpa confirm bawaan browser)
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("gagal menghapus produk");
      }

      setProducts((prev) => prev.filter((p) => p.id_product !== id));
    } catch (err) {
      console.error(err);
      alert("terjadi kesalahan saat menghapus produk");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <NavAdmin />
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Produk</h1>

        <Link
          href="/admin/products/add"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Tambah Produk
        </Link>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-600">Loading...</p>}

      {/* List Produk */}
      <div className="">
        {products.length === 0 && !loading && (
          <p className="text-gray-600">Belum ada produk.</p>
        )}

        <div className="w-full mt-5 space-y-2">
          {products.map((item) => (
            <div
              key={item.id_product}
              className="bg-white p-6 items-center flex flex-row justify-between space-x-10 border border-black"
            >
              <div className="flex space-x-10">
                {/* Gambar produk */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.product_name}
                    className="w-20 h-auto object-cover"
                  />
                )}

                <div>
                  {/* Nama */}
                  <h2 className="text-xl font-semibold mt-3 text-black">
                    {item.product_name}
                  </h2>

                  {/* Harga */}
                  <p className="text-green-600 font-bold mt-1">
                    Rp {item.product_price.toLocaleString("id-ID")}
                  </p>

                  {/* Kategori */}
                  <p className="text-sm bg-black text-white w-20 text-center mt-1">
                    {item.Category || item.category}
                  </p>

                  {/* Deskripsi */}
                  {item.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Tombol aksi */}
              <div className="flex gap-3 mt-4">
                <button onClick={() => router.push(`/admin/products/edit/${item.id_product}`)} className="flex-1 py-2 border border-black text-black px-6 hover:bg-black hover:text-white transition duration-300 cursor-pointer">
                  Perbaiki
                </button>

                <button
                  onClick={() => {
                    setSelectedId(item.id_product);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 py-2 text-white px-6 bg-black hover:bg-gray-800 transition duration-300 cursor-pointer"
                >
                  Buang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold text-center mb-4 text-black">
              Hapus Produk?
            </h2>

            <p className="text-center text-gray-700 mb-6">
              kamu yakin nih pengen hapus produknya? ini gabisa di batalin lagi yah.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition duration-200"
              >
                gajadi
              </button>

              <button
                onClick={() => {
                  if (selectedId) handleDelete(selectedId);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 border border-black transition duration-200"
              >
                yakin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
