"use client";

import Navbar from "../components/Navbar";
import { MapPin, CheckCircle2, User, Mail, Phone, Home, Building, Map, Navigation } from "lucide-react";
import { useEffect, useState } from "react";

export default function ManageAddressPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    houseNo: "",
    street: "",
    landmark: "",
    city: "",
    pincode: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
          if (user) {
            setFormData({
              name: user.name || `User ${user.phone}`,
              email: user.email || "",
              phone: user.phone || "",
              houseNo: "",
              street: "",
              landmark: "",
              city: "",
              pincode: ""
            });
          }
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Profile and Address saved successfully!");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#e68a00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  // Premium input class
  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[15px] text-gray-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#f39c12]/15 focus:border-[#f39c12] transition-all placeholder:text-gray-400 font-medium";
  const labelClass = "block text-gray-700 text-[13px] font-bold mb-2 uppercase tracking-wide";

  return (
    <main className="min-h-screen bg-[#f9fafb] flex flex-col font-sans">
      <Navbar />
      
      {/* Premium Header Block */}
      <div className="bg-gradient-to-r from-[#f39c12] to-[#e67e22] w-full pt-12 pb-36 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-[1050px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 text-white relative z-10">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight">Manage Addresses</h1>
            <p className="text-white/90 text-sm font-medium mt-1">Save your addresses for a faster checkout experience.</p>
          </div>
        </div>
      </div>

      {/* Overlapping Card Content */}
      <div className="flex-1 w-full flex justify-center px-4 sm:px-6 lg:px-8 -mt-24 mb-16">
        <div className="bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] w-full max-w-[1050px] border border-gray-100/50 p-6 sm:p-12 flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: Profile */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><User size={20} /></div>
              <h2 className="text-[15px] font-extrabold text-gray-900 tracking-wide uppercase">Profile Information</h2>
            </div>
            
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="E.g. John Doe"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone Number (Editable) */}
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Address */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <div className="bg-orange-50 p-2 rounded-lg text-orange-500"><Map size={20} /></div>
              <h2 className="text-[15px] font-extrabold text-gray-900 tracking-wide uppercase">Address Details</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                {/* House / Flat No */}
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>House / Flat No.</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Home size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="houseNo"
                      value={formData.houseNo}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="E.g. Flat 101"
                    />
                  </div>
                </div>
                
                {/* Pincode */}
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Pincode</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Navigation size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="E.g. 110001"
                    />
                  </div>
                </div>
              </div>

              {/* Street / Area */}
              <div>
                <label className={labelClass}>Street / Area</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                  <input 
                    type="text" 
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Street name, Area"
                  />
                </div>
              </div>

              {/* Landmark & City */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Landmark</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Building size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Near hospital"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Building size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Your city"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <button 
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-[#f39c12] to-[#e67e22] hover:from-[#e67e22] hover:to-[#d35400] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(243,156,18,0.25)] hover:shadow-[0_8px_25px_rgba(243,156,18,0.35)]"
                >
                  <CheckCircle2 className="w-5 h-5" /> Save Profile & Address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}