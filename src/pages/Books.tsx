import { useState, useEffect } from 'react';
import api from '../services/api';
import { Book, Category } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ShoppingCart, Info, Loader2, Star, RotateCcw, X, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';

import { useNotify } from '../components/NotificationProvider';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('id');
  const { addToCart } = useCart();
  const { notify } = useNotify();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (book: Book) => {
    if (!user) {
      notify('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }
    addToCart(book.id, 1);
    notify(`${book.title} added to cart`, 'success');
  };

  const handleToggleWishlist = async (bookId: number) => {
    if (!user) {
      notify('Please login to use wishlist', 'warning');
      navigate('/login');
      return;
    }

    try {
      if (wishlistedIds.includes(bookId)) {
        await api.delete(`/wishlist/${bookId}`);
        setWishlistedIds(prev => prev.filter(id => id !== bookId));
        notify('Removed from wishlist', 'info');
      } else {
        await api.post(`/wishlist/${bookId}`);
        setWishlistedIds(prev => [...prev, bookId]);
        notify('Added to wishlist', 'success');
      }
    } catch (e) {
      console.error(e);
      notify('Failed to update wishlist', 'error');
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      if (priceRange[1] < 5000) params.append('maxPrice', priceRange[1].toString());
      params.append('sortBy', sortBy);

      const res = await api.get(`/books/search?${params.toString()}`);
      setBooks(res.data);
    } catch (e) {
      console.error('Error fetching books:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catsRes = await api.get('/categories');
        setCategories(catsRes.data);
        if (user) {
          const wishRes = await api.get('/wishlist');
          setWishlistedIds(wishRes.data.map((item: any) => item.book.id));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, selectedCategory, priceRange, sortBy]);

  const filteredBooks = books; // Now handled by server

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setPriceRange([0, 5000]);
    setSortBy('id');
    setMinRating(0);
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-2">Explore Library</h1>
          <p className="text-stone-500 dark:text-stone-400">Discover your next favorite read from our collection.</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl font-bold text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          >
            <option value="id">Latest Arrivals</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-6 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl font-bold text-stone-700 dark:text-stone-300 hover:border-indigo-600 transition-all"
          >
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`
          fixed lg:relative inset-0 z-50 lg:z-0 lg:block lg:w-72 
          ${sidebarOpen ? 'block' : 'hidden'}
        `}>
          {/* Backdrop for mobile */}
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />

          <div className="absolute lg:relative right-0 lg:right-auto top-0 bottom-0 w-80 lg:w-full bg-white lg:bg-transparent dark:bg-stone-900 lg:dark:bg-transparent p-8 lg:p-0 overflow-y-auto">
            <div className="flex justify-between items-center lg:hidden mb-8">
              <h2 className="text-2xl font-bold dark:text-white">Filters</h2>
              <button onClick={() => setSidebarOpen(false)} className="dark:text-stone-400"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-10 sticky top-12">
              {/* Search */}
              <div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-400 uppercase tracking-widest mb-4">Search</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-400 uppercase tracking-widest mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-stone-600 dark:text-stone-400'}`}
                  >
                    All Books
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-stone-600 dark:text-stone-400'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-400 uppercase tracking-widest mb-4">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-sm font-bold text-indigo-900 dark:text-indigo-400">
                    <span>₹0</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-400 uppercase tracking-widest mb-4">Minimum Rating</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => setMinRating(s === minRating ? 0 : s)}
                      className="transition-transform active:scale-90"
                    >
                      <Star className={`w-6 h-6 ${s <= minRating ? 'text-yellow-500 fill-yellow-500' : 'text-stone-200 dark:text-stone-800'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-stone-100 dark:border-stone-800 rounded-2xl text-stone-400 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Book Grid */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-stone-100 dark:border-stone-800"
                >
                  <Link to={`/books/${book.id}`} className="block aspect-[3/4] overflow-hidden relative">
                    <img
                      src={book.image_url || `https://picsum.photos/seed/book${book.id}/600/800`}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {book.category_name || 'Fiction'}
                      </div>
                      <div className="bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider w-fit">
                        Index: #{book.id}
                      </div>
                    </div>
                  </Link>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-indigo-950 dark:text-white mb-1 line-clamp-1">{book.title}</h3>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mb-3">{book.author?.name || 'Unknown Author'}</p>
                    {book.topics && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {book.topics.split(',').slice(0, 2).map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-100 dark:border-stone-700 rounded text-[10px] uppercase font-bold tracking-tighter">
                            {topic.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-stone-50 dark:border-stone-800">
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{book.price.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleWishlist(book.id)}
                          className={`p-3 rounded-xl transition-all shadow-lg ${wishlistedIds.includes(book.id) ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 shadow-rose-100' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-rose-500 shadow-stone-100 dark:shadow-stone-900/50'}`}
                        >
                          <Heart className={`w-5 h-5 ${wishlistedIds.includes(book.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleAddToCart(book)}
                          disabled={book.stock === 0}
                          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-24 bg-stone-50 dark:bg-stone-900/50 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800">
              <div className="text-stone-300 mb-6 flex justify-center">
                <Search className="w-20 h-20" />
              </div>
              <h3 className="text-2xl font-black text-indigo-950 dark:text-white mb-2">No matching books</h3>
              <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-sm mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
              <button
                onClick={resetFilters}
                className="px-8 py-3 bg-white dark:bg-stone-800 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
