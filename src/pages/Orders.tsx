import { useState, useEffect } from 'react';
import api from '../services/api';
import { Order } from '../types';
import { motion } from 'motion/react';
import { Package, ChevronRight, Loader2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import socket from '../services/socket';
import { useAuth } from '../AuthContext';

import { useNotify } from '../components/NotificationProvider';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { notify } = useNotify();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      notify('Order cancelled successfully', 'success');
    } catch (e: any) {
      notify(e.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleStatusUpdate = (data: { orderId: number, status: string, userId: number }) => {
      if (user && data.userId === user.id) {
        setOrders(prev => prev.map(o => o.id === Number(data.orderId) ? { ...o, status: data.status as any } : o));
        notify(`Order #${data.orderId} status updated to ${data.status}`, 'info');
      }
    };

    socket.on('order_status_update', handleStatusUpdate);
    return () => {
      socket.off('order_status_update', handleStatusUpdate);
    };
  }, [user]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-2">My Orders</h1>
          <p className="text-stone-500 dark:text-stone-400">Track and manage your book purchases.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
          <Package className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-900 dark:text-white">No orders yet</h3>
          <p className="text-stone-500 dark:text-stone-400 mb-8">Start shopping to see your orders here.</p>
          <Link to="/books" className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest mb-1">Order #{order.id}</div>
                    <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm mb-2">
                      <Clock className="w-4 h-4" /> {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-2xl font-black text-indigo-950 dark:text-white">₹{order.total_amount.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-center gap-4">
                  <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                    order.status === 'Shipped' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      order.status === 'Packed' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        order.status === 'Cancelled' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                          'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    }`}>
                    {order.status}
                  </div>
                  <div className="flex items-center gap-4">
                    {(order.status === 'Ordered' || order.status === 'Packed') && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="text-rose-600 text-sm font-bold hover:underline"
                      >
                        Cancel Order
                      </button>
                    )}
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                    >
                      Track Order <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
