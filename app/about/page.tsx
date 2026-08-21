import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Snowflake, Droplet, Flame, Microwave, RefreshCw, Check } from "lucide-react";

export const metadata = {
  title: "About Us - OMAA Company",
  description: "Your Trusted Home Service Partner",
};

export default function AboutPage() {
  const services = [
    { icon: <Snowflake className="w-8 h-8 text-[#6b46c1] mb-3" strokeWidth={1.5} />, title: "AC Repairing" },
    { icon: <Droplet className="w-8 h-8 text-[#6b46c1] mb-3" strokeWidth={1.5} />, title: "RO Water Purifier" },
    { icon: <Microwave className="w-8 h-8 text-[#6b46c1] mb-3" strokeWidth={1.5} />, title: "Microwave Oven" },
    { icon: <RefreshCw className="w-8 h-8 text-[#6b46c1] mb-3" strokeWidth={1.5} />, title: "Washing Machine" },
    { icon: <Flame className="w-8 h-8 text-[#6b46c1] mb-3" strokeWidth={1.5} />, title: "Kitchen Chimney" },
  ];

  const reasons = [
    { title: "Trained Technicians", desc: "Experienced professionals who follow proper safety standards" },
    { title: "Quality Parts", desc: "Genuine spare parts for lasting repairs" },
    { title: "Transparent Pricing", desc: "Fair pricing with no hidden charges" },
    { title: "Timely Service", desc: "Prompt service delivery" },
    { title: "Customer First", desc: "Your satisfaction is our priority" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Banner Section */}
      <div className="bg-[#6b46c1] text-white py-16 px-8 flex justify-center">
        <div className="max-w-6xl w-full">
          <h1 className="text-4xl font-bold mb-3 tracking-wide">About OMAA Company</h1>
          <p className="text-lg opacity-90">Your Trusted Home Service Partner</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 -mt-8 relative z-10 mb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 md:p-12">
          
          {/* Who We Are */}
          <section className="mb-12">
            <h2 className="text-[#6b46c1] text-2xl font-bold mb-4">Who We Are</h2>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              OMAA Company is a trusted home service provider offering reliable and affordable appliance repair and maintenance services. We understand how important your home appliances are to your daily life, and we're here to keep them running smoothly.
            </p>
          </section>

          {/* Our Services */}
          <section className="mb-12">
            <h2 className="text-[#6b46c1] text-2xl font-bold mb-6">Our Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {services.map((s, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-5 flex flex-col items-center justify-center text-center transition hover:shadow-md hover:-translate-y-1 duration-200">
                  {s.icon}
                  <span className="text-gray-800 font-medium text-sm leading-tight px-2">{s.title}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Why Choose Us */}
          <section>
            <h2 className="text-[#6b46c1] text-2xl font-bold mb-6">Why Choose Us?</h2>
            <ul className="space-y-3">
              {reasons.map((r, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-gray-800 mr-2 mt-1 flex-shrink-0 text-[13px] font-bold">✓</span>
                  <p className="text-gray-700 text-sm md:text-[15px]">
                    <strong className="text-gray-900">{r.title}:</strong> {r.desc}
                  </p>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
