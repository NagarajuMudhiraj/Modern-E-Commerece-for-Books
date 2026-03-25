import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { User, Mail, Phone, Shield, Camera, Save, Loader2, Award, Crown, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotify } from '../components/NotificationProvider';
import api from '../services/api';

export default function Profile() {
  const { user, login, setUser } = useAuth();
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setLoading(true);
    try {
      const res = await api.post('/users/profile-picture', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUser = { ...user!, avatarUrl: res.data.avatarUrl };
      login(localStorage.getItem('token')!, updatedUser);
      notify('Profile picture updated!', 'success');
    } catch (err) {
      notify('Failed to upload image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPrime = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/prime');
      setUser(res.data);
      notify('Welcome to Fort of Knowledge Prime!', 'success');
    } catch (e) {
      notify('Failed to join Prime', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, you'd call an API here. Since we're mocking local persistence:
      const updatedUser = { ...user!, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      login(localStorage.getItem('token')!, updatedUser);
      notify('Profile updated successfully', 'success');
    } catch (err) {
      notify('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-12">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden border-4 border-indigo-50 dark:border-indigo-900/50 shadow-inner">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080${user.avatarUrl}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-2xl font-black text-indigo-950 dark:text-white">{user?.name}</h2>
            <p className="text-stone-500 dark:text-stone-400 mb-6">{user?.email}</p>
            <div className={`inline-flex px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${user?.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
              {user?.role}
            </div>

            {user?.isPrime && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-4 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-tighter border border-amber-200 dark:border-amber-900/50 shadow-sm">
                <Crown className="w-3 h-3" /> Prime Member
              </div>
            )}

            <div className="mt-6 p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-950/20">
              <Award className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-black">{user?.points || 0}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Reward Points</div>
            </div>

            {!user?.isPrime && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinPrime}
                disabled={loading}
                className="mt-4 w-full p-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl text-white shadow-xl shadow-amber-200 dark:shadow-amber-950/20 flex flex-col items-center gap-2 group transition-all"
              >
                <Zap className="w-8 h-8 animate-pulse" />
                <div className="text-lg font-black italic">Upgrade to PRIME</div>
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-90">Unlock 2x Points & Free Shipping</div>
              </motion.button>
            )}

            {user?.isPrime && (
              <div className="mt-4 p-6 bg-stone-900 rounded-3xl text-white shadow-xl flex flex-col items-center gap-3 border border-stone-800">
                <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-stone-900 shadow-lg shadow-amber-900/20 rotate-3">
                  <Crown className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-amber-400 tracking-tight">PRIME ACTIVATED</div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">Premium Benefits Enabled</div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full mt-2">
                  <div className="bg-stone-800 p-2 rounded-xl text-[9px] font-bold text-stone-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" /> Free Shipping
                  </div>
                  <div className="bg-stone-800 p-2 rounded-xl text-[9px] font-bold text-stone-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" /> 2x Rewards
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
            <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-8 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Account Settings
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white placeholder-stone-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full pl-12 pr-4 py-3.5 bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-500 dark:text-stone-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white placeholder-stone-400"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-indigo-950/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-indigo-950 dark:text-white">Recent Activity</h3>
              <Link to="/orders" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">View All Orders</Link>
            </div>
            <div className="text-center py-8 text-stone-400 dark:text-stone-500">
              <p className="text-sm">Your recent orders and activity will appear here.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
