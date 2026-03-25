import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { WishlistItem } from '../types';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, BookOpen, Loader2, User } from 'lucide-react';

export default function SharedWishlist() {
    const { userId } = useParams();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSharedWishlist = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/wishlist/public/${userId}`);
                setItems(res.data);
            } catch (e: any) {
                console.error('Failed to fetch shared wishlist:', e);
                setError(e.response?.data?.message || 'Failed to load this wishlist.');
            } finally {
                setLoading(false);
            }
        };
        fetchSharedWishlist();
    }, [userId]);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-stone-500 dark:text-stone-400 font-medium">Loading collection...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center bg-white dark:bg-stone-900 p-12 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-800 max-w-md mx-4">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-200 dark:text-indigo-400/50">
                    <BookOpen className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-indigo-950 dark:text-white mb-4">Wishlist Not Found</h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">{error}</p>
                <Link
                    to="/books"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20"
                >
                    Browse Other Books
                </Link>
            </div>
        </div>
    );

    const userName = items[0]?.user?.name || "Member's";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12 text-center">
                <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl text-indigo-600 dark:text-indigo-400 mb-6">
                    <User className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-2">
                    {userName} Curated Library
                </h1>
                <p className="text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
                    Exploring a shared collection on Fort of Knowledge <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </p>
            </div>

            {items.length === 0 ? (
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-3xl p-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800">
                    <h2 className="text-2xl font-bold text-indigo-950 dark:text-white mb-4">No books found</h2>
                    <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-sm mx-auto">This wishlist is currently empty.</p>
                    <Link to="/books" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all">
                        <BookOpen className="w-5 h-5" /> Browse Library
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-stone-950/20 transition-all duration-300 border border-stone-100 dark:border-stone-800 group flex flex-col h-full"
                        >
                            <div className="aspect-[3/4] overflow-hidden relative">
                                <img
                                    src={item.book?.image_url || `https://picsum.photos/seed/book${item.book?.id}/600/800`}
                                    alt={item.book?.title || 'Book cover'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    Book ID: #{item.book?.id}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="font-bold text-indigo-950 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                    {item.book?.title || 'Unknown Title'}
                                </h3>
                                <p className="text-stone-400 dark:text-stone-500 text-sm mb-4">By {typeof item.book?.author === 'object' ? item.book.author.name : item.book?.author || 'Unknown Author'}</p>

                                <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                    <div className="font-black text-indigo-600 dark:text-indigo-400 text-xl">₹{item.book?.price}</div>
                                    <Link
                                        to={`/books/${item.book?.id}`}
                                        className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-indigo-950/20 flex items-center gap-2 text-sm font-bold"
                                    >
                                        <ShoppingBag className="w-4 h-4" /> View Details
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
