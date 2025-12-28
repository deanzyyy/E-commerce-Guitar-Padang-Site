"use client";

import { useEffect, useState } from "react";
import NavAdmin from "@/app/components/utilities/navAdmin";
import { getOrders, Order } from "@/app/lib/orders";
import * as XLSX from "xlsx";

/* =======================
   TYPES
======================= */

interface ProductSale {
  id_product: number;
  product_name: string;
  quantity: number;
  total_price: number;
  category: string;
}

interface AksesorisSale {
  id_aksesoris: number;
  product_name: string;
  quantity: number;
  total_price: number;
  category: string;
}

type ProductExcelRow = {
  "ID Produk": number | null;
  "Nama Produk": string;
  "Kategori": string;
  "Jumlah Terjual": number;
  "Total Harga": number;
};

type AksesorisExcelRow = {
  "ID Aksesoris": number | null;
  "Nama Aksesoris": string;
  "Kategori": string;
  "Jumlah Terjual": number;
  "Total Harga": number;
};

/* =======================
   COMPONENT
======================= */

export default function PelaporanPage() {
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [aksesorisSales, setAksesorisSales] = useState<AksesorisSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersData = getOrders();

    const productMap = new Map<number, ProductSale>();
    const aksesorisMap = new Map<number, AksesorisSale>();

    ordersData.forEach((order: Order) => {
      order.items.forEach((item) => {
        const total = item.product_price * item.quantity;
        const category = item.Category || item.category || "";

        if (item.type === "product") {
          const existing = productMap.get(item.id_product);
          if (existing) {
            existing.quantity += item.quantity;
            existing.total_price += total;
          } else {
            productMap.set(item.id_product, {
              id_product: item.id_product,
              product_name: item.product_name,
              quantity: item.quantity,
              total_price: total,
              category,
            });
          }
        }

        if (item.type === "aksesoris") {
          const existing = aksesorisMap.get(item.id_product);
          if (existing) {
            existing.quantity += item.quantity;
            existing.total_price += total;
          } else {
            aksesorisMap.set(item.id_product, {
              id_aksesoris: item.id_product,
              product_name: item.product_name,
              quantity: item.quantity,
              total_price: total,
              category,
            });
          }
        }
      });
    });

    setProductSales(Array.from(productMap.values()));
    setAksesorisSales(Array.from(aksesorisMap.values()));
    setLoading(false);
  }, []);

  /* =======================
     CALCULATIONS
  ======================= */

  const sumQuantity = (data: { quantity: number }[]) =>
    data.reduce((sum, item) => sum + item.quantity, 0);

  const sumTotal = (data: { total_price: number }[]) =>
    data.reduce((sum, item) => sum + item.total_price, 0);

  /* =======================
     EXPORT EXCEL
  ======================= */

  const handleExportToExcel = () => {
    const productData: ProductExcelRow[] = productSales.map((item) => ({
      "ID Produk": item.id_product,
      "Nama Produk": item.product_name,
      "Kategori": item.category,
      "Jumlah Terjual": item.quantity,
      "Total Harga": item.total_price,
    }));

    productData.push({
      "ID Produk": null,
      "Nama Produk": "TOTAL",
      "Kategori": "",
      "Jumlah Terjual": sumQuantity(productSales),
      "Total Harga": sumTotal(productSales),
    });

    const aksesorisData: AksesorisExcelRow[] = aksesorisSales.map((item) => ({
      "ID Aksesoris": item.id_aksesoris,
      "Nama Aksesoris": item.product_name,
      "Kategori": item.category,
      "Jumlah Terjual": item.quantity,
      "Total Harga": item.total_price,
    }));

    aksesorisData.push({
      "ID Aksesoris": null,
      "Nama Aksesoris": "TOTAL",
      "Kategori": "",
      "Jumlah Terjual": sumQuantity(aksesorisSales),
      "Total Harga": sumTotal(aksesorisSales),
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productData), "Produk Terjual");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(aksesorisData), "Aksesoris Terjual");

    const date = new Date();
    const filename = `Pelaporan_${date.toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-black text-4xl font-bold">Pelaporan</h1>
          <button
            onClick={handleExportToExcel}
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition font-semibold"
          >
            Export ke Excel
          </button>
        </div>
        {/* TABEL TETAP SAMA (AMAN) */}
      </div>
    </div>
  );
}
