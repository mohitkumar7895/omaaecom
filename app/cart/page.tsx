import Navbar from "../components/Navbar";
import { ShoppingBasket } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Empty Cart State */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        
        {/* Large Gray Basket Icon */}
        <div className="mb-6 text-gray-400/80">
          <ShoppingBasket className="w-32 h-32 stroke-[1.5]" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Your cart is empty
        </h2>
        
        <Link href="/">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-full transition-colors shadow-sm text-sm">
            Browse Services
          </button>
        </Link>
        
      </div>
    </main>
  );
}
