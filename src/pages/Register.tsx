import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../AuthContext';
import bgImage from '../assets/images/login-bg.png';

export default function Register() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden py-12">
      {/* Immersive Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/80 via-stone-900/40 to-indigo-950/60 backdrop-blur-[2px]" />
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[150px] rounded-full z-0"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-xl w-full"
      >
        {/* Glassmorphic Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-6 sm:p-8 md:p-12">
            <div className="text-center mb-10">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6 shadow-xl shadow-indigo-500/20"
              >
                <UserPlus className="w-8 h-8" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tighter">Join Fort of Knowledge</h1>
              <p className="text-stone-300 text-sm font-medium px-4">Start your reading journey with us today</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 backdrop-blur-md"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-white placeholder:text-stone-600 font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-white placeholder:text-stone-600 font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-white placeholder:text-stone-600 font-medium"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2 ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-white placeholder:text-stone-600 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -8px rgba(79, 70, 229, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl font-black text-lg hover:from-indigo-500 hover:to-indigo-400 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/30 disabled:opacity-50 mt-6"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : (
                  <>
                    Create Account <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-10 flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 w-full text-stone-600">
                <div className="h-px bg-white/10 flex-grow" />
                <span className="text-[10px] font-black uppercase tracking-widest">Already a member?</span>
                <div className="h-px bg-white/10 flex-grow" />
              </div>

              <Link
                to="/login"
                className="group flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-all"
              >
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-stone-500 text-[10px] font-black uppercase tracking-[0.4em] z-10 opacity-50">
        Enterprise Grade Encryption Active
      </div>
    </div>
  );
}
