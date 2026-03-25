import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Author, Book } from '../types';
import { motion } from 'motion/react';
import { Book as BookIcon, ExternalLink, ArrowLeft } from 'lucide-react';

export default function AuthorProfile() {
    const { id } = useParams<{ id: string }>();
    const [author, setAuthor] = useState<Author | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthorData = async () => {
            try {
                const [authorRes, booksRes] = await Promise.all([
                    api.get(`/authors/${id}`),
                    api.get(`/authors/${id}/bibliography`)
                ]);
                setAuthor(authorRes.data);
                setBooks(booksRes.data);
            } catch (error) {
                console.error('Error fetching author data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!author) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-black text-indigo-950 dark:text-white">Author not found</h2>
                <Link to="/books" className="text-indigo-600 dark:text-indigo-400 font-bold mt-4 inline-block hover:underline">
                    Back to Books
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/books" className="inline-flex items-center text-stone-500 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Books
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Author Info */}
                <div className="md:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="sticky top-24"
                    >
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl mb-6 bg-stone-200 dark:bg-stone-800 border border-stone-100 dark:border-stone-800">
                            <img
                                src={author.imageUrl || 'https://via.placeholder.com/400x400?text=Author'}
                                alt={author.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-4">{author.name}</h1>
                        <div className="h-1 w-20 bg-indigo-600 dark:bg-indigo-500 mb-6 rounded-full font-semibold"></div>
                        <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-lg italic">
                            "{author.biography}"
                        </p>
                    </motion.div>
                </div>

                {/* Bibliography */}
                <div className="md:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center mb-8">
                            <BookIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                            <h2 className="text-3xl font-black text-indigo-950 dark:text-white">Bibliography</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {books?.map((book, index) => (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white dark:bg-stone-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl dark:shadow-stone-950/20 transition-all border border-stone-100 dark:border-stone-800"
                                >
                                    <Link to={`/books/${book.id}`} className="flex h-full">
                                        <div className="w-1/3 aspect-[2/3] overflow-hidden">
                                            <img
                                                src={book.image_url}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="w-2/3 p-4 flex flex-col justify-center">
                                            <h3 className="font-bold text-indigo-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                                {book.title}
                                            </h3>
                                            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">{book.category_name}</p>
                                            <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-2">₹{book.price}</p>
                                            <div className="mt-4 flex items-center text-xs font-bold text-stone-400 dark:text-stone-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                View Details <ExternalLink className="w-3 h-3 ml-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {books?.length === 0 && (
                            <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800">
                                <p className="text-stone-500 dark:text-stone-400 text-lg">No books found for this author yet.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
