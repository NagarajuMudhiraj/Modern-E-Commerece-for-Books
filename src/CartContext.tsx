import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from './types';
import api from './services/api';
import { useAuth } from './AuthContext';
import socket from './services/socket';

interface CartContextType {
  cartItems: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (bookId: number, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;
    try {
      const res = await api.get('/cart');
      setCartItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  useEffect(() => {
    const handleStockUpdate = () => {
      fetchCart();
    };
    socket.on('stock_update', handleStockUpdate);
    return () => {
      socket.off('stock_update', handleStockUpdate);
    };
  }, []);

  const addToCart = async (bookId: number, quantity: number) => {
    await api.post('/cart', { book_id: bookId, quantity });
    await fetchCart();
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    await api.put(`/cart/${cartItemId}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (cartItemId: number) => {
    await api.delete(`/cart/${cartItemId}`);
    await fetchCart();
  };

  const clearCart = () => setCartItems([]);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within CartProvider');
  return context;
};
