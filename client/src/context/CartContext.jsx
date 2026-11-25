import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest('/api/cart');
      setCart(data);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart({ productId, material, color, size, quantity }) {
    const data = await apiRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, material, color, size, quantity }),
    });
    setCart(data);
    return data;
  }

  async function updateQuantity(itemId, quantity) {
    const data = await apiRequest(`/api/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    setCart(data);
    return data;
  }

  async function removeItem(itemId) {
    const data = await apiRequest(`/api/cart/${itemId}`, {
      method: 'DELETE',
    });
    setCart(data);
    return data;
  }

  async function clearCart() {
    const data = await apiRequest('/api/cart', { method: 'DELETE' });
    setCart(data);
  }

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
