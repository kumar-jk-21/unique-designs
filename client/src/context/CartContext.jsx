import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import * as api from '../services/endpoints';
import { getErrorMessage } from '../services/api';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'ud_guest_cart';

function readGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      const guestItems = readGuestCart();
      setItems(guestItems);
      setTotal(0); // guest cart has no live price data until merged/fetched
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.getCart();
      setItems(data.data.items);
      setTotal(data.data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Merge guest cart into DB cart right after login/registration
  useEffect(() => {
    async function mergeIfNeeded() {
      const guestItems = readGuestCart();
      if (user && guestItems.length > 0) {
        try {
          await api.mergeGuestCart(guestItems);
          localStorage.removeItem(GUEST_CART_KEY);
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }
      refreshCart();
    }
    mergeIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addItem = useCallback(
    async (product, quantity = 1, size, color) => {
      if (!user) {
        const guestItems = readGuestCart();
        const existingIndex = guestItems.findIndex(
          (i) => i.productId === product.id && i.size === size && i.color === color
        );
        if (existingIndex > -1) {
          guestItems[existingIndex].quantity += quantity;
        } else {
          guestItems.push({ productId: product.id, quantity, size, color, product });
        }
        writeGuestCart(guestItems);
        setItems(guestItems);
        toast.success('Added to cart');
        return;
      }
      try {
        await api.addToCart({ productId: product.id, quantity, size, color });
        toast.success('Added to cart');
        refreshCart();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    },
    [user, refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (!user) {
        const guestItems = readGuestCart().map((i) =>
          i.productId === itemId ? { ...i, quantity } : i
        );
        writeGuestCart(guestItems);
        setItems(guestItems);
        return;
      }
      try {
        await api.updateCartItem(itemId, quantity);
        refreshCart();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    },
    [user, refreshCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!user) {
        const guestItems = readGuestCart().filter((i) => i.productId !== itemId);
        writeGuestCart(guestItems);
        setItems(guestItems);
        return;
      }
      try {
        await api.removeCartItem(itemId);
        toast.success('Item removed');
        refreshCart();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    },
    [user, refreshCart]
  );

  return (
    <CartContext.Provider
      value={{ items, total, loading, addItem, updateQuantity, removeItem, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
