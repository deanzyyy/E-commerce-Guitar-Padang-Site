"use client";

import { useEffect, useState } from "react";
import NavAdmin from "@/app/components/utilities/navAdmin";
import { getOrders, Order } from "@/app/lib/orders";
import * as XLSX from "xlsx";

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

export default function PelaporanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [aksesorisSales, setAksesorisSales] = useState<AksesorisSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = () => {
      const ordersData = getOrders();
      setOrders(ordersData);

      // Process product sales
      const productMap = new Map<number, ProductSale>();
      const aksesorisMap = new Map<number, AksesorisSale>();

      ordersData.forEach((order) => {
        order.items.forEach((item) => {
          if (item.type === "product") {
            const existing = productMap.get(item.id_product);
            if (existing) {
              existing.quantity += item.quantity;
              existing.total_price += item.product_price * item.quantity;
            } else {
              productMap.set(item.id_product, {
                id_product: item.id_product,
                product_name: item.product_name,
                quantity: item.quantity,
                total_price: item.product_price * item.quantity,
                category: item.Category || item.category || "",
              });
            }
          } else if (item.type === "aksesoris") {
            const existing = aksesorisMap.get(item.id_product);
            if (existing) {
              existing.quantity += item.quantity;
              existing.total_price += item.product_price * item.quantity;
            } else {
              aksesorisMap.set(item.id_product, {
                id_aksesoris: item.id_product,
                product_name: item.product_name,
                quantity: item.quantity,
                total_price: item.product_price * item.quantity,
                category: item.Category || item.category || "",
              });
            }
          }
        });
      });

      setProductSales(Array.from(productMap.values()));
      setAksesorisSales(Array.from(aksesorisMap.values()));
      setLoading(false);
    };

    loadOrders();
  }, []);

  const calculateProductTotal = () => {
    return productSales.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateAksesorisTotal = () => {
    return aksesorisSales.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateProductQuantityTotal = () => {
    return productSales.reduce((sum, item) => sum + item.quantity, 0);
  };

  const calculateAksesorisQuantityTotal = () => {
    return aksesorisSales.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleExportToExcel = () => {
    // Prepare data for Excel
    const productData = productSales.map((item) => ({
      "ID Produk": item.id_product,
      "Nama Produk": item.product_name,
      "Kategori": item.category,
      "Jumlah Terjual": item.quantity,
      "Total Harga": item.total_price,
    }));

    // Add total row for products
    productData.push({
      "ID Produk": "",
      "Nama Produk": "TOTAL",
      "Kategori": "",
      "Jumlah Terjual": calculateProductQuantityTotal(),
      "Total Harga": calculateProductTotal(),
    });

    const aksesorisData = aksesorisSales.map((item) => ({
      "ID Aksesoris": item.id_aksesoris,
      "Nama Aksesoris": item.product_name,
      "Kategori": item.category,
      "Jumlah Terjual": item.quantity,
      "Total Harga": item.total_price,
    }));

    // Add total row for aksesoris
    aksesorisData.push({
      "ID Aksesoris": "",
      "Nama Aksesoris": "TOTAL",
      "Kategori": "",
      "Jumlah Terjual": calculateAksesorisQuantityTotal(),
      "Total Harga": calculateAksesorisTotal(),
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheet for products
    const wsProducts = XLSX.utils.json_to_sheet(productData);
    XLSX.utils.book_append_sheet(wb, wsProducts, "Produk Terjual");

    // Create worksheet for aksesoris
    const wsAksesoris = XLSX.utils.json_to_sheet(aksesorisData);
    XLSX.utils.book_append_sheet(wb, wsAksesoris, "Aksesoris Terjual");

    // Generate filename with current date
    const date = new Date();
    const filename = `Pelaporan_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.xlsx`;

    // Write file
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

        {/* Tabel Produk Terjual */}
        <div className="mb-12">
          <h2 className="text-black text-2xl font-bold mb-4">Produk Terjual</h2>
          <div className="border border-black rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">ID Produk</th>
                  <th className="px-6 py-4 text-left font-semibold">Nama Produk</th>
                  <th className="px-6 py-4 text-left font-semibold">Kategori</th>
                  <th className="px-6 py-4 text-right font-semibold">Jumlah Terjual</th>
                  <th className="px-6 py-4 text-right font-semibold">Total Harga</th>
                </tr>
              </thead>
              <tbody>
                {productSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      Belum ada produk yang terjual
                    </td>
                  </tr>
                ) : (
                  <>
                    {productSales.map((item) => (
                      <tr key={item.id_product} className="border-t border-black hover:bg-gray-50">
                        <td className="px-6 py-4 text-black">{item.id_product}</td>
                        <td className="px-6 py-4 text-black">{item.product_name}</td>
                        <td className="px-6 py-4 text-black">{item.category}</td>
                        <td className="px-6 py-4 text-right text-black">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-semibold">
                          Rp {item.total_price.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-black bg-gray-100 font-bold">
                      <td colSpan={3} className="px-6 py-4 text-black text-right">
                        TOTAL
                      </td>
                      <td className="px-6 py-4 text-right text-black">
                        {calculateProductQuantityTotal()}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600">
                        Rp {calculateProductTotal().toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Aksesoris Terjual */}
        <div>
          <h2 className="text-black text-2xl font-bold mb-4">Aksesoris Terjual</h2>
          <div className="border border-black rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">ID Aksesoris</th>
                  <th className="px-6 py-4 text-left font-semibold">Nama Aksesoris</th>
                  <th className="px-6 py-4 text-left font-semibold">Kategori</th>
                  <th className="px-6 py-4 text-right font-semibold">Jumlah Terjual</th>
                  <th className="px-6 py-4 text-right font-semibold">Total Harga</th>
                </tr>
              </thead>
              <tbody>
                {aksesorisSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      Belum ada aksesoris yang terjual
                    </td>
                  </tr>
                ) : (
                  <>
                    {aksesorisSales.map((item) => (
                      <tr key={item.id_aksesoris} className="border-t border-black hover:bg-gray-50">
                        <td className="px-6 py-4 text-black">{item.id_aksesoris}</td>
                        <td className="px-6 py-4 text-black">{item.product_name}</td>
                        <td className="px-6 py-4 text-black">{item.category}</td>
                        <td className="px-6 py-4 text-right text-black">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-semibold">
                          Rp {item.total_price.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-black bg-gray-100 font-bold">
                      <td colSpan={3} className="px-6 py-4 text-black text-right">
                        TOTAL
                      </td>
                      <td className="px-6 py-4 text-right text-black">
                        {calculateAksesorisQuantityTotal()}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600">
                        Rp {calculateAksesorisTotal().toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

