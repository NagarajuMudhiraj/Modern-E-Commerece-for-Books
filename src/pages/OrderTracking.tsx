import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Order } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Package, Truck, CheckCircle2, Box, Loader2 } from 'lucide-react';
import socket from '../services/socket';
import { useTheme } from '../ThemeContext';

import { useNotify } from '../components/NotificationProvider';

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotify();
  const { theme } = useTheme();

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.post(`/orders/${id}/cancel`);
      setOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      notify('Order cancelled successfully', 'success');
    } catch (e: any) {
      notify(e.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  useEffect(() => {
    fetchOrder();

    const handleStatusUpdate = (data: { orderId: number, status: string }) => {
      if (Number(data.orderId) === Number(id)) {
        setOrder(prev => prev ? { ...prev, status: data.status as any } : null);
        notify(`Your order is now ${data.status}!`, 'success');
      }
    };

    socket.on('order_status_update', handleStatusUpdate);
    return () => {
      socket.off('order_status_update', handleStatusUpdate);
    };
  }, [id]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-24">
      <h2 className="text-2xl font-bold text-indigo-950 dark:text-white">Order not found</h2>
      <button onClick={() => navigate('/orders')} className="text-indigo-600 font-bold mt-4 hover:underline">Back to orders</button>
    </div>
  );

  const steps = [
    { status: 'Ordered', icon: Package, label: 'Order Placed' },
    { status: 'Packed', icon: Box, label: 'Packed' },
    { status: 'Shipped', icon: Truck, label: 'Shipped' },
    { status: 'Delivered', icon: CheckCircle2, label: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Orders
        </button>
        {!isCancelled && (order.status === 'Ordered' || order.status === 'Packed') && (
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-full font-bold hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all border border-rose-100 dark:border-rose-900/30"
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-stone-950/20 border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className={`p-8 ${isCancelled ? 'bg-rose-600 dark:bg-rose-700' : 'bg-indigo-600 dark:bg-indigo-700'} text-white transition-colors`}>
          <div className="flex justify-between items-start">
            <div>
              <div className={`${isCancelled ? 'text-rose-200 dark:text-rose-300/60' : 'text-indigo-200 dark:text-indigo-300/60'} text-xs font-bold uppercase tracking-widest mb-1 transition-colors`}>
                {isCancelled ? 'Order Cancelled' : 'Order Tracking'}
              </div>
              <h1 className="text-3xl font-black">#{order.id}</h1>
            </div>
            <div className="text-right">
              <div className={`${isCancelled ? 'text-rose-200 dark:text-rose-300/60' : 'text-indigo-200 dark:text-indigo-300/60'} text-xs font-bold uppercase tracking-widest mb-1 transition-colors`}>Total Amount</div>
              <div className="text-2xl font-black">₹{order.total_amount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {!isCancelled ? (
            <div className="relative mb-16">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-1000"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />

              <div className="relative z-10 flex justify-between">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i <= currentStepIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor: isActive 
                            ? (theme === 'dark' ? '#3730a3' : '#4f46e5') 
                            : (theme === 'dark' ? '#292524' : '#f5f5f4'),
                          color: isActive ? '#ffffff' : (theme === 'dark' ? '#78716c' : '#a8a29e'),
                          scale: isActive ? 1.1 : 1
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                      <div className={`mt-4 text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-stone-500'}`}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-16 p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-6">
              <div className="w-16 h-16 bg-rose-600 dark:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-rose-950/20">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-rose-950 dark:text-rose-400">This order has been cancelled</h3>
                <p className="text-rose-600 dark:text-rose-500 italic">The items have been returned to stock.</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className={`text-xl font-bold ${isCancelled ? 'text-rose-950 dark:text-rose-400' : 'text-indigo-950 dark:text-white'} mb-4 transition-colors`}>Order Items</h3>
            {order.items?.map((item) => (
              <div key={item.id} className={`flex items-center gap-6 p-4 ${isCancelled ? 'bg-rose-50/50 dark:bg-rose-900/10' : 'bg-stone-50 dark:bg-stone-800'} rounded-2xl transition-colors`}>
                <img src={item.image_url || `https://picsum.photos/seed/book${item.book_id}/100/150`} className="w-16 h-20 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                <div className="flex-grow">
                  <div className={`font-bold ${isCancelled ? 'text-rose-950 dark:text-rose-400' : 'text-indigo-950 dark:text-white'} transition-colors`}>{item.title}</div>
                  <div className={`text-sm ${isCancelled ? 'text-rose-600' : 'text-stone-500 dark:text-stone-400'} transition-colors`}>Quantity: {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div className={`font-black ${isCancelled ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'} transition-colors`}>₹{(item.price * item.quantity).toFixed(2)}</div>
                  <div className={`text-xs ${isCancelled ? 'text-rose-400' : 'text-stone-400 dark:text-stone-500'} transition-colors`}>₹{item.price.toFixed(2)} each</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-8">
            <div>
              <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Payment Method</div>
              <div className="font-bold text-indigo-950 dark:text-white">{order.payment_method}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Order Date</div>
              <div className="font-bold text-indigo-950 dark:text-white">{new Date(order.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
