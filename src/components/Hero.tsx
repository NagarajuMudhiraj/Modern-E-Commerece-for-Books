import React from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Star } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Hero() {
    const { user } = useAuth();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const rotate = useTransform(scrollY, [0, 500], [0, 45]);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const magneticX = useSpring(mouseX, springConfig);
    const magneticY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const titleWords = ["UNFOLD", "YOUR", "NEXT", "STORY."];

    return (
        <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-primary pt-16">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    style={{ y: y1 }}
                    className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"
                />
                <motion.div
                    style={{ y: y2 }}
                    className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]"
                />

                {/* Animated Particles/Shapes */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                        className="absolute hidden lg:block"
                        style={{
                            left: `${15 * (i + 1)}%`,
                            top: `${20 * (i % 3 + 1)}%`,
                        }}
                    >
                        <Star className="w-4 h-4 text-indigo-300 fill-current" />
                    </motion.div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="flex justify-center lg:justify-start">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-indigo-200/50 text-indigo-600 text-sm font-bold mb-8"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>{user ? `Welcome back, ${user.name.split(' ')[0]}!` : "New Arrivals 2026"}</span>
                            </motion.div>
                        </div>

                        <div className="mb-8 text-center lg:text-left">
                            {titleWords.map((word, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 0.4 + (i * 0.1),
                                        ease: [0.215, 0.61, 0.355, 1]
                                    }}
                                    className={`inline-block text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] mr-3 sm:mr-4 last:mr-0 ${i === 1 || i === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400' : 'text-indigo-950 dark:text-white'}`}
                                >
                                    {word}
                                    {i === 0 && <br />}
                                    {i === 2 && <br />}
                                </motion.span>
                            ))}
                        </div>

                        <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium text-center lg:text-left">
                            Dive into a boundless universe of literature. From classic masterpieces to the latest digital originals.
                        </p>

                        <div className="flex flex-wrap gap-4 sm:gap-5 justify-center lg:justify-start">
                            <motion.div
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                style={{ x: magneticX, y: magneticY }}
                                className="w-full sm:w-auto"
                            >
                                <Link
                                    to="/books"
                                    className="group relative w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base sm:text-lg overflow-hidden transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative flex items-center gap-2">
                                        Explore Library <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            </motion.div>

                            {!user && (
                                <Link
                                    to="/register"
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 glass border border-stone-200 dark:border-stone-800 text-indigo-950 dark:text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-stone-50 dark:hover:bg-stone-900 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                                >
                                    Join Today
                                </Link>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-12">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-stone-900 overflow-hidden bg-stone-100 dark:bg-stone-800">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-stone-400 dark:text-stone-500">
                                <span className="text-indigo-600 dark:text-indigo-400">12,000+</span> active readers this month
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="relative hidden lg:block"
                    >
                        {/* Main Interactive Card */}
                        <motion.div
                            style={{ rotate }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative z-10 w-[450px] aspect-[3/4] rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] group cursor-pointer"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"
                                alt="Featured Book"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            <div className="absolute bottom-10 left-10 right-10">
                                <div className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-4 inline-block">
                                    Editor's Pick
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2 leading-none">The Art of Storytelling</h3>
                                <p className="text-white/60 font-bold uppercase tracking-tighter text-sm">By Marcus Aurelius</p>
                            </div>
                        </motion.div>

                        {/* Floating UI Elements */}
                         <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -left-10 z-20 glass dark:bg-stone-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 w-48"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase leading-none">Library</p>
                                    <p className="text-sm font-black text-indigo-950 dark:text-white leading-none mt-1">50k+ Titles</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "85%" }}
                                    transition={{ duration: 2, delay: 1 }}
                                    className="h-full bg-indigo-600"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-10 -right-10 z-20 bg-indigo-950 p-6 rounded-3xl shadow-2xl border border-indigo-800 w-56"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                    <Sparkles className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Top Rated</p>
                                    <p className="text-lg font-black text-white leading-none mt-1">4.9/5</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-indigo-300/60 mt-3 font-medium">Based on 12k+ community reviews</p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
