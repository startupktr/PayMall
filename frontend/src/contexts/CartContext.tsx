import { createContext, useContext, useState, ReactNode } from "react";
import api from "@/api/axios";

interface CartState {
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  count: number;
}

interface CartContextType {
  cart: CartState | null;
  isLoaded: boolean;
  loadCart: () => Promise<void>;
  addToCart: (productId: number, qty?: number) => Promise<void>;
  updateItem: (itemId: number, qty: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
  checkout: (paymentMethod: string) => Promise<{
    success: boolean;
    order?: any;
    error?: any;
  }>;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ Load cart ONLY when explicitly called
  const loadCart = async () => {
    if (isLoaded) return; // prevent duplicate calls

    const res = await api.get("/orders/cart/");
    setCart({
      items: res.data.items,
      subtotal: Number(res.data.subtotal),
      tax: Number(res.data.tax_amount),
      total: Number(res.data.total_amount),
      count: res.data.items.length,
    });
    setIsLoaded(true);
  };

  // 🔥 Optimistic add
  const addToCart = async (productId: number, qty = 1) => {
    await api.post("/orders/cart/add/", { product_id: productId, quantity: qty });
    await refreshCart();
  };

  const updateItem = async (itemId: number, qty: number) => {
    await api.put(`/orders/cart/items/${itemId}/`, { quantity: qty });
    await refreshCart();
  };

  const removeItem = async (itemId: number) => {
    await api.delete(`/orders/cart/items/${itemId}/`);
    await refreshCart();
  };

  const refreshCart = async () => {
    const res = await api.get("/orders/cart/");
    setCart({
      items: res.data.items,
      subtotal: Number(res.data.subtotal),
      tax: Number(res.data.tax_amount),
      total: Number(res.data.total_amount),
      count: res.data.items.length,
    });
  };

  const clearCart = () => {
    setCart(null);
    setIsLoaded(false);
  };

  const checkout = async (paymentMethod: string) => {
    try {
      const res = await api.post("/orders/orders/create/", {
        payment_method: paymentMethod,
      });

      // ✅ clear cart after successful order
      setCart({
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        count: 0,
      });

      setIsLoaded(false); // allow fresh cart later

      return { success: true, order: res.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data,
      };
    }
  };


  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        loadCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
