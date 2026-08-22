"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { CheckCircle2, Lock, ShieldCheck, Hash, IndianRupee, Calendar, Clock, MapPin, CreditCard, Edit, Home, List, AlertCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import BookingSchedulePicker from "../components/BookingSchedulePicker";
import CashbackFeatures from "../components/CashbackFeatures";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    booking_date: '',
    time_slot: '',
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("omaa_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const totalAmount = cart.reduce((total, item) => total + (Number(item.selling_price) * item.quantity || 0), 0);

  // Check if any cart item implies it's a product or AMC that doesn't need scheduling
  const requiresSchedule = !cart.some(item => {
    const title = (item.title || item.name || "").toLowerCase();
    const category = (item.category || item.type || "").toLowerCase();
    return (
      title.includes("new product") || 
      title.includes("amc") || 
      title.includes("plan") || 
      title.includes("purifier") ||
      category.includes("new product") || 
      category.includes("amc") ||
      category.includes("product") ||
      category.includes("purifier")
    );
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
          booking_date: form.booking_date,
          time_slot: form.time_slot,
          payment_method: paymentMethod,
          total_amount: totalAmount,
          cart_items: cart,
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
      // Detailed Service Booking Slip
      return (
        <div className="min-h-screen bg-[#f4f5f8] pb-12 flex flex-col font-sans">
          <Navbar />
          <div className="flex-1 flex justify-center mt-10 px-4">
            <div className="bg-white rounded-[24px] shadow-sm w-full max-w-[600px] border border-gray-200 overflow-hidden flex flex-col">
              
              {/* Header / Status Section */}
              <div className="bg-gradient-to-b from-[#ebfaee] to-white pt-10 pb-6 px-8 text-center border-b border-gray-100">
                <div className="w-20 h-20 bg-[#328e3b] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(50,142,59,0.25)] mx-auto mb-5">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-[28px] sm:text-[32px] font-black text-[#1a1a1a] tracking-tight mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 text-[15px] font-medium max-w-sm mx-auto">
                  Your appointment has been successfully scheduled. We have sent the details to your email and SMS.
                </p>
              </div>

              {/* Receipt Body */}
              <div className="px-6 sm:px-10 py-8">
                
                {/* Order Meta */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Order ID</p>
                    <p className="text-gray-900 font-extrabold text-lg">{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-[#328e3b] font-extrabold text-2xl">₹{totalAmount}</p>
                  </div>
                </div>

                <div className="h-[1px] bg-gray-100 w-full mb-6"></div>

                {/* Details Grid */}
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6b62d9]"/> Service Details
                </h3>
                <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 mb-8">
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1">Date</p>
                      <p className="text-gray-800 font-bold">{new Date(form.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1">Time Slot</p>
                      <p className="text-gray-800 font-bold">{form.time_slot}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-xs font-semibold mb-1">Address</p>
                      <p className="text-gray-800 font-semibold text-sm leading-relaxed">{form.address}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-xs font-semibold mb-1">Payment Method</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f9f2] text-[#2c7a34] text-xs font-bold rounded-lg border border-[#c3e6cb]">
                          <IndianRupee className="w-3.5 h-3.5" /> Pay at Site (COD)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps (Timeline) */}
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6b62d9]"/> What Happens Next
                </h3>
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 mb-8 pl-6">
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-white border-2 border-[#6b62d9] w-4 h-4 rounded-full mt-1"></div>
                    <p className="text-[14px] text-gray-700 font-medium">Our support team will <strong className="text-gray-900">call you</strong> to verify the appointment details.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-white border-2 border-[#6b62d9] w-4 h-4 rounded-full mt-1"></div>
                    <p className="text-[14px] text-gray-700 font-medium">A professional technician will arrive on <strong className="text-gray-900">{new Date(form.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> within your selected time slot.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-white border-2 border-[#6b62d9] w-4 h-4 rounded-full mt-1"></div>
                    <p className="text-[14px] text-gray-700 font-medium">After the service is completed, please pay <strong className="text-gray-900">₹{totalAmount} in cash</strong> to the technician.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-white border-2 border-[#6b62d9] w-4 h-4 rounded-full mt-1"></div>
                    <p className="text-[14px] text-gray-700 font-medium">A digital receipt and warranty details will be sent via SMS / WhatsApp.</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => router.push('/my-bookings')}
                    className="flex-1 bg-[#1a1a1a] hover:bg-black text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <List className="w-4 h-4" /> View Bookings
                  </button>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Edit className="w-4 h-4" /> Modify Booking
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => router.push('/')}
                    className="text-[#6b62d9] hover:text-[#5a52b8] font-bold text-sm flex items-center justify-center gap-1.5 transition mx-auto"
                  >
                    <Home className="w-4 h-4" /> Return to Home
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Simple Success Screen for RO AMC / New Products
      return (
        <div className="min-h-screen bg-[#f4f5f8] pb-12 flex flex-col font-sans">
          <Navbar />
          <div className="flex-1 flex justify-center mt-10 px-4">
            <div className="bg-white rounded-[24px] shadow-sm w-full max-w-[600px] border border-gray-200 overflow-hidden flex flex-col">
              
              {/* Header / Status Section */}
              <div className="bg-gradient-to-b from-[#ebfaee] to-white pt-10 pb-6 px-8 text-center border-b border-gray-100">
                <div className="w-20 h-20 bg-[#328e3b] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(50,142,59,0.25)] mx-auto mb-5">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-[28px] sm:text-[32px] font-black text-[#1a1a1a] tracking-tight mb-2">Order Confirmed!</h2>
                <p className="text-gray-500 text-[15px] font-medium max-w-sm mx-auto">
                  Your order has been placed successfully. We have sent the receipt to your email and SMS.
                </p>
              </div>

              {/* Receipt Body */}
              <div className="px-6 sm:px-10 py-8">
                
                {/* Order Meta */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Order ID</p>
                    <p className="text-gray-900 font-extrabold text-lg">{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-[#328e3b] font-extrabold text-2xl">₹{totalAmount}</p>
                  </div>
                </div>

                <div className="h-[1px] bg-gray-100 w-full mb-6"></div>

                {/* Details Grid */}
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6b62d9]"/> Delivery Details
                </h3>
                <div className="bg-[#fafafa] border border-gray-100 rounded-xl p-5 mb-8">
                  <div className="grid grid-cols-1 gap-y-5">
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1">Address</p>
                      <p className="text-gray-800 font-semibold text-sm leading-relaxed">{form.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1">Payment Method</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f9f2] text-[#2c7a34] text-xs font-bold rounded-lg border border-[#c3e6cb]">
                          <IndianRupee className="w-3.5 h-3.5" /> Pay at Site (COD)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features (Service & Cashback) */}
                <div className="mb-8">
                  <CashbackFeatures orderId={orderId} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => router.push('/my-bookings')}
                    className="flex-1 bg-[#1a1a1a] hover:bg-black text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <List className="w-4 h-4" /> View Orders
                  </button>
                  <button 
                    onClick={() => router.push('/')}
                    className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Home className="w-4 h-4" /> Return to Home
                  </button>
                </div>

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
          <div className="flex-1 w-full order-2 xl:order-1">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8 md:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6b62d9] via-[#8c84eb] to-[#9a91ec]"></div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#f0effb] text-[#6b62d9] flex items-center justify-center font-bold text-xl shadow-inner">1</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Your Information</h2>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2.5 transition-colors group-focus-within:text-[#6b62d9]">Full Name *</label>
                    <input 
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe" 
                      className={`w-full bg-[#f8f9fa] border-2 rounded-2xl px-5 py-4 outline-none focus:ring-4 transition-all text-gray-800 font-semibold placeholder:text-gray-400 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : 'border-transparent focus:border-[#6b62d9] focus:ring-[#6b62d9]/10 focus:bg-white hover:bg-gray-100'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.name}</p>}
                  </div>
                  <div className="group">
                    <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2.5 transition-colors group-focus-within:text-[#6b62d9]">Mobile Number *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-semibold">+91</span>
                      </div>
                      <input 
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className={`w-full bg-[#f8f9fa] border-2 rounded-2xl pl-14 pr-5 py-4 outline-none focus:ring-4 transition-all text-gray-800 font-semibold placeholder:text-gray-400 ${errors.mobile ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : 'border-transparent focus:border-[#6b62d9] focus:ring-[#6b62d9]/10 focus:bg-white hover:bg-gray-100'}`}
                      />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.mobile}</p>}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2.5 transition-colors group-focus-within:text-[#6b62d9]">Email Address (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-[#6b62d9] transition-colors" />
                    </div>
                    <input 
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com" 
                      className="w-full bg-[#f8f9fa] border-2 border-transparent rounded-2xl pl-12 pr-5 py-4 outline-none focus:bg-white focus:border-[#6b62d9] focus:ring-4 focus:ring-[#6b62d9]/10 hover:bg-gray-100 transition-all text-gray-800 font-semibold placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2.5 transition-colors group-focus-within:text-[#6b62d9]">Service Address *</label>
                  <textarea 
                    rows={3}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House No, Street, Landmark, City, Pincode" 
                    className={`w-full bg-[#f8f9fa] border-2 rounded-2xl px-5 py-4 outline-none focus:ring-4 transition-all resize-none text-gray-800 font-semibold placeholder:text-gray-400 ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : 'border-transparent focus:border-[#6b62d9] focus:ring-[#6b62d9]/10 focus:bg-white hover:bg-gray-100'}`}
                  ></textarea>
                  {errors.address && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.address}</p>}
                </div>

                {/* Booking Date & Time Slot */}
                {requiresSchedule && (
                  <div className="pt-6 border-t border-gray-100">
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
          <div className="w-full xl:w-[480px] shrink-0 order-1 xl:order-2">
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
                  <span className="font-bold text-gray-800">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-gray-500 font-semibold">Taxes & Fees</span>
                  <span className="font-bold text-[#328e3b] bg-green-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-10 bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-[20px] shadow-lg relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-[#6b62d9]/20 rounded-full blur-2xl"></div>
                
                <span className="font-semibold text-gray-300 text-lg relative z-10">Total to pay</span>
                <span className="font-black text-3xl relative z-10 tracking-tight">₹{totalAmount.toLocaleString()}</span>
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
                    <span className="font-normal opacity-80 text-base">| ₹{totalAmount.toLocaleString()}</span>
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

