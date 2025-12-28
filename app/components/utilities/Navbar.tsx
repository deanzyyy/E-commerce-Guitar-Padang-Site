import Link from "next/link";
import Image from "next/image";

export default function Navbar(){
    return(
        <>
        {/* Div Utama */}
        <div className="w-full h-auto px-12  flex justify-between items-center">
            {/* logo */}
            <div className="flex flex-row items-center">
            <Image
      src="/img/LOGO.png"
      alt="Hero Image"
      width={100}
      height={50}
    />
                <h1 className="text-black font-bold text-2xl">Guitar Padang</h1>
            </div>

            {/* tengah */}
            <div className="space-x-6">
                <Link href="/produk" className="text-black dark:text-white font-semibold text-xl">Produk</Link>
                <Link href="/aksesoris" className="text-black dark:text-white font-semibold text-xl">Aksesoris</Link>
            </div>


            <div className="space-x-5">
                <Link href="/login" className="text-black border-2 border-black px-6 py-3 font-semibold ">Login</Link>
                <Link href="daftar" className="text-white bg-black  px-6 py-3  font-semibold">Daftar</Link>

            </div>
            {/* akhir */}
        </div>
        </>
    )
}