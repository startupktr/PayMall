import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define context type
interface Product {
    barcode: string;
    id: number;
    name: string;
    description: string | null;
    price: string;
    image: string;
    category: string | null;
    stockQuantity: number;
}
interface CartItemWithProduct {
    id: number;
    productId: number;
    quantity: number;
    product: Product;
    totalPrice: number;
};
interface CartContextType {
  cartItems: CartItemWithProduct[];
  cartItemsCount: number;
  subtotal: number;
  tax: number;
  total: number;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (itemId: number, quantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartItemsCount: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
  isLoading: false,
  addToCart: () => {},
  updateCartItemQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

// Create a type for the cart API response
interface CartResponse {
  items: CartItemWithProduct[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  
  const userId = "default-user"; // In a real app, this would come from auth

  // Get cart items
  const { data, isLoading } = useQuery<CartResponse>({
    queryKey: ["/api/cart", userId],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => {
      await apiRequest("POST", `/api/cart?userId=${userId}`, {
        productId,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      await apiRequest("PUT", `/api/cart/${itemId}?userId=${userId}`, {
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/cart/${itemId}?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cart?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
    },
  });

  // Add to cart function
  const addToCart = (product: Product, quantity = 1) => {
    addToCartMutation.mutate({ productId: product.id, quantity });
  };

  // Update cart item quantity function
  const updateCartItemQuantity = (itemId: number, quantity: number) => {
    updateCartItemMutation.mutate({ itemId, quantity });
  };

  // Remove from cart function
  const removeFromCart = (itemId: number) => {
    removeFromCartMutation.mutate(itemId);
  };

  // Clear cart function
  const clearCart = () => {
    clearCartMutation.mutate();
  };

  // Provide context values
  const contextValue: CartContextType = {
    cartItems: data?.items || [],
    cartItemsCount: data?.itemCount || 0,
    subtotal: data?.subtotal || 0,
    tax: data?.tax || 0,
    total: data?.total || 0,
    isLoading,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
