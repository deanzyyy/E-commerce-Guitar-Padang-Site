"use client";

import { useState } from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import NavAdmin from "@/app/components/utilities/navAdmin";

const CATEGORIES = [
  "ACOUSTIC",
  "ELECTRIC",
  "BASS",
  "CLASSIC",
  "UKULELE",
  "ACOUSTIC_ELECTRIC",
] as const;

type Category = typeof CATEGORIES[number];

export default function AddProductPage() {

  const router = useRouter();

  const [form, setForm] = useState<{
    product_name: string;
    product_price: string;
    category: string;
    description: Category | "";
    image: File | null;
  }>({
    product_name: "",
    product_price: "",
    category: "" as Category | "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.product_name.trim()) return "Nama produk wajib diisi.";
    if (!form.product_price.trim()) return "Harga wajib diisi.";
    const priceNum = Number(form.product_price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return "Harga harus angka positif.";
    if (!form.category) return "Pilih kategori.";
    if (!CATEGORIES.includes(form.category as Category)) return "Kategori tidak valid.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
  
    const error = validate();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
  
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("product_name", form.product_name);
      formData.append("product_price", form.product_price);
      formData.append("category", form.category);
      formData.append("description", form.description);
  
      if (form.image) {
        formData.append("image", form.image);
      }
  
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setMessage({ type: "success", text: "Produk berhasil ditambahkan." });
        setForm({ product_name: "", product_price: "", category: "", description: "", image: null });
        router.push("/admin/products");
      } else {
        setMessage({ type: "error", text: data.error || "Gagal menambah produk" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Error jaringan" });
    } finally {
      setLoading(false);
    }
  };
  

  return (

    <div className=" w-full h-auto">
      <h1 className="text-3xl text-black m-10">Tambah Produk</h1>

      {message && (
        <div className="text-white bg-green-500 py-2 px-5 m-10 w-92 ">
          {message.text}
        </div>
      )}

        <div className="border-1 border-black mx-10 ">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <div className="m-10 flex flex-row grid-2 space-x-10">

{/* sesi 1 */}
            <div className="w-1/2">

        <label className="pb-25">
          <div className="text-black text-xl mb-4">Nama Produk</div>
          <input name="product_name" value={form.product_name} onChange={handleChange} className="border-1 border-black text-black h-auto  w-full px-2 py-5"/>
        </label>

        <label>
          <div className="text-black mb-4 text-xl mt-10">Harga IDR</div>
          <input name="product_price" type="number" value={form.product_price} onChange={handleChange} placeholder="Rp." className="border-1 border-black w-full text-black h-auto px-2 py-5"/>
        </label>

        <label>
          <div className="text-black mb-4 text-xl mt-10">Kategori</div>
          <select name="category" value={form.category} onChange={handleChange} className="border-1 text-black bg-white border-black w-full px-2 w-full py-5">
            <option value="" >Pilih kategori </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        </div>



        {/* sesi 2 */}

        <div className="w-1/2">

        <label>
          <div className="text-black text-xl">Deskripsi</div>
          <textarea name="description" value={form.description} onChange={handleChange} className="border-1 text-black w-full h-40 my-5   border-black"/>
        </label>

        <label>
          <div className="text-black">Upload Gambar</div>
          <input type="file"
    accept="image/*"
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        image: (e.target as HTMLInputElement).files?.[0] || null
      }))
    } className="border-1 text-black w-full border-black"/>
        </label>

        <div className="mt-10 flex justify-end">
          <button type="submit" disabled={loading} className="bg-black text-white px-3 py-3">
            {loading ? "Menyimpan..." : "Tambah Produk"}


          </button>
        </div>
        </div>
        </div>
      </form>
      </div>
      <NavAdmin />
    </div>
  );
}
