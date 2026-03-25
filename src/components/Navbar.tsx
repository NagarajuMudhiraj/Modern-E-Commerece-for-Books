import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { ShoppingCart, User, LogOut, BookOpen, LayoutDashboard, Menu, X, Tag, Search, Loader2, Sun, Moon, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';
import { Book } from '../types';
import { useTheme } from '../ThemeContext';

import logo from '../assets/images/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const res = await api.get('/books');
          const filtered = res.data.filter((b: Book) =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.author.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 5);
          setSuggestions(filtered);
          setShowSuggestions(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isAdmin = user?.role === 'ADMIN';

  const navLinks = [
    { name: 'Browse', path: '/books' },
    { name: 'Wishlist', path: '/wishlist' },
    ...(isAdmin ? [
      { name: 'Admin', path: '/admin', icon: LayoutDashboard },
      { name: 'Inventory', path: '/admin/books' },
      { name: 'Categories', path: '/admin/categories', icon: Tag },
      { name: 'Users', path: '/admin/users' },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass dark:bg-stone-950/80 border-b border-stone-200/50 dark:border-stone-800/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 sm:gap-4 group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                filter: [
                  "drop-shadow(0 0 5px rgba(251, 191, 36, 0.2))",
                  "drop-shadow(0 0 15px rgba(251, 191, 36, 0.5))",
                  "drop-shadow(0 0 5px rgba(251, 191, 36, 0.2))"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center bg-indigo-950 rounded-full border-2 border-indigo-400/30 shadow-2xl overflow-hidden"
            >
              <img
                src={logo}
                alt="Fort of Knowledge Logo"
                className="w-full h-full object-cover scale-125"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-black tracking-tighter text-indigo-950 dark:text-white group-hover:text-indigo-600 transition-colors leading-none">Fort of Knowledge</span>
              <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest leading-none mt-1 sm:mt-1.5">Standard of Excellence</span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-grow max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search authors, titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                className="w-full pl-10 pr-10 py-2.5 bg-stone-100 dark:bg-stone-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all dark:text-white placeholder-stone-400"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 animate-spin" />
              )}
            </div>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass dark:bg-stone-900 rounded-2xl overflow-hidden z-50 shadow-2xl border border-stone-200/50 dark:border-stone-800/50"
                >
                  {suggestions.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        navigate(`/books/${book.id}`);
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                        <img src={book.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-indigo-950 dark:text-white truncate">{book.title}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 truncate">{book.author.name}</div>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      navigate(`/books?search=${searchQuery}`);
                      setShowSuggestions(false);
                    }}
                    className="w-full p-3 bg-stone-50 dark:bg-stone-800/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    View all results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold tracking-wide transition-all ${location.pathname === link.path ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-500 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/cart" className="relative p-2 text-stone-500 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                  <ShoppingCart className="w-6 h-6" />
                  <AnimatePresence>
                    {cartItems.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-indigo-200"
                      >
                        {cartItems.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
                <Link to="/profile" className="flex items-center gap-2 p-2 text-stone-500 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                  <div className="hidden lg:block text-right">
                    <div className="text-xs font-bold text-indigo-950 dark:text-white leading-none">{user.name}</div>
                    <div className="flex items-center gap-1">
                      <div className="text-[10px] text-stone-400 font-medium uppercase tracking-tighter">{user.role}</div>
                      {user.isPrime && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    </div>
                  </div>
                  <User className="w-6 h-6" />
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-stone-500 hover:text-red-600 transition-all"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-5 py-2 text-stone-600 hover:text-indigo-600 font-bold text-sm transition-all">Login</Link>
                <Link to="/register" className="px-5 py-2 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Join</Link>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 text-stone-500 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all rounded-full hover:bg-stone-100/50 dark:hover:bg-stone-800/50"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-stone-500 dark:text-stone-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search authors, titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-100 dark:bg-stone-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 glass dark:bg-stone-900 rounded-2xl overflow-hidden z-50 shadow-xl border border-stone-200/50 dark:border-stone-800/50"
                    >
                      {suggestions.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => {
                            navigate(`/books/${book.id}`);
                            setSearchQuery('');
                            setShowSuggestions(false);
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-4 p-3 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-left"
                        >
                          <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                            <img src={book.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-indigo-950 dark:text-white truncate">{book.title}</div>
                            <div className="text-xs text-stone-500 truncate">{book.author.name}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-lg font-bold text-stone-700 dark:text-stone-300 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                {user && (
                  <>
                    <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-stone-700 dark:text-stone-300 hover:text-indigo-600 transition-colors">My Orders</Link>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-stone-700 dark:text-stone-300 hover:text-indigo-600 transition-colors">Profile</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
