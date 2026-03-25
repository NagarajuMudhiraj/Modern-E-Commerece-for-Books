import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'motion/react';
import { Users, BookOpen, ShoppingBag, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Automatic refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
    </div>
  );

  if (!stats) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="w-10 h-10 text-amber-500" />
      <div className="text-stone-500 dark:text-stone-400 font-medium">Failed to load dashboard data.</div>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  const cards = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Books', value: stats.totalBooks || 0, icon: BookOpen, color: 'bg-indigo-500' },
    { label: 'Revenue', value: `₹${(stats.revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'MRR (30d)', value: `₹${(stats.mrr || 0).toFixed(2)}`, icon: ShoppingBag, color: 'bg-amber-500' },
    { label: 'Avg Order', value: `₹${(stats.aov || 0).toFixed(2)}`, icon: Users, color: 'bg-blue-500' },
  ];

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-12">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center gap-6"
            >
              <div className={`p-4 rounded-2xl text-white ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-stone-400 dark:text-stone-500 text-xs font-bold uppercase tracking-widest">{card.label}</div>
                <div className="text-2xl font-black text-indigo-950 dark:text-white">{card.value}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
          <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-8">Sales Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.salesByDay || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292524" opacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
          <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-8">Category Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData || []}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats.categoryData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {(stats.categoryData || []).map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-indigo-950 dark:text-white">Low Stock Alerts</h3>
            <span className="px-3 py-1 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">{(stats.lowStock || []).length} Items</span>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {(!stats.lowStock || stats.lowStock.length === 0) ? (
              <div className="text-center py-12 text-stone-400 dark:text-stone-500">All books are well stocked.</div>
            ) : (
              (stats.lowStock || []).map((book: any) => (
                <div key={book.id} className="flex items-center gap-4 p-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-grow">
                    <div className="font-bold text-indigo-950 dark:text-white text-sm">{book.title}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Author: {typeof book.author === 'string' ? book.author : book.author?.name || 'Unknown'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-red-600">{book.stock}</div>
                    <div className="text-[10px] font-bold text-red-400 uppercase">Left</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
