export default function Footer() {
  return (
    <footer className="bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-400 mb-4">Fort of Knowledge</h3>
            <p className="text-stone-500 dark:text-stone-400 max-w-sm">
              Your gateway to infinite worlds. Discover, collect, and read the best books from around the globe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-stone-500 dark:text-stone-400">
              <li><a href="/books" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Browse Books</a></li>
              <li><a href="/orders" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">My Orders</a></li>
              <li><a href="/cart" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Shopping Cart</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2 text-stone-500 dark:text-stone-400">
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-stone-100 dark:border-stone-800 text-center text-stone-400 dark:text-stone-500 text-sm">
          &copy; {new Date().getFullYear()} Fort of Knowledge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
