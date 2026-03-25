import React from 'react';
import { motion } from 'motion/react';

interface Book3DProps {
    frontImage: string;
    title: string;
    author: string;
}

export default function Book3D({ frontImage, title, author }: Book3DProps) {
    return (
        <div className="flex items-center justify-center p-12 perspective-1000">
            <motion.div
                whileHover={{ rotateY: -30, rotateX: 10 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative w-64 h-96 transition-transform duration-500 transform-style-3d cursor-pointer group"
            >
                {/* Front Cover */}
                <div className="absolute inset-0 z-20 w-full h-full rounded-r-lg shadow-2xl backface-hidden transform-style-3d overflow-hidden">
                    <img
                        src={frontImage}
                        alt={title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                </div>

                {/* Spine */}
                <div className="absolute top-0 -left-6 z-10 w-6 h-full bg-indigo-900 origin-right transform -rotate-y-90 flex items-center justify-center">
                    <div className="rotate-90 text-[10px] text-white/40 font-bold whitespace-nowrap uppercase tracking-widest leading-none">
                        {title} • {author}
                    </div>
                </div>

                {/* Back Cover */}
                <div className="absolute inset-0 z-0 w-full h-full bg-stone-100 dark:bg-stone-800 rounded-lg shadow-lg transform translate-z-[-24px] rounded-r-lg border-l-4 border-indigo-950/20" />

                {/* Pages (Side) */}
                <div className="absolute top-0 right-0 z-10 w-6 h-full bg-stone-50 dark:bg-stone-700 origin-left transform rotate-y-90 translate-x-[24px] flex flex-col justify-around py-4 opacity-80">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="h-[1px] w-full bg-stone-200 dark:bg-stone-600" />
                    ))}
                </div>

                {/* Pages (Top) */}
                <div className="absolute top-0 left-0 z-10 w-full h-6 bg-stone-100 dark:bg-stone-900 origin-bottom transform -rotate-x-90 -translate-y-[24px] flex justify-around px-4">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="w-[1px] h-full bg-stone-200 dark:bg-stone-600" />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
