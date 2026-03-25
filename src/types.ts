export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  points?: number;
  avatarUrl?: string;
  isPrime?: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface Author {
  id: number;
  name: string;
  biography: string;
  imageUrl: string;
}

export interface Book {
  id: number;
  title: string;
  author: Author;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  preview_snippet_url?: string;
  category_id: number;
  category_name?: string;
  topics?: string;
  images?: string[];
}

export interface CartItem {
  id: number;
  user_id: number;
  book_id: number;
  quantity: number;
  title: string;
  price: number;
  image_url: string;
  stock: number;
}

export interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  total_amount: number;
  status: 'Ordered' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  payment_method: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  book_id: number;
  quantity: number;
  price: number;
  title?: string;
  image_url?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  user: User;
  book: Book;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  user: User;
  book: Book;
  created_at: string;
}
