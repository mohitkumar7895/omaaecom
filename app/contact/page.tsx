import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapPin, Phone, Mail } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us - OMAA Company",
  description: "Get in touch with OMAA Company for any queries or support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Navbar />
      
      {/* Banner Section */}
      <div className="px-6 py-6 max-w-7xl mx-auto w-full">
        <div 
          className="w-full h-[250px] md:h-[350px] rounded-2xl overflow-hidden relative flex items-center shadow-md bg-gray-800"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&q=80&w=2070')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
          
          <h1 className="relative z-10 text-white text-4xl md:text-5xl font-bold ml-10 tracking-wide">
            Contact Us
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Left Column - Info */}
            <div className="lg:w-1/2">
              <h2 className="text-gray-900 text-[22px] font-bold mb-3">Keep In Touch With Us.</h2>
              <p className="text-gray-500 text-sm mb-10 leading-relaxed">
                We're always here to listen and assist — reach out anytime for quick support.
              </p>

              <div className="space-y-8">
                {/* Address */}
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mr-4">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-sm mb-1">Address</h3>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                      Plot No.197, Office No.2, Gaur City - 2 (Opp. Mahagun My Wood, Noida Extension)
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mr-4">
                    <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-sm mb-1">Phone</h3>
                    <p className="text-gray-600 text-sm">
                      +91 9999251966
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mr-4">
                    <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-sm mb-1">Email</h3>
                    <p className="text-gray-600 text-sm">
                      support@omaacompany.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Form */}
            <div className="lg:w-1/2">
              <ContactForm />
            </div>

          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl w-full mx-auto px-6 mb-16">
        <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <iframe 
            src="https://maps.google.com/maps?q=Plot%20No.197%2C%20Office%20No.2%2C%20Gaur%20City%20-%202%20(Opp.%20Mahagun%20My%20Wood%2C%20Noida%20Extension)&t=&z=15&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          ></iframe>
        </div>
      </div>
    </main>
  );
}
