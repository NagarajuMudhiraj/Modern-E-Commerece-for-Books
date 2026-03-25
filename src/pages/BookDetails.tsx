import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Book, Review } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, RefreshCcw, Loader2, User as UserIcon, MessageSquare, Heart, Book as BookIcon } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import socket from '../services/socket';

import { useNotify } from '../components/NotificationProvider';
import Book3D from '../components/Book3D';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);
  const [show3D, setShow3D] = useState(false);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [stats, setStats] = useState<{ average: number, totalReviews: number, distribution: Record<number, number> } | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const { addToCart } = useCart();
  const { notify } = useNotify();
  const { user } = useAuth();

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

  const handleAddToCart = () => {
    if (!user) {
      notify('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }
    addToCart(book!.id, quantity);
    notify(`${book!.title} added to cart`, 'success');
  };

  const fetchBook = async () => {
    try {
      const res = await api.get(`/books/${id}`);
      const found = res.data;
      setBook(found || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get(`/books/${id}/recommendations`);
      setRecommendations(res.data);
    } catch (e) {
      console.error('Error fetching recommendations:', e);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const [reviewRes, statsRes] = await Promise.all([
        api.get(`/reviews/book/${id}`),
        api.get(`/reviews/stats/${id}`)
      ]);
      setReviews(reviewRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error('Error fetching reviews or stats:', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify('Please login to leave a review', 'warning');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (!comment.trim()) {
      notify('Please enter a comment', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        book_id: Number(id),
        rating: userRating,
        comment
      });
      notify('Review submitted successfully!', 'success');
      setComment('');
      setUserRating(5);
      fetchReviews();
    } catch (e) {
      notify('Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setRecommendationsLoading(true);
    fetchBook();
    fetchReviews();
    fetchRecommendations();

    if (user) {
      api.get('/wishlist').then(res => {
        setWishlistedIds(res.data.map((item: any) => item.book.id));
      });
    }

    const handleStockUpdate = (data: { bookId: number, stock: number }) => {
      if (Number(data.bookId) === Number(id)) {
        setBook(prev => prev ? { ...prev, stock: data.stock } : null);
      }
    };

    socket.on('stock_update', handleStockUpdate);
    return () => {
      socket.off('stock_update', handleStockUpdate);
    };
  }, [id]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (!book) return (
    <div className="text-center py-24">
      <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Book not found</h2>
      <button onClick={() => navigate('/books')} className="text-indigo-600 dark:text-indigo-400 font-bold mt-4 hover:underline">Back to library</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery Section */}
        <div className="flex flex-col gap-6">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-grow relative group"
          >
            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={book.image_url || `https://picsum.photos/seed/book${book.id}/800/1000`}
                alt={book.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute top-6 left-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1 z-30">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-indigo-950 dark:text-white">
                {reviews.length > 0
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'}
              </span>
              <span className="text-stone-400 text-sm">({reviews.length} reviews)</span>
            </div>

            <button
              onClick={() => setShow3D(true)}
              className="absolute bottom-6 right-6 bg-indigo-600/90 dark:bg-indigo-500/90 backdrop-blur text-white px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all z-30 group"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Interactive 3D Preview
            </button>

            {show3D && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center p-8"
              >
                <button
                  onClick={() => setShow3D(false)}
                  className="absolute top-6 right-6 p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 rotate-180" />
                </button>
                <h3 className="text-2xl font-black text-indigo-950 dark:text-white mb-4">Fort of Knowledge 3D Engine™</h3>
                <Book3D
                  frontImage={book.image_url}
                  title={book.title}
                  author={book.author?.name || 'Unknown'}
                />
                <p className="mt-8 text-stone-500 text-sm font-medium animate-bounce italic">Click & Hover to rotate</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs">{book.category_name || 'Fiction'}</div>
              <div className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Index: #{book.id}</div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 dark:text-white mb-4 leading-tight">{book.title}</h1>
            <p className="text-xl text-stone-500 dark:text-stone-400 font-medium">
              By <Link to={`/author/${book.author?.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-amber-600 transition-colors uppercase font-bold tracking-wider">{book.author?.name || 'Unknown Author'}</Link>
            </p>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">₹{book.price.toFixed(2)}</div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${book.stock > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
              {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            {book.preview_snippet_url && (
              <a
                href={book.preview_snippet_url}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-amber-500 text-amber-600 font-bold rounded-2xl hover:bg-amber-50 transition-all shadow-lg shadow-amber-50"
              >
                <BookIcon className="w-5 h-5" /> Read Sample
              </a>
            )}
          </div>

          <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-6 text-lg">
            {book.description || "No description available for this book yet. Stay tuned for more details about this amazing story."}
          </p>

          {book.topics && (
            <div className="flex flex-wrap gap-2 mb-10">
              {book.topics.split(',').map((topic, i) => (
                <span key={i} className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800 shadow-sm">
                  {topic.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 mb-12">
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-2xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-white dark:hover:bg-stone-700 rounded-xl transition-colors dark:text-white"
              >
                -
              </button>
              <span className="w-12 text-center font-black text-indigo-950 dark:text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-white dark:hover:bg-stone-700 rounded-xl transition-colors dark:text-white"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleToggleWishlist(book.id)}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all shadow-xl ${wishlistedIds.includes(book.id) ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 shadow-rose-100 dark:shadow-rose-900/40' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-rose-500 shadow-stone-100 dark:shadow-stone-900/40'}`}
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${wishlistedIds.includes(book.id) ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" /> Add to Cart
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-indigo-950 dark:text-white text-sm">Free Delivery</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">Orders over $50</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-indigo-950 dark:text-white text-sm">Secure Payment</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">100% Protected</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-indigo-950 dark:text-white text-sm">Easy Returns</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">30 Day Policy</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="mt-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Reviews List */}
          <div className="flex-grow">
            <h2 className="text-3xl font-black text-indigo-950 dark:text-white mb-8 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> User Reviews
            </h2>

            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-12 mb-12">
                {/* Stats Summary */}
                <div className="md:w-64 flex flex-col items-center justify-center p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 italic">
                  <div className="text-6xl font-black text-indigo-950 dark:text-white mb-2">{stats?.average.toFixed(1) || '0.0'}</div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-5 h-5 ${s <= Math.round(stats?.average || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-stone-300'}`} />
                    ))}
                  </div>
                  <div className="text-stone-500 dark:text-stone-400 font-bold text-sm">{stats?.totalReviews || 0} Reviews</div>
                </div>

                {/* Distribution Bars */}
                <div className="flex-grow space-y-3">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = stats?.distribution[star] || 0;
                    const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          {star} <Star className="w-3 h-3 fill-current" />
                        </div>
                        <div className="flex-grow h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-indigo-600 rounded-full"
                          />
                        </div>
                        <div className="w-8 text-xs font-bold text-stone-400">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!reviewsLoading && reviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {review.user?.name ? review.user.name[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-indigo-950 dark:text-white">{review.user?.name || 'Anonymous User'}</div>
                          <div className="text-xs text-stone-400 dark:text-stone-500">{new Date(review.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-stone-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed italic">"{review.comment}"</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="lg:w-96">
            <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-stone-950/50 border border-stone-100 dark:border-stone-800 sticky top-24">
              <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-6">Write a Review</h3>

              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-3">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setUserRating(s)}
                          className="focus:outline-none transition-transform active:scale-90"
                        >
                          <Star
                            className={`w-8 h-8 ${s <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-stone-200'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Share your thoughts</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like about this book?"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-32 dark:text-white placeholder-stone-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">You must be logged in to leave a review.</p>
                  <button
                    onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                    className="w-full py-3 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                  >
                    Login / Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-24">
        <h2 className="text-3xl font-black text-indigo-950 dark:text-white mb-8 flex items-center gap-3">
          <Star className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> You Might Also Like
        </h2>

        {recommendationsLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[250px] aspect-[3/4] bg-stone-100 dark:bg-stone-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400 italic">No recommendations found for this category.</p>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
            {recommendations.map(reco => (
              <motion.div
                key={reco.id}
                whileHover={{ y: -10 }}
                onClick={() => {
                  navigate(`/books/${reco.id}`);
                  window.scrollTo(0, 0);
                }}
                className="min-w-[250px] group cursor-pointer snap-start"
              >
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-lg mb-4 bg-white border border-stone-100 relative">
                  <img
                    src={reco.image_url || `https://picsum.photos/seed/book${reco.id}/400/600`}
                    alt={reco.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <div className="text-white font-bold">₹{reco.price.toFixed(2)}</div>
                  </div>
                </div>
                <h3 className="font-bold text-indigo-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{reco.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">{reco.author.name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
