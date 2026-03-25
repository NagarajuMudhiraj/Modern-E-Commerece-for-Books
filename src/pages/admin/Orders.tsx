import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Order } from '../../types';
import { motion } from 'motion/react';
import { Search, Filter, Eye, Loader2, Clock, User } from 'lucide-react';
import socket from '../../services/socket';

import { useNotify } from '../../components/NotificationProvider';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

  useEffect(() => {
    fetchOrders();

    const handleNewOrder = () => {
      fetchOrders();
      notify('New order received!', 'info');
    };

    socket.on('new_order', handleNewOrder);
    return () => {
      socket.off('new_order', handleNewOrder);
    };
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      notify(`Order #${id} updated to ${status}`, 'success');
      fetchOrders();
    } catch (e) {
      notify('Failed to update status', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.user_name?.toLowerCase().includes(search.toLowerCase()) || o.id.toString().includes(search);
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-2">Order Management</h1>
          <p className="text-stone-500 dark:text-stone-400">View and update order statuses in real-time.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search order ID, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64 transition-all dark:text-white placeholder-stone-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="Ordered">Ordered</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-950 dark:text-white">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-stone-700 dark:text-stone-300">{order.user_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">₹{order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                        order.status === 'Shipped' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          order.status === 'Packed' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                            'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-400 dark:text-stone-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 border-none rounded-xl text-xs font-bold text-indigo-950 dark:text-stone-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="Ordered">Ordered</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
