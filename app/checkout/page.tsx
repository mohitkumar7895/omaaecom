"use client";

import { useEffect, useState, Suspense } from "react";
import Navbar from "../components/Navbar";
import { CheckCircle2, Lock, ShieldCheck, Hash, IndianRupee, Calendar, Clock, MapPin, CreditCard, Edit, Home, List, AlertCircle, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingSchedulePicker from "../components/BookingSchedulePicker";
import CashbackFeatures from "../components/CashbackFeatures";
import { getGstSettings } from "../actions/gst-settings";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gstSettings, setGstSettings] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    booking_date: '',
    time_slot: '',
    referred_by: searchParams.get('ref') || '',
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("omaa_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Auto-fill booking address from detected/saved user location
    const savedLoc = localStorage.getItem("user_location");
    if (savedLoc) {
      try {
        const parsedLoc = JSON.parse(savedLoc);
        if (parsedLoc.address) {
          setForm(prev => ({
            ...prev,
            address: prev.address || parsedLoc.address,
          }));
        }
      } catch (e) {}
    }

    getGstSettings().then((settings) => {
      if (settings) {
        setGstSettings(settings);
      }
    });
  }, []);

  const isGstItem = (item: any) => {
    const title = (item.title || item.name || "").toLowerCase();
    const catId = Number(item.category_id);
    const category = (item.category || item.type || item.category_title || "").toLowerCase();
    
    // Category 6 is New Products, Category 7 is RO AMC
    if (catId === 6 || catId === 7) return true;
    
    // Exact strict matching: ONLY RO AMC and New Products
    if (
      title.includes("ro amc") || 
      title.includes("amc plan") || 
      title.includes("amc package") ||
      title.includes("new product") ||
      category.includes("ro amc") ||
      category.includes("new product") ||
      category === "amc" ||
      category === "new products"
    ) {
      return true;
    }
    return false;
  };

  const itemTotals = cart.reduce((total, item) => total + (Number(item.selling_price) * item.quantity || 0), 0);

  // Apply GST on checkout based on payment method selection
  const gstRate = Number(gstSettings?.gst_rate || 0);
  const isOnline = paymentMethod === 'online';
  const gstEnabledForPayment = gstSettings ? (isOnline ? gstSettings.online_gst_enabled : gstSettings.cash_gst_enabled) : false;
  const applyGst = cart.some(isGstItem) && gstEnabledForPayment;
  const gstItemsTotal = cart.filter(isGstItem).reduce((sum, item) => sum + (Number(item.selling_price) * item.quantity || 0), 0);
  const gstAmount = applyGst ? (gstItemsTotal * (gstRate / 100)) : 0;

  // Convenience fee: waived for RO AMC and New Product carts
  const hasGstItems = cart.some(isGstItem);
  const convenienceFee = (cart.length > 0 && !hasGstItems) ? 49 : 0;
  const totalAmount = itemTotals + gstAmount + convenienceFee;

  // Check if ANY cart item requires a schedule (i.e. is NOT an AMC or New Product)
  const requiresSchedule = cart.some(item => {
    const title = (item.title || item.name || "").toLowerCase();
    const catId = Number(item.category_id);
    const category = (item.category || item.type || "").toLowerCase();
    
    // Category 6 is New Products, Category 7 is RO AMC in standard setup
    if (catId === 6 || catId === 7) return false;
    
    // Fallback checks by name/type
    if (
      title.includes("new product") || 
      title.includes("amc") || 
      title.includes("plan") ||
      category.includes("new product") || 
      category.includes("amc") ||
      category.includes("product")
    ) {
      return false;
    }
    
    // If it didn't match AMC/Product criteria, it's a regular service and needs scheduling
    return true;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Restrict mobile to digits only, max 10
    if (name === 'mobile') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm(prev => ({ ...prev, mobile: digits }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    // Clear error on change
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.mobile || form.mobile.length !== 10) newErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    
    if (requiresSchedule) {
      if (!form.booking_date) newErrors.booking_date = 'Please select a booking date';
      if (!form.time_slot) newErrors.time_slot = 'Please select a time slot';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          address: form.address,
          booking_date: requiresSchedule ? form.booking_date : new Date().toISOString().slice(0, 10),
          time_slot: requiresSchedule ? form.time_slot : 'Instant',
          payment_method: paymentMethod,
          total_amount: totalAmount,
          cart_items: cart,
          referred_by: form.referred_by,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem('omaa_cart');
        setOrderId(data.order_id || '');
        setSuccess(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      alert('Error submitting booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (success) {
    if (requiresSchedule) {
      return (
        <div className="min-h-screen bg-white sm:bg-[#fafafa] pb-12 flex flex-col font-sans selection:bg-black selection:text-white">
          <Navbar />
          <div className="flex-1 flex items-center justify-center mt-10 px-4">
            <div className="bg-white sm:shadow-[0_20px_60px_rgba(0,0,0,0.04)] sm:border border-gray-100 rounded-[32px] w-full max-w-[560px] relative overflow-hidden z-10 p-8 sm:p-12">
              
              {/* Subtle Success Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-green-400/10 rounded-full blur-[60px] pointer-events-none -z-10"></div>

              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] ring-8 ring-green-50">
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">Booking Confirmed</h2>
                <p className="text-gray-500 text-[15px] font-medium max-w-sm mx-auto">
                  Your appointment has been successfully scheduled. We've sent the details to your email and mobile.
                </p>
              </div>

              <div className="bg-[#fafafa] rounded-2xl p-6 mb-8 border border-gray-100/80">
                <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-200/60">
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Order ID</p>
                    <p className="text-gray-900 font-extrabold text-base tracking-tight">{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-gray-900 font-black text-xl">₹{Number(totalAmount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Date</p>
                    <p className="text-gray-900 font-bold text-[14px]">{new Date(form.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Time</p>
                    <p className="text-gray-900 font-bold text-[14px]">{form.time_slot}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Address</p>
                    <p className="text-gray-800 font-semibold text-[13px] leading-relaxed">{form.address}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5"/> Payment Method</p>
                    <span className="inline-block mt-0.5 px-3 py-1 bg-gray-100 text-gray-800 text-[12px] font-bold rounded-lg border border-gray-200/80">
                      Pay at Site (Cash/UPI)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => router.push('/')}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-black hover:bg-gray-50 text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[15px]"
                >
                  <Home className="w-4 h-4" /> Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-white sm:bg-[#fafafa] pb-12 flex flex-col font-sans selection:bg-black selection:text-white">
          <Navbar />
          <div className="flex-1 flex items-center justify-center mt-10 px-4">
            <div className="bg-white sm:shadow-[0_20px_60px_rgba(0,0,0,0.04)] sm:border border-gray-100 rounded-[32px] w-full max-w-[560px] relative overflow-hidden z-10 p-8 sm:p-12">
              
              {/* Subtle Success Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-green-400/10 rounded-full blur-[60px] pointer-events-none -z-10"></div>

              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] ring-8 ring-green-50">
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">Order Confirmed</h2>
                <p className="text-gray-500 text-[15px] font-medium max-w-sm mx-auto">
                  Your order has been placed successfully. We've sent the receipt to your email and mobile.
                </p>
              </div>

              <div className="bg-[#fafafa] rounded-2xl p-6 mb-8 border border-gray-100/80">
                <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-200/60">
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Order ID</p>
                    <p className="text-gray-900 font-extrabold text-base tracking-tight">{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-gray-900 font-black text-xl">₹{Number(totalAmount)}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Delivery Address</p>
                    <p className="text-gray-800 font-semibold text-[13px] leading-relaxed">{form.address}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5"/> Payment Method</p>
                    <span className="inline-block mt-0.5 px-3 py-1 bg-gray-100 text-gray-800 text-[12px] font-bold rounded-lg border border-gray-200/80">
                      Pay at Delivery (Cash/UPI)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => router.push('/')}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-black hover:bg-gray-50 text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[15px]"
                >
                  <Home className="w-4 h-4" /> Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 font-sans selection:bg-[#6b62d9] selection:text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-4 sm:mt-8">
        {/* Page Header */}
        <div className="mb-8 md:mb-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">Secure Checkout</h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium">Please fill in your details to complete your booking.</p>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 xl:gap-12">
          
          {/* Left Column - Booking Details */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10 relative">

              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg shadow-md">1</div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Your Information</h2>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">Where should we provide the service?</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700">Full Name</label>
                    <input 
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe" 
                      className={`w-full bg-white border rounded-xl px-4 py-3.5 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-300 ${errors.name ? 'border-red-400 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-black focus:ring-4 focus:ring-black/5 hover:border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-gray-200 pr-3 my-2">
                        <span className="text-gray-500 font-semibold text-sm">+91</span>
                      </div>
                      <input 
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className={`w-full bg-white border rounded-xl pl-16 pr-4 py-3.5 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-300 ${errors.mobile ? 'border-red-400 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-black focus:ring-4 focus:ring-black/5 hover:border-gray-300'}`}
                      />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.mobile}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-gray-700">Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input 
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com" 
                      className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-gray-300 transition-all text-gray-900 font-medium placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-gray-700">Service Address</label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { getCurrentLocation } = await import("@/lib/location");
                          const locationData = await getCurrentLocation();
                          if (locationData.address) {
                            setForm(prev => ({ ...prev, address: locationData.address }));
                            setErrors(prev => ({ ...prev, address: '' }));
                            localStorage.setItem('user_location', JSON.stringify(locationData));
                            window.dispatchEvent(new Event('location_changed'));
                          }
                        } catch (e: any) {
                          alert(e.message || "Failed to fetch live address.");
                        }
                      }}
                      className="text-xs font-bold text-[#6b62d9] hover:text-[#5249be] flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Use current location (GPS)</span>
                    </button>
                  </div>
                  <textarea 
                    rows={3}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House No, Street, Landmark, City, Pincode" 
                    className={`w-full bg-white border rounded-xl px-4 py-3.5 outline-none transition-all resize-none text-gray-900 font-medium placeholder:text-gray-300 ${errors.address ? 'border-red-400 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-black focus:ring-4 focus:ring-black/5 hover:border-gray-300'}`}
                  ></textarea>
                  {errors.address && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.address}</p>}
                </div>

                {/* Booking Date & Time Slot */}
                {requiresSchedule && (
                  <div className="pt-8 mt-8 border-t border-gray-100">
                    <BookingSchedulePicker 
                      selectedDate={form.booking_date}
                      selectedTime={form.time_slot}
                      onChange={(date, time) => {
                        setForm(prev => ({ ...prev, booking_date: date, time_slot: time }));
                        setErrors(prev => ({ ...prev, booking_date: '', time_slot: '' }));
                      }}
                      errorDate={errors.booking_date}
                      errorTime={errors.time_slot}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="w-full xl:w-[480px] shrink-0">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8 xl:sticky xl:top-28 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-xl shadow-inner">2</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Order Summary</h2>
              </div>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <List className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-[#f8f9fa] border border-gray-50/50 items-center transition-all hover:bg-gray-50">
                      <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden p-2">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-contain" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium bg-white px-2 py-0.5 rounded-full inline-block border border-gray-200 shadow-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-black text-gray-900 text-base shrink-0">₹{(Number(item.selling_price) * item.quantity).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Dotted divider */}
              <div className="border-t-[3px] border-dotted border-gray-200 pt-6 space-y-4 mb-6">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-gray-500 font-semibold">Subtotal</span>
                  <span className="font-bold text-gray-800">₹{itemTotals.toLocaleString()}</span>
                </div>
                {gstAmount > 0 && (
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="text-gray-500 font-semibold">GST ({gstRate}%)</span>
                    <span className="font-bold text-gray-800">₹{Math.round(gstAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-gray-500 font-semibold">Convenience Fee</span>
                  <span className="font-bold text-gray-800">₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-gray-500 font-semibold">Taxes & Visiting Charges</span>
                  <span className="font-bold text-[#328e3b] bg-green-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Free</span>
                </div>
              </div>

              {/* Redesigned Total to Pay Card */}
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-[#f8f7ff] via-[#f3f1ff] to-[#ebe7ff] border-2 border-[#6b62d9]/25 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-1">
                    Total Amount to Pay
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#328e3b] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Best Price Guaranteed</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-3xl sm:text-4xl text-[#584ec6] tracking-tight">
                    ₹{Math.round(totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[12px] font-black text-gray-400 tracking-widest mb-4 uppercase">Select Payment Method</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex-1 border-2 rounded-2xl p-5 cursor-pointer flex flex-col items-start transition-all duration-300 relative overflow-hidden group ${paymentMethod === 'online' ? 'border-[#6b62d9] bg-[#f8f7ff] shadow-[0_4px_20px_rgba(107,98,217,0.15)] ring-1 ring-[#6b62d9]' : 'border-gray-200 hover:border-[#6b62d9]/50 hover:bg-gray-50 bg-white'}`}>
                    <input type="radio" name="payment_method" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="hidden" />
                    {paymentMethod === 'online' && <div className="absolute top-3 right-3 text-[#6b62d9]"><CheckCircle2 className="w-5 h-5 fill-[#6b62d9]/20" /></div>}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${paymentMethod === 'online' ? 'bg-[#6b62d9] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[#6b62d9]/10 group-hover:text-[#6b62d9]'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <p className={`font-bold text-[15px] ${paymentMethod === 'online' ? 'text-[#6b62d9]' : 'text-gray-900'}`}>Pay Online</p>
                    <p className={`text-[12px] mt-1 font-medium ${paymentMethod === 'online' ? 'text-[#6b62d9]/70' : 'text-gray-500'}`}>UPI, Cards, Wallets</p>
                  </label>

                  <label className={`flex-1 border-2 rounded-2xl p-5 cursor-pointer flex flex-col items-start transition-all duration-300 relative overflow-hidden group ${paymentMethod === 'cash' ? 'border-[#328e3b] bg-[#f0f9f2] shadow-[0_4px_20px_rgba(50,142,59,0.15)] ring-1 ring-[#328e3b]' : 'border-gray-200 hover:border-[#328e3b]/50 hover:bg-gray-50 bg-white'}`}>
                    <input type="radio" name="payment_method" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="hidden" />
                    {paymentMethod === 'cash' && <div className="absolute top-3 right-3 text-[#328e3b]"><CheckCircle2 className="w-5 h-5 fill-[#328e3b]/20" /></div>}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${paymentMethod === 'cash' ? 'bg-[#328e3b] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[#328e3b]/10 group-hover:text-[#328e3b]'}`}>
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <p className={`font-bold text-[15px] ${paymentMethod === 'cash' ? 'text-[#328e3b]' : 'text-gray-900'}`}>Pay Cash</p>
                    <p className={`text-[12px] mt-1 font-medium ${paymentMethod === 'cash' ? 'text-[#328e3b]/70' : 'text-gray-500'}`}>After service</p>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-[#6b62d9] hover:bg-[#5b52c9] hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-white font-extrabold text-lg py-5 rounded-2xl transition-all duration-300 shadow-[0_8px_25px_rgba(107,98,217,0.35)] flex justify-center items-center gap-3 mb-5 group"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                ) : (
                  <>
                    {paymentMethod === 'online' ? 'Proceed to Secure Pay' : 'Confirm Cash Booking'}
                    <span className="font-normal opacity-80 text-base">| ₹{Math.round(totalAmount).toLocaleString()}</span>
                    <Lock className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-400 text-[13px] font-semibold bg-gray-50 py-3 rounded-xl border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-[#328e3b]" /> SSL Encrypted & Secure Checkout
              </div>

            </div>
          </div>

        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#6b62d9] border-t-transparent rounded-full animate-spin"></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

