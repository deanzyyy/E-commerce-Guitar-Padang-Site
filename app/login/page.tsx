"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NotificationModal from "@/app/components/utilities/NotificationModal";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      // Tampilkan notifikasi sukses
      setShowSuccess(true);
      setLoading(false);

      // Redirect setelah delay singkat
      setTimeout(() => {
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/productlist");
        }
      }, 1500);
    } catch (err) {
      setError("Terjadi kesalahan saat login");
      setLoading(false);
    }
  };

  return (
    <>
      <NotificationModal
        message="login mu berhasil"
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      {/* Utama */}
      <div className="bg-white flex flex-rows w-full h-screen">
        {/* kiri */}
        <div className="w-1/2 flex justify-center items-center">
          {/* card */}
          <div className="flex justify-center flex-col border border-black m-20 items-center">
            <div className="text-center">
              <h1 className="text-black text-4xl pt-16 pb-5">Masuk</h1>
              <p className="text-black text-sm">
                Masuk dengan akun yang udah kamu bikin sebelumnya yaa
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-14 space-y-8 w-full">
              {error && (
                <div className="bg-red-500 text-white px-4 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              <input
                type="email"
                id="email"
                placeholder="Masukan Email Kamu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-black text-black placeholder-gray-600 px-6 py-3 w-full bg-transparent"
              />
              <input
                type="password"
                id="password"
                placeholder="Masukan Password Kamu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-black text-black placeholder-gray-600 px-6 py-3 w-full bg-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-white bg-black px-6 py-3 w-full cursor-pointer hover:bg-white hover:border hover:border-black hover:text-black animate duration-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Masuk..." : "Masuk"}
              </button>
            </form>
          </div>
        </div>

        {/* kanan */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="m-20">
            <div className="flex flex-col">
            <p className="text-black rata-kanan pb-2">Guitar Padang</p>
            </div>
            <h1 className="text-black text-8xl rata-kanan">
              AYO MASUK KE AKUNMU
            </h1>
            <p className="text-black rata-kanan pt-2">
              Gapunya Akun?{" "}
              <span>
                <Link href="/daftar" className="underline">
                  Bikin satu
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}