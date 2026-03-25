import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, Search, ShoppingBag, Loader2, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { useNotify } from '../components/NotificationProvider';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';

import { Book } from '../types';

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);
  const { user } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get('/books');
        // Take the first 3 books as featured
        setFeaturedBooks(response.data.slice(0, 3));

        if (user) {
          const wishRes = await api.get('/wishlist');
          setWishlistedIds(wishRes.data.map((item: any) => item.book.id));
        }
      } catch (error) {
        console.error('Error fetching featured books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [user]);
  return (
    <div className="overflow-hidden">
      <Hero />

      {/* Stats Section */}
      <section className="py-24 bg-white dark:bg-stone-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Books', value: '50k+' },
              { label: 'Authors', value: '12k+' },
              { label: 'Readers', value: '100k+' },
              { label: 'Countries', value: '45+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-black text-indigo-900 dark:text-indigo-400 mb-2">{stat.value}</div>
                <div className="text-stone-500 dark:text-stone-400 font-medium uppercase tracking-widest text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white dark:bg-stone-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-indigo-950 dark:text-white mb-4">How it Works</h2>
            <p className="text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">Getting your favorite books has never been easier. Follow these simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Discover', desc: 'Browse our massive library of curated books across all genres.', icon: Search },
              { title: 'Order', desc: 'Add to cart and checkout with our secure and fast payment system.', icon: ShoppingBag },
              { title: 'Read', desc: 'Get your books delivered to your doorstep and start your journey.', icon: BookOpen },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="relative p-8 rounded-3xl glass text-center group transition-all duration-500 hover:bg-indigo-600/10 hover:border-indigo-500/50"
                >
                  <div className="inline-flex p-4 bg-white/80 dark:bg-stone-800/80 backdrop-blur rounded-2xl text-indigo-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-4 transition-colors">{step.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 transition-colors">{step.desc}</p>
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 -translate-y-1/2 text-stone-200">
                      <ArrowRight className="w-12 h-12" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-indigo-950 dark:text-white mb-4">Editor's Choice</h2>
              <p className="text-stone-500 dark:text-stone-400">Handpicked stories you can't miss.</p>
            </div>
            <Link to="/books" className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : featuredBooks.length > 0 ? (
              featuredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  whileHover={{ y: -10 }}
                  className="glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img
                      src={book.image_url || `https://picsum.photos/seed/book${book.id}/600/800`}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {book.category_name || 'Fiction'}
                      </div>
                      <div className="bg-indigo-600/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                        Index: #{book.id}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-1 truncate">{book.title}</h3>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mb-3">By {book.author?.name || 'Unknown Author'}</p>
                    {book.topics && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {book.topics.split(',').slice(0, 2).map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-400 rounded text-[10px] uppercase font-bold border border-indigo-100/50 dark:border-indigo-800/50">
                            {topic.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{book.price.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleWishlist(book.id)}
                          className={`p-2 rounded-xl transition-all shadow-lg ${wishlistedIds.includes(book.id) ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-rose-500'}`}
                        >
                          <Heart className={`w-5 h-5 ${wishlistedIds.includes(book.id) ? 'fill-current' : ''}`} />
                        </button>
                        <Link to="/books" className="p-2 bg-stone-100 rounded-full hover:bg-indigo-600 hover:text-white transition-colors text-stone-600">
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-stone-500">
                Check back later for our editor's picks.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
