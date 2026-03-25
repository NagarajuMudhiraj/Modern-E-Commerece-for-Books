import { useState, useEffect } from 'react';
import api from '../services/api';
import { WishlistItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, Trash2, BookOpen, Loader2, Share2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useNotify } from '../components/NotificationProvider';

export default function Wishlist() {
    const { user } = useAuth();
    const { notify } = useNotify();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/wishlist');
            setItems(res.data);
        } catch (e: any) {
            console.error('Failed to fetch wishlist:', e);
            setError(e.response?.data?.message || 'Failed to load wishlist. Please try again later.');
            notify('Error loading wishlist', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (bookId: number) => {
        try {
            await api.delete(`/wishlist/${bookId}`);
            setItems(prev => prev.filter(item => item.book?.id !== bookId));
            notify('Removed from wishlist', 'success');
        } catch (e: any) {
            console.error('Failed to remove item:', e);
            notify(e.response?.data?.message || 'Failed to remove item', 'error');
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleShare = () => {
        if (!user) return;
        const url = `${window.location.origin}/wishlist/shared/${user.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        notify('Share link copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-stone-500 dark:text-stone-400 font-medium">Loading your favorites...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center bg-white dark:bg-stone-900 p-12 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-800 max-w-md mx-4">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 dark:text-rose-400">
                    <Heart className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-indigo-950 dark:text-white mb-4">Something went wrong</h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">{error}</p>
                <button
                    onClick={fetchWishlist}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-2 flex items-center gap-3">
                            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> My Wishlist
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400">Books you've saved for later.</p>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl font-bold text-indigo-950 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm group"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110" />}
                            {copied ? 'Copied!' : 'Share Wishlist'}
                        </button>
                    )}
                </div>
            </div>

            {items.length === 0 ? (
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-3xl p-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800">
                    <div className="w-20 h-20 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600 shadow-sm">
                        <Heart className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-indigo-950 dark:text-white mb-4">Your wishlist is empty</h2>
                    <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-sm mx-auto">Found something you like? Click the heart icon on any book to save it here.</p>
                    <Link to="/books" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all">
                        <BookOpen className="w-5 h-5" /> Browse Books
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 group flex flex-col h-full"
                            >
                                <div className="aspect-[3/4] overflow-hidden relative">
                                    <img
                                        src={item.book?.image_url || `https://picsum.photos/seed/book${item.book?.id}/600/800`}
                                        alt={item.book?.title || 'Book cover'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg">
                                        <Heart className="w-4 h-4 fill-current" />
                                    </div>
                                    <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        Index: #{item.book?.id}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="font-bold text-indigo-950 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {item.book?.title || 'Unknown Title'}
                                    </h3>
                                    <p className="text-stone-400 text-sm mb-4">By {typeof item.book?.author === 'object' ? item.book.author.name : item.book?.author || 'Unknown Author'}</p>

                                    <div className="mt-auto pt-4 border-t border-stone-50 flex items-center justify-between">
                                        <div className="font-black text-indigo-600 text-xl">₹{item.book?.price}</div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRemove(item.book?.id)}
                                                className="p-2 text-stone-300 hover:text-rose-500 transition-colors"
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <Link
                                                to={`/books/${item.book?.id}`}
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
