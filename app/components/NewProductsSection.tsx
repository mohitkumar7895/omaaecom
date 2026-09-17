import { Inbox } from "lucide-react";

export default function NewProductsSection() {
  return (
    <section className="bg-white py-12 px-6 lg:px-12 w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1e293b] inline-block relative pb-1">
            New Products
            <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-gradient-to-r from-blue-500 to-pink-500 rounded-full"></div>
          </h2>
        </div>

        {/* Coming Soon Box */}
        <div className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-12 px-4 bg-white w-full max-w-[280px]">
          <Inbox className="w-8 h-8 text-gray-400 mb-3" strokeWidth={1} />
          <p className="text-[12px] font-medium text-gray-500 tracking-wide text-center">
            New Products Plans coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
