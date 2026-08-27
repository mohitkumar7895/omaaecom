import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#5c67b8] text-white py-12 font-sans border-t border-indigo-400/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white inline-block">
              OMAA <span className="text-indigo-200">Company</span>
            </h2>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
            Trusted home appliance repair, maintenance and installation services delivered right at your doorstep.
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="space-y-2.5 flex flex-col">
          <h3 className="font-bold text-base text-white mb-1">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/" className="text-blue-100 hover:text-white hover:underline transition">
              Home
            </Link>
            <Link href="/about" className="text-blue-100 hover:text-white hover:underline transition">
              About Us
            </Link>
            <Link href="/#services" className="text-blue-100 hover:text-white hover:underline transition">
              Service
            </Link>
            <Link href="/contact" className="text-blue-100 hover:text-white hover:underline transition">
              Contact Us
            </Link>
            <Link href="/privacy-policy" className="text-blue-100 hover:text-white hover:underline transition">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-blue-100 hover:text-white hover:underline transition">
              Terms & Conditions
            </Link>
            <Link href="/complaint" className="text-blue-100 hover:text-white hover:underline transition">
              Lodge Complaint
            </Link>
          </div>
          <div className="pt-2">
            <Link 
              href="/registration_form.php" 
              className="inline-flex items-center text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition"
            >
              Professional Registration
            </Link>
          </div>
        </div>

        {/* Column 3: Customer Support */}
        <div>
          <h3 className="font-bold text-base text-white mb-3">Customer Support</h3>
          <div className="bg-[#6b76c4] rounded-xl p-5 space-y-3.5 shadow-inner border border-indigo-400/30">
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="w-4 h-4 flex-shrink-0 text-blue-200" />
              <span className="font-medium">+91 9999251966</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="w-4 h-4 flex-shrink-0 text-blue-200" />
              <span className="font-medium">support@omaacompany.com</span>
            </div>
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-1 text-blue-200" />
              <span className="leading-snug text-xs sm:text-sm text-blue-100">
                Plot No.197, Office No.2, Gaur City - 2 (Opp. Mahagun My Wood, Noida Extension)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-xs sm:text-sm text-blue-200 border-t border-blue-400/30 pt-6 px-4">
        © 2026 Powered by OMAA Company • CURRENTSEWA INDIA PRIVATE LIMITED
      </div>
    </footer>
  );
}
