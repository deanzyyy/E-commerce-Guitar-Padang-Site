"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NotificationModal from "@/app/components/utilities/NotificationModal";

export default function Daftar() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          repeatPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrasi gagal");
        setLoading(false);
        return;
      }

      // Tampilkan notifikasi sukses
      setShowSuccess(true);
      setLoading(false);

      // Redirect ke login setelah delay singkat
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("Terjadi kesalahan saat registrasi");
      setLoading(false);
    }
  };

  return (
    <>
      <NotificationModal
        message="yeay, akun mu udah dibuat, ayo login"
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      {/* Utama */}
      <div className="bg-white flex flex-rows w-full h-screen">
        {/* kanan */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="m-20">
            <p className="text-black rata-kiri pb-2">Guitar Padang</p>
            <h1 className="text-black text-8xl rata-kiri">
              Buat akunmu dulu yuk
            </h1>
            <p className="text-black rata-kiri pt-2">
              Udah punya Akun?{" "}
              <span>
                <Link href="/login" className="underline">
                  tinggal masuk
                </Link>
              </span>
            </p>
          </div>
        </div>

        {/* kiri */}
        <div className="w-1/2 flex justify-center items-center">
          {/* card */}
          <div className="flex justify-center flex-col border border-black m-20 items-center">
            <div className="text-center">
              <h1 className="text-black text-4xl pt-16 pb-5">Daftar</h1>
              <p className="text-black text-sm">
                Kalo belum punya akun, kita bikin satu dulu ya
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-14 space-y-8 w-full">
              {error && (
                <div className="bg-red-500 text-white px-4 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="border border-black text-black placeholder-gray-600 px-6 py-3 w-full bg-transparent"
              />
              <input
                type="email"
                id="email"
                placeholder="Example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-black text-black placeholder-gray-600 px-6 py-3 w-full bg-transparent"
              />
              <input
                type="password"
                id="password"
                placeholder="Password (minimal 8 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="border border-black text-black placeholder-gray-600 px-6 py-3 w-full bg-transparent"
              />
              <input
                type="password"
                id="repeatPassword"
                placeholder="Konfirmasi Password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                minLength={8}
                className="border border-black text-black placeholder-gray-600 px-6 py-3 w-full bg-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-white bg-black px-6 py-3 w-full cursor-pointer hover:bg-white hover:border hover:border-black hover:text-black animate duration-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mendaftar..." : "Daftar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}