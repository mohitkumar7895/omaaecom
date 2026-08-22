"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { CheckCircle2, Lock, ShieldCheck, Hash, IndianRupee, Calendar, Clock, MapPin, CreditCard, Edit, Home, List, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import BookingSchedulePicker from "../components/BookingSchedulePicker";

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

  // Check if any cart item implies it's a product that doesn't need scheduling
  const requiresSchedule = !cart.some(item => {
    const title = (item.title || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    return title.includes("new product") || title.includes("ro amc") || category.includes("new product") || category.includes("ro amc");
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
        <div className="min-h-screen bg-[#f4f5f8] pb-10">
          <Navbar />
          <div className="flex justify-center mt-6 px-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-[500px] overflow-hidden border border-gray-100 pb-6 relative">
              {/* Header */}
              <div className="pt-10 pb-6 px-4 sm:px-8 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#328e3b] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#328e3b] tracking-tight mt-4 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 text-[14px] sm:text-[15px] font-medium leading-relaxed">
                  Your service has been scheduled. Pay cash to the technician after the job is done.
                </p>
              </div>

              {/* Details Card */}
              <div className="mx-4 sm:mx-6 bg-[#fafafa] rounded-2xl p-4 sm:p-5 mb-6">
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-[120px] flex items-center gap-2 text-gray-500 font-semibold text-sm">
                      <Hash className="w-4 h-4" /> Order ID
                    </div>
                    <div className="font-extrabold text-gray-900">{orderId}</div>
                  </div>
                  <div className="flex">
                    <div className="w-[120px] flex items-center gap-2 text-gray-500 font-semibold text-sm">
                      <IndianRupee className="w-4 h-4" /> Amount
                    </div>
                    <div className="font-extrabold text-gray-900">₹{totalAmount}</div>
                  </div>
                  <div className="flex">
                    <div className="w-[120px] flex items-center gap-2 text-gray-500 font-semibold text-sm">
                      <Calendar className="w-4 h-4" /> Service Date
                    </div>
                    <div className="font-medium text-gray-800">{new Date(form.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div className="flex">
                    <div className="w-[120px] flex items-center gap-2 text-gray-500 font-semibold text-sm">
                      <Clock className="w-4 h-4" /> Time Slot
                    </div>
                    <div className="font-medium text-gray-800">{form.time_slot}</div>
                  </div>
                  <div className="flex">
                    <div className="w-[120px] flex items-center gap-2 text-gray-500 font-semibold text-sm shrink-0">
                      <MapPin className="w-4 h-4" /> Address
                    </div>
                    <div className="font-medium text-gray-800 text-sm leading-snug">{form.address}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-500 font-semibold text-sm">
                      <CreditCard className="w-4 h-4" /> Payment
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-200">
                        <IndianRupee className="w-3 h-3" /> Pay at Site (COD)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="px-4 sm:px-6 mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">What happens next</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                    <p className="text-[13px] sm:text-[14px] text-gray-600 font-medium">Our team will <strong className="text-gray-800">call you</strong> to confirm your appointment shortly.</p>
                  </div>
                  <div className="h-px bg-gray-100 ml-9"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                    <p className="text-[13px] sm:text-[14px] text-gray-600 font-medium">A technician will arrive on <strong className="text-gray-800">{new Date(form.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> at the scheduled time.</p>
                  </div>
                  <div className="h-px bg-gray-100 ml-9"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                    <p className="text-[13px] sm:text-[14px] text-gray-600 font-medium">After the service, pay <strong className="text-gray-800">₹{totalAmount} cash</strong> to the technician.</p>
                  </div>
                  <div className="h-px bg-gray-100 ml-9"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</div>
                    <p className="text-[13px] sm:text-[14px] text-gray-600 font-medium">You'll get a <strong className="text-gray-800">digital receipt</strong> and warranty details via SMS / WhatsApp.</p>
                  </div>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="px-4 sm:px-6 mb-8">
                <div className="bg-[#f0f9f2] border border-[#d3ecd8] rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[#328e3b] shrink-0" />
                  <p className="text-[12px] sm:text-[13px] text-gray-700">
                    <strong className="text-[#328e3b]">Keep ₹{totalAmount} ready in cash.</strong> Our technician may not carry a card machine at all times.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 sm:px-6 flex flex-col sm:grid sm:grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => router.push('/my-bookings')}
                  className="bg-[#2c7a34] hover:bg-[#24632a] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <List className="w-4 h-4" /> My Bookings
                </button>
                <button 
                  onClick={() => router.push('/my-bookings')}
                  className="bg-[#1967d2] hover:bg-[#1557b0] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Edit className="w-4 h-4" /> Modify
                </button>
              </div>
              <div className="px-6 flex justify-center">
                <button 
                  onClick={() => router.push('/')}
                  className="text-gray-500 hover:text-gray-800 font-semibold text-sm flex items-center gap-2 transition bg-white border border-gray-200 px-6 py-2 rounded-full shadow-sm"
                >
                  <Home className="w-4 h-4" /> Home
                </button>
              </div>

            </div>
          </div>
        </div>
      );
    } else {
      // Simple Success Screen for RO AMC / New Products
      return (
        <div className="min-h-screen bg-[#f8f9fa]">
          <Navbar />
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
            <div className="bg-white rounded-2xl shadow-md p-12 max-w-md w-full">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Placed! 🎉</h2>
              <p className="text-gray-500 mb-2">Thank you, <span className="font-semibold text-gray-800">{form.name}</span>!</p>
              {orderId && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Your Order ID</p>
                  <p className="font-bold text-[#1967d2] text-lg tracking-widest">{orderId}</p>
                </div>
              )}
              <p className="text-gray-500 text-sm mb-6">We have received your order. Our team will contact you on <span className="font-semibold">{form.mobile}</span> shortly.</p>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-[#1967d2] hover:bg-[#1557b0] text-white font-bold py-3 rounded-xl transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] pb-20 font-sans">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-2 sm:mt-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column - Booking Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg shadow-md">1</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Booking Details</h1>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-10 relative overflow-hidden">
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6b62d9] to-[#9a91ec]"></div>

              <div className="space-y-6 sm:space-y-8 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
                    <input 
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name" 
                      className={`w-full border-2 rounded-xl px-4 py-3.5 outline-none focus:ring-4 transition-all text-gray-800 font-medium ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-black focus:ring-black/5 hover:border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number *</label>
                    <input 
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`w-full border-2 rounded-xl px-4 py-3.5 outline-none focus:ring-4 transition-all text-gray-800 font-medium ${errors.mobile ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-black focus:ring-black/5 hover:border-gray-300'}`}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.mobile}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com" 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-gray-300 transition-all text-gray-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Address *</label>
                  <textarea 
                    rows={3}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House No, Street, Landmark, City, Pincode" 
                    className={`w-full border-2 rounded-xl px-4 py-3.5 outline-none focus:ring-4 transition-all resize-none text-gray-800 font-medium ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-black focus:ring-black/5 hover:border-gray-300'}`}
                  ></textarea>
                  {errors.address && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</p>}
                </div>

                {/* Booking Date & Time Slot */}
                {requiresSchedule && (
                  <div className="pt-2">
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
          <div className="lg:w-[420px]">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-md">2</span>
                Payment Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">Your cart is empty.</p>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800 text-[15px]">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900 text-base">₹{(Number(item.selling_price) * item.quantity).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Dotted divider */}
              <div className="border-t-2 border-dashed border-gray-200 pt-5 space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Item Totals</span>
                  <span className="font-semibold text-gray-800">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Taxes & Fee</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-2xl">
                <span className="text-gray-900 font-extrabold text-lg">Total amount</span>
                <span className="font-black text-black text-2xl">₹{totalAmount.toLocaleString()}</span>
              </div>

              <div className="mb-8">
                <p className="text-[12px] font-bold text-gray-500 tracking-widest mb-4 uppercase">Payment Method</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer flex flex-col items-start transition-all relative overflow-hidden group ${paymentMethod === 'online' ? 'border-black bg-black' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" name="payment_method" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="hidden" />
                    {paymentMethod === 'online' && <div className="absolute top-2 right-2 text-white"><CheckCircle2 className="w-5 h-5" /></div>}
                    <Lock className={`w-6 h-6 mb-2 ${paymentMethod === 'online' ? 'text-white' : 'text-gray-400 group-hover:text-black transition-colors'}`} />
                    <p className={`font-bold text-base ${paymentMethod === 'online' ? 'text-white' : 'text-gray-900'}`}>Pay Online</p>
                    <p className={`text-[11px] mt-1 ${paymentMethod === 'online' ? 'text-gray-300' : 'text-gray-500'}`}>UPI, Cards, Wallets</p>
                  </label>

                  <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer flex flex-col items-start transition-all relative overflow-hidden group ${paymentMethod === 'cash' ? 'border-black bg-black' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" name="payment_method" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="hidden" />
                    {paymentMethod === 'cash' && <div className="absolute top-2 right-2 text-white"><CheckCircle2 className="w-5 h-5" /></div>}
                    <div className={`text-2xl mb-1 ${paymentMethod === 'cash' ? 'grayscale brightness-200' : 'grayscale group-hover:grayscale-0 transition-all'}`}>💵</div>
                    <p className={`font-bold text-base ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-900'}`}>Pay with Cash</p>
                    <p className={`text-[11px] mt-1 ${paymentMethod === 'cash' ? 'text-gray-300' : 'text-gray-500'}`}>After service</p>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-[#6b62d9] hover:bg-[#5b52c9] hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-[15px] py-4 rounded-xl transition-all shadow-[0_4px_16px_rgba(107,98,217,0.3)] flex justify-center items-center gap-2 mb-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                ) : paymentMethod === 'online' ? (
                  <>Proceed to Pay <span className="font-normal opacity-80">(₹{totalAmount.toLocaleString()})</span></>
                ) : (
                  <>Confirm Booking <span className="font-normal opacity-80">(₹{totalAmount.toLocaleString()})</span></>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Secure checkout
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

