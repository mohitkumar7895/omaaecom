const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'app/wallet/page.tsx', title: 'My Wallet', icon: 'Wallet', desc: 'Manage your OMAA cash and saved cards.' },
  { path: 'app/my-amc/page.tsx', title: 'My AMC Plans', icon: 'CalendarDays', desc: 'View and manage your Annual Maintenance Contracts.' },
  { path: 'app/product-history/page.tsx', title: 'Product History', icon: 'History', desc: 'View your previously purchased products and services.' },
  { path: 'app/cashback/page.tsx', title: 'Cashback & Offers', icon: 'Banknote', desc: 'View your earned cashback and available promo codes.' },
  { path: 'app/my-bookings/page.tsx', title: 'My Bookings', icon: 'Clock', desc: 'Track your upcoming and past service bookings.' },
  { path: 'app/manage-address/page.tsx', title: 'Manage Addresses', icon: 'MapPin', desc: 'Add, edit or delete your saved service addresses.' },
  { path: 'app/settings/page.tsx', title: 'Account Settings', icon: 'Settings', desc: 'Update your profile, notification preferences and security.' },
  { path: 'app/refer-earn/page.tsx', title: 'Refer & Earn', icon: 'Share2', desc: 'Invite friends and earn up to ₹32Cr in rewards!' }
];

pages.forEach(p => {
  const dir = path.dirname(p.path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const content = `import Navbar from "../components/Navbar";
import { ${p.icon} } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8">
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[50vh]">
          <div className="w-20 h-20 bg-[#e2e5fc] rounded-full flex items-center justify-center text-[#6069c9] mb-6">
            <${p.icon} className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">${p.title}</h1>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">${p.desc}</p>
          <Link href="/">
            <button className="mt-8 bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl transition-transform active:scale-[0.98] shadow-md">
              Go back to Home
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}`;

  fs.writeFileSync(p.path, content);
  console.log('Created ' + p.path);
});
