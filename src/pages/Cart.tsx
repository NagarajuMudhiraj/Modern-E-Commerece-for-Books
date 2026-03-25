import { useCart } from '../CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useNotify } from '../components/NotificationProvider';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();
  const { notify } = useNotify();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex p-8 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-400 dark:text-stone-500 mb-8"
        >
          <ShoppingBag className="w-16 h-16" />
        </motion.div>
        <h2 className="text-3xl font-black text-indigo-950 dark:text-white mb-4">Your cart is empty</h2>
        <p className="text-stone-500 dark:text-stone-400 mb-10 max-w-md mx-auto">Looks like you haven't added any books to your collection yet. Start exploring our library!</p>
        <Link to="/books" className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  <img
                    src={item.image_url || `https://picsum.photos/seed/book${item.book_id}/200/300`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-black mb-4">₹{item.price.toFixed(2)}</p>

                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-colors dark:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-indigo-950 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-colors disabled:opacity-30 dark:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-stone-400 dark:text-stone-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="text-lg font-black text-indigo-950 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-stone-950/50 border border-stone-100 dark:border-stone-800 sticky top-24">
            <h3 className="text-2xl font-black text-indigo-950 dark:text-white mb-6">Order Summary</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900 dark:text-white">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Free</span>
              </div>
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <span className="text-lg font-bold text-indigo-950 dark:text-white">Total</span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200"
            >
              Checkout <ArrowRight className="w-5 h-5" />
            </button>

            <p className="mt-6 text-center text-xs text-stone-400">
              By proceeding to checkout, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
