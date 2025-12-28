"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NavAdmin from "@/app/components/utilities/navAdmin";

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

export default function EditAksesorisPage() {
  const router = useRouter();
  const { id } = useParams();

  const [aksesoris, setAksesoris] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [product_name, setName] = useState("");
  const [product_price, setPrice] = useState("");
  const [category, setCategory] = useState("STRINGS");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/aksesoris/${id}`);
        const data = await res.json();

        setAksesoris(data);
        setName(data.product_name);
        setPrice(data.product_price);
        setCategory(data.Category || data.category);
        setDescription(data.description || "");
      } catch (err) {
        console.error("Gagal mengambil data aksesoris", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleUpdate = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("product_name", product_name);
    formData.append("product_price", product_price);
    formData.append("category", category);
    formData.append("description", description);

    if (image) {
      formData.append("image", image);
    }

    const res = await fetch(`/api/aksesoris/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      alert("Gagal update aksesoris");
      return;
    }

    router.push("/admin/aksesoris");
  };

  if (loading) return <p className="text-black m-10">Loading...</p>;

  return (
    <div className="bg-white w-full min-h-screen">
      <NavAdmin />

      <h1 className="text-3xl text-black m-10">Edit Aksesoris</h1>

      <div className="border border-black mx-10">
        <form onSubmit={handleUpdate} style={{ display: "grid", gap: 10 }}>
          <div className="m-10 flex flex-row space-x-10">
            {/* SESSION 1 */}
            <div className="w-1/2">
              <label>
                <div className="text-black text-xl mb-4">Nama Aksesoris</div>
                <input
                  className="border border-black text-black w-full px-2 py-5 bg-white"
                  value={product_name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                <div className="text-black text-xl mb-4 mt-10">Harga IDR</div>
                <input
                  type="number"
                  className="border border-black text-black w-full px-2 py-5 bg-white"
                  value={product_price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </label>

              <label>
                <div className="text-black text-xl mb-4 mt-10">Kategori</div>
                <select
                  className="border border-black bg-black text-white w-full px-2 py-5"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Pilih kategori</option>
                  {AKESORIS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* SESSION 2 */}
            <div className="w-1/2">
              <label>
                <div className="text-black text-xl">Deskripsi</div>
                <textarea
                  className="border border-black text-black w-full h-40 my-5 bg-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <label>
                <div className="text-black">Upload Gambar Baru</div>
                <input
                  type="file"
                  className="border border-black text-black w-full bg-white"
                  onChange={(e) =>
                    setImage(e.target.files?.[0] || null)
                  }
                />
              </label>

              {aksesoris?.image && (
                <img
                  src={aksesoris.image}
                  className="w-32 mt-5 border border-black"
                />
              )}

              <div className="mt-10 flex justify-end">
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-3"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

