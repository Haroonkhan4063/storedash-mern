import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);
const STORAGE_KEY = 'storedash.cart';

/**
 * @returns {Array<{_id: string, title: string, price: number, imageUrl: string, category: string, stockLevel: number, quantity: number}>}
 */
const readPersistedCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Global cart store.
 *
 * Data flow: product cards dispatch `addToCart`; the drawer and checkout read
 * `items` / `subtotal` and mutate quantities. Each line caches `stockLevel` so
 * the UI can cap quantities, while the server remains the authority and
 * re-validates stock atomically when the order is placed.
 *
 * Access policy: only authenticated users may add items. Guests are shown a
 * notification and redirected to sign-in, and any stale cart contents are
 * discarded when no session exists.
 * @param {{children: import('react').ReactNode}} props
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(readPersistedCart);
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) setItems((current) => (current.length ? [] : current));
  }, [loading, user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const addToCart = (product) => {
      if (loading) return;
      if (!user) {
        toast.info('Please log in to add items to your cart.');
        navigate('/login');
        return;
      }
      setItems((prev) => {
        const existing = prev.find((line) => line._id === product._id);
        if (existing) {
          return prev.map((line) =>
            line._id === product._id ? { ...line, stockLevel: product.stockLevel, quantity: Math.min(line.quantity + 1, product.stockLevel) } : line
          );
        }
        const { _id, title, price, imageUrl, category, stockLevel } = product;
        return [...prev, { _id, title, price, imageUrl, category, stockLevel, quantity: 1 }];
      });
      setIsOpen(true);
    };

    const updateQuantity = (id, quantity) =>
      setItems((prev) =>
        prev.map((line) => (line._id === id ? { ...line, quantity: Math.min(quantity, line.stockLevel) } : line)).filter((line) => line.quantity > 0)
      );

    return {
      items,
      isOpen,
      setIsOpen,
      addToCart,
      updateQuantity,
      removeItem: (id) => setItems((prev) => prev.filter((line) => line._id !== id)),
      clearCart: () => setItems([]),
      itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    };
  }, [items, isOpen, user, loading, toast, navigate]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** @returns {ReturnType<typeof Object>} Cart state and actions. */
export const useCart = () => useContext(CartContext);
