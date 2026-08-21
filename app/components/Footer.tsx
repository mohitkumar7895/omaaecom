import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#5c67b8] text-white py-12">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div className="bg-white p-2 rounded inline-block">
            <img src="/logoomaa.webp" alt="OMAA Logo" className="h-10 object-contain" />
          </div>
          <p className="text-blue-100 text-sm">Trusted home services at your doorstep.</p>
        </div>

        {/* Column 2: Links */}
        <div className="space-y-3 flex flex-col">
          <Link href="#" className="text-blue-100 hover:text-white text-sm transition">
            Privacy Policy
          </Link>
          <Link href="#" className="text-blue-100 hover:text-white text-sm transition">
            Terms & Conditions
          </Link>
          <Link href="#" className="font-semibold hover:text-blue-200 text-sm transition">
            Professional Registration form
          </Link>
        </div>

        {/* Column 3: Customer Support */}
        <div>
          <h3 className="font-bold text-lg mb-4">Customer Support</h3>
          <div className="bg-[#6b76c4] rounded-lg p-6 space-y-4 shadow-inner">
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>+91 9999251966</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>support@omaacompany.com</span>
            </div>
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
              <span className="leading-snug">
                Plot No.197, Office No.2, Gaur City - 2 (Opp. Mahagun My Wood, Noida Extension)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 text-center text-sm text-blue-200 border-t border-blue-400/30 pt-6">
        © 2026 Powered by OMAA CURRENTSEWA INDIA PRIVATE LIMITED
      </div>
    </footer>
  );
}
