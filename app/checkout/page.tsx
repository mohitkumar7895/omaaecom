"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

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
    if (!form.booking_date) newErrors.booking_date = 'Please select a booking date';
    if (!form.time_slot) newErrors.time_slot = 'Please select a time slot';
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
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
          <div className="bg-white rounded-2xl shadow-md p-12 max-w-md w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking Confirmed! 🎉</h2>
            <p className="text-gray-500 mb-2">Thank you, <span className="font-semibold text-gray-800">{form.name}</span>!</p>
            {orderId && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-3">
                <p className="text-xs text-gray-500 mb-1">Your Order ID</p>
                <p className="font-bold text-[#673ab7] text-lg tracking-widest">{orderId}</p>
              </div>
            )}
            <p className="text-gray-500 text-sm mb-2">📅 <span className="font-semibold">{form.booking_date}</span> &nbsp;⏰ <span className="font-semibold">{form.time_slot}</span></p>
            <p className="text-gray-500 text-sm mb-6">Our team will contact you on <span className="font-semibold">{form.mobile}</span> shortly.</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-[#673ab7] hover:bg-[#5e35b1] text-white font-bold py-3 rounded-xl transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-10 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Booking Details */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-8">
                <CheckCircle2 className="w-8 h-8 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Details</h1>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name" 
                      className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-1 transition ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number *</label>
                    <input 
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-1 transition ${errors.mobile ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                    {!errors.mobile && form.mobile.length > 0 && (
                      <p className={`text-xs mt-1 ${form.mobile.length === 10 ? 'text-green-500' : 'text-gray-400'}`}>
                        {form.mobile.length}/10 digits
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Address *</label>
                  <textarea 
                    rows={4}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House No, Street, Landmark, City, Pincode" 
                    className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-1 transition resize-none ${errors.address ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                  ></textarea>
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Booking Date & Time Slot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Booking Date *</label>
                    <input
                      type="date"
                      name="booking_date"
                      value={form.booking_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-1 transition ${errors.booking_date ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                    />
                    {errors.booking_date && <p className="text-red-500 text-xs mt-1">{errors.booking_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Time Slot *</label>
                    <select
                      name="time_slot"
                      value={form.time_slot}
                      onChange={(e) => { setForm(prev => ({ ...prev, time_slot: e.target.value })); setErrors(prev => ({ ...prev, time_slot: '' })); }}
                      className={`w-full border rounded-lg px-4 py-3 outline-none focus:ring-1 transition bg-white ${errors.time_slot ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                    >
                      <option value="">Select a slot</option>
                      <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                      <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                    </select>
                    {errors.time_slot && <p className="text-red-500 text-xs mt-1">{errors.time_slot}</p>}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-sm">Your cart is empty.</p>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800 text-[15px]">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} (service)</p>
                      </div>
                      <p className="font-bold text-gray-900">₹{(Number(item.selling_price) * item.quantity).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Item Totals</span>
                  <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-800 font-bold">Total amount</span>
                  <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-900 font-bold text-lg">Amount to Pay</span>
                <span className="font-bold text-gray-900 text-2xl">₹{totalAmount.toLocaleString()}</span>
              </div>

              <div className="mb-6">
                <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 uppercase">Select Payment Method</p>
                <div className="flex gap-3">
                  <label className={`flex-1 border-2 rounded-lg p-3 cursor-pointer flex items-start gap-3 transition ${paymentMethod === 'online' ? 'border-[#673ab7] bg-purple-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment_method" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="mt-1 accent-[#673ab7] w-4 h-4" />
                    <div>
                      <p className={`font-bold text-sm ${paymentMethod === 'online' ? 'text-[#673ab7]' : 'text-gray-900'}`}>Pay Online</p>
                      <p className="text-[10px] text-gray-500">UPI, Cards, Wallets</p>
                    </div>
                  </label>
                  <label className={`flex-1 border-2 rounded-lg p-3 cursor-pointer flex items-start gap-3 transition ${paymentMethod === 'cash' ? 'border-[#673ab7] bg-purple-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment_method" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="mt-1 accent-[#673ab7] w-4 h-4" />
                    <div>
                      <p className={`font-bold text-sm flex items-center gap-1 ${paymentMethod === 'cash' ? 'text-[#673ab7]' : 'text-gray-900'}`}>
                        <span className="text-green-600 text-base">💵</span> Cash on Book
                      </p>
                      <p className="text-[10px] text-gray-500">Pay later</p>
                    </div>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-[#673ab7] hover:bg-[#5e35b1] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition shadow-md flex justify-center items-center gap-2 mb-4"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : paymentMethod === 'online' ? (
                  <><Lock className="w-4 h-4" /> Proceed to Online Payment</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Confirm Cash Booking</>
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs">
                <ShieldCheck className="w-4 h-4" /> Secure payment powered by Cashfree
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

