import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Truck, CheckCircle2, Loader2, ArrowRight, ArrowLeft, ShieldCheck, Gift } from 'lucide-react';

export default function Checkout() {
  const { user, setUser } = api.defaults.headers.common['Authorization'] ? { user: JSON.parse(localStorage.getItem('user') || 'null'), setUser: () => { } } : { user: null, setUser: () => { } }; // Simplified for now, useAuth is better
  const { cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [usePoints, setUsePoints] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    paymentMethod: 'Online'
  });
  const navigate = useNavigate();

  const availablePoints = user?.points || 0;
  const pointDiscount = usePoints ? Math.min(availablePoints / 10, total) : 0;
  const finalTotal = total - pointDiscount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        book_id: item.book_id,
        quantity: item.quantity,
        price: item.price
      }));
      const res = await api.post('/orders', {
        total_amount: finalTotal,
        payment_method: formData.paymentMethod,
        points_used: usePoints ? availablePoints : 0,
        items
      });

      // Update local user points if points were used
      if (usePoints && user) {
        const updatedUser = { ...user, points: (user.points || 0) - availablePoints + Math.floor(finalTotal * 0.1) };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setSuccess(true);
      clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pointsToEarn = Math.floor(finalTotal * 0.1);

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex p-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 mb-8">
            <CheckCircle2 className="w-20 h-20" />
          </div>
          <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-4">Order Confirmed!</h1>
          <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-md mx-auto">Thank you for your purchase. Your books are being prepared for shipment. Redirecting to your orders...</p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Shipping', icon: Truck },
    { id: 2, title: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Checkout Progress Bar */}
      <div className="flex items-center justify-center mb-16 px-4">
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 scale-110' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500'}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <span className={`absolute -bottom-8 font-bold text-xs uppercase tracking-widest whitespace-nowrap ${step >= s.id ? 'text-indigo-600' : 'text-stone-400'}`}>{s.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-24 h-1 mx-4 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: step > s.id ? '100%' : '0%' }}
                  className="h-full bg-indigo-600"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
                    <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-8 flex items-center gap-2">
                      Delivery Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Street Address</label>
                        <input
                          required
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white placeholder-stone-400"
                          placeholder="123 Luxury Lane"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">City</label>
                          <input
                            required
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white placeholder-stone-400"
                            placeholder="Metropolis"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">ZIP Code</label>
                          <input
                            required
                            type="text"
                            value={formData.zip}
                            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                            className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white placeholder-stone-400"
                            placeholder="000123"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Glass Card UI */}
                  <div className="relative h-56 w-full rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-2xl overflow-hidden group perspective-1000">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-10 bg-amber-400/80 rounded-lg backdrop-blur-sm" />
                        <div className="text-xl font-black italic">VISA</div>
                      </div>
                      <div className="text-2xl font-mono tracking-widest">
                        {formData.cardNumber || '**** **** **** ****'}
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Card Holder</div>
                          <div className="font-bold tracking-wide uppercase">{formData.cardName || 'YOUR NAME'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Expires</div>
                          <div className="font-bold">{formData.expiry || 'MM/YY'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Cardholder Name</label>
                      <input
                        required
                        type="text"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white placeholder-stone-400"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Card Number</label>
                      <input
                        required
                        type="text"
                        maxLength={19}
                         value={formData.cardNumber}
                         onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                         className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono dark:text-white placeholder-stone-400"
                         placeholder="0000 0000 0000 0000"
                       />
                     </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Expiry Date</label>
                        <input
                          required
                          type="text"
                          maxLength={5}
                          value={formData.expiry}
                          onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                          className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white placeholder-stone-400"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">CVV</label>
                        <input
                          required
                          type="password"
                          maxLength={3}
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                          className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white placeholder-stone-400"
                          placeholder="***"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-grow py-5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-3xl font-bold text-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-bold text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{step === 2 ? 'Complete Payment' : 'Continue'} <ArrowRight className="w-6 h-6" /></>}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-24 h-fit"
        >
          <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] shadow-xl shadow-stone-200/50 dark:shadow-stone-950/50 border border-stone-100 dark:border-stone-800">
            <h3 className="text-2xl font-black text-indigo-950 dark:text-white mb-8">Summary</h3>
            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative">
                    <img src={item.image_url || `https://picsum.photos/seed/book${item.book_id}/100/150`} className="w-16 h-20 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{item.quantity}</span>
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-indigo-950 dark:text-white text-sm">{item.title}</div>
                    <div className="text-xs text-stone-400 dark:text-stone-500 font-bold uppercase tracking-tight">₹{item.price.toFixed(2)} each</div>
                  </div>
                  <div className="font-black text-indigo-950 dark:text-white text-base">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-6 mb-8 border border-indigo-100 dark:border-indigo-800/50 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-indigo-950 dark:text-white font-black text-sm">Reward Points</div>
                  <div className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase">You have <span className="text-indigo-950 dark:text-white">{availablePoints}</span> points</div>
                </div>
              </div>

              {availablePoints > 0 && (
                <button
                  type="button"
                  onClick={() => setUsePoints(!usePoints)}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all border-2 ${usePoints ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900 hover:border-indigo-200 dark:hover:border-indigo-800'}`}
                >
                  {usePoints ? 'Points Applied!' : `Redeem for ₹${(availablePoints / 10).toFixed(2)} off`}
                </button>
              )}

              <div className="text-[10px] text-indigo-400 dark:text-indigo-500 font-bold uppercase tracking-widest text-center">
                You will earn <span className="text-indigo-950 dark:text-white">{pointsToEarn}</span> points on this order
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-stone-100">
              <div className="flex justify-between text-stone-500 dark:text-stone-400 font-bold">
                <span>Subtotal</span>
                <span className="text-indigo-950 dark:text-white">₹{total.toFixed(2)}</span>
              </div>
              {usePoints && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Points Discount</span>
                  <span>-₹{pointDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500 dark:text-stone-400 font-bold">
                <span>Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 uppercase text-xs tracking-widest">Calculated</span>
              </div>
              <div className="flex justify-between items-center pt-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-indigo-950 dark:text-white">₹{finalTotal.toFixed(2)}</span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest">Inclusive of taxes</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black">
                  <ShieldCheck className="w-4 h-4" /> SECURE
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
