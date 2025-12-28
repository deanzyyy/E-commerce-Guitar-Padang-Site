"use client";

import { useEffect, useState } from "react";
import NavAdmin from "@/app/components/utilities/navAdmin";

interface Stats {
  monthlyRevenue: number;
  totalProducts: number;
  totalAksesoris: number;
  totalProductsSold: number;
  totalAksesorisSold: number;
  month: string;
}

interface User {
  username: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const statsRes = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!statsRes.ok) {
          throw new Error("Failed to fetch stats");
        }
        const statsData = await statsRes.json();
        
        // Ensure all numeric values are properly set with defaults
        setStats({
          monthlyRevenue: Number(statsData.monthlyRevenue) || 0,
          totalProducts: Number(statsData.totalProducts) || 0,
          totalAksesoris: Number(statsData.totalAksesoris) || 0,
          totalProductsSold: Number(statsData.totalProductsSold) || 0,
          totalAksesorisSold: Number(statsData.totalAksesorisSold) || 0,
          month: statsData.month || "",
        });

        // Fetch user info
        const userRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.user) {
            setUser(userData.user);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Set default values on error
        setStats({
          monthlyRevenue: 0,
          totalProducts: 0,
          totalAksesoris: 0,
          totalProductsSold: 0,
          totalAksesorisSold: 0,
          month: "",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-black text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      <NavAdmin />

      <div className="px-12 py-8">
        {/* Header */}
        <h1 className="text-black text-4xl font-bold mb-8">
          Selamat Datang, {user?.username || "Admin"}
        </h1>

        {/* Cards Grid */}
        <div className="space-y-6">
          {/* Baris 1: 30% - 70% */}
          <div className="flex gap-6">
            <div className="w-[30%] bg-white border border-black rounded-lg p-6">
              <h2 className="text-black text-lg font-semibold mb-2">Total Pendapatan</h2>
              <p className="text-green-600 font-bold text-2xl mb-1">
                Rp {(stats?.monthlyRevenue ?? 0).toLocaleString("id-ID")}
              </p>
              <p className="text-gray-600 text-sm">
                Bulan {stats?.month || ""}
              </p>
            </div>
            <div className="w-[70%] bg-white border border-black rounded-lg p-6">
              <h2 className="text-black text-lg font-semibold mb-2">Sisa Stock Produk</h2>
              <p className="text-black font-bold text-4xl">
                {stats?.totalProducts || 0}
              </p>
            </div>
          </div>

          {/* Baris 2: 70% - 30% */}
          <div className="flex gap-6">
            <div className="w-[70%] bg-white border border-black rounded-lg p-6">
              <h2 className="text-black text-lg font-semibold mb-2">Sisa Stock Aksesoris</h2>
              <p className="text-black font-bold text-4xl">
                {stats?.totalAksesoris || 0}
              </p>
            </div>
            <div className="w-[30%] bg-white border border-black rounded-lg p-6">
              <h2 className="text-black text-lg font-semibold mb-2">Total Produk Terjual</h2>
              <p className="text-black font-bold text-2xl">
                {stats?.totalProductsSold || 0}
              </p>
            </div>
          </div>

          {/* Baris 3: 30% - 70% */}
          <div className="flex gap-6">
            <div className="w-[30%] bg-white border border-black rounded-lg p-6">
              <h2 className="text-black text-lg font-semibold mb-2">Total Aksesoris Terjual</h2>
              <p className="text-black font-bold text-2xl">
                {stats?.totalAksesorisSold || 0}
              </p>
            </div>
            <div className="w-[70%] bg-white border border-black rounded-lg p-6">
              {/* Empty space untuk konsistensi layout */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

