import Link from "next/link";

const NavAdmin = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-center pb-4 pointer-events-none">
      <div className="group relative pointer-events-auto">
        <div className="w-40 h-2 bg-gray-400/50 rounded-full mx-auto transition-all 
                    group-hover:opacity-0 group-hover:translate-y-2"></div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 
                    opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0
                    transition-all duration-300">
          <div className="bg-white border border-black px-6 py-6 flex space-x-24 items-center shadow-lg">
            <Link href="/admin" className="hover:text-black text-gray-700 transition text-xl">Beranda</Link>
            <Link href="/admin/products" className="hover:text-black text-gray-700 transition text-xl">Produk</Link>
            <Link href="/admin/aksesoris" className="hover:text-black text-gray-700 transition text-xl">Aksesoris</Link>
            <Link href="/admin/pesanan" className="hover:text-black text-gray-700 transition text-xl">Pesanan</Link>
            <Link href="/admin/pelaporan" className="hover:text-black text-gray-700 transition text-xl">Pelaporan</Link>
            <Link href="/logout" className="hover:text-black text-gray-700 transition text-xl">Logout</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavAdmin;

