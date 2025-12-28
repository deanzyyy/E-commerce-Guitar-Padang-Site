
import Navbar from "./components/utilities/Navbar";
import Switch from "./components/Switch";
import Image from "next/image";

export default function Home() {


  return (
    <div className="bg-white">
      <Navbar/>
     
    
{/* UTAMA */}
    <div className="flex flex-rows mx-8 items-start">
{/* kiri */}
    <div className="w-1/2 px-12 space-y-2 items-center py-25">
        <h1 className="text-[100px] text-renggang text-black">TEMUKAN GITARMU <span>Disini</span></h1>
        <p className="text-black">Gitar Padang, Toko Gitar dengan menyediakan segala macam jenis Gitar dan Aksesoris Terbesar di Kota Padang.</p>
        <div className="space-x-8">
        <button className="border-2 border-black text-black px-6 py-3 cursor-pointer hover:bg-black hover:text-white transition">Masuk</button>
        <button className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition">Jelajahi</button>
        </div>
    </div>

    {/* kanan */}
    <div className=" h-screen m-6">

      <div className="">
      <Image
      src="/img/gambar.png"
      alt="Hero Image"
      width={500}
      height={300}
    />
      </div>

    </div>


    </div>
      


      <div>
        <Switch/>
      </div>

    </div>
  )
}

