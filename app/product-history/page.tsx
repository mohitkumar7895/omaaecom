"use client";

import Navbar from "../components/Navbar";
import { Package, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductHistoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
          
          if (user) {
            const bRes = await fetch("/api/bookings/my-bookings");
            if (bRes.ok) {
              const { bookings } = await bRes.json();
              // Filter bookings to find Product orders (assuming Product is in the name or category)
              const prods = (bookings || []).filter((b: any) => 
                b.services?.some((s: any) => s.name.toLowerCase().includes('ro') || s.name.toLowerCase().includes('product') || s.category?.toLowerCase() === 'product')
              );
              setProducts(prods);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load Product History");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Navbar />
      
      {/* Header Block */}
      <div className="bg-[#1e293b] w-full py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 text-white">
          <Package className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 text-[#38bdf8]" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Product History</h1>
            <p className="text-white/70 text-xs sm:text-sm font-medium mt-0.5">Track your past purchases and orders</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-[#38bdf8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !user ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="text-[#333] text-lg font-semibold mb-1">Please Login</h2>
              <p className="text-gray-500 text-sm mb-6">You must be logged in to view your product history.</p>
              <Link href="/login">
                <button className="bg-[#1e293b] hover:bg-black text-white font-medium py-2 px-6 rounded text-sm transition-colors">
                  Go to Login
                </button>
              </Link>
            </div>
          </div>
        ) : products.length === 0 ? (
          // Empty State
          <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
            <div className="text-center flex flex-col items-center bg-white rounded-3xl p-10 border border-gray-100 shadow-sm max-w-md w-full">
              <div className="w-20 h-20 bg-[#f0f9ff] rounded-full flex items-center justify-center mb-5">
                <ShoppingBag className="w-10 h-10 text-[#38bdf8]" strokeWidth={1.5} />
              </div>
              <h2 className="text-gray-900 text-xl font-bold mb-2">No Products Ordered</h2>
              <p className="text-gray-500 text-sm mb-8">You haven't ordered any products from us yet. Browse our catalog to find what you need.</p>
              <Link href="/">
                <button className="bg-[#1e293b] hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md flex items-center gap-2">
                  Browse Products <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((order, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">Order #{order.id}</h3>
                        <p className="text-gray-500 text-xs font-medium mt-0.5">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#f0fdf4] text-[#166534] text-xs font-black tracking-wide rounded-md border border-[#bbf7d0] uppercase">Delivered</span>
                  </div>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    {order.services?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{item.name}</span>
                        <span className="text-gray-900 font-bold">₹{Number(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-0.5 uppercase tracking-widest">Address</p>
                      <p className="text-gray-700 text-xs max-w-[200px] truncate">{order.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-semibold mb-0.5 uppercase tracking-widest">Total Paid</p>
                      <p className="font-extrabold text-[#38bdf8] text-lg">₹{Number(order.total_amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}