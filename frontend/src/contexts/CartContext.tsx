import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext<any | undefined>(undefined);
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0
  });

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartSummary({
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0
      });
    }
  }, [isAuthenticated]);
  
  // Fetch cart items from API
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/orders/cart/`);
      setCartItems(response.data.items);
      
      // Update cart summary
      setCartSummary({
        subtotal: response.data.subtotal,
        tax: response.data.tax_amount,
        total: response.data.total_amount,
        itemCount: response.data.items.length
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data || { message: 'Failed to fetch cart' });
      setLoading(false);
    }
  };
  
  // Add item to cart
  const addToCart = async (productId:number, quantity = 1) => {
    if (!isAuthenticated) {
      setError({ message: 'Please login to add items to cart' });
      return false;
    }
    
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/orders/cart/add/`, { product_id: productId, quantity });
      await fetchCart(); // Refresh cart after adding
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data || { message: 'Failed to add item to cart' });
      setLoading(false);
      return false;
    }
  };
  
  // Update cart item quantity
  const updateCartItem = async (itemId:number, quantity:number) => {
    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/orders/cart/items/${itemId}/`, { quantity });
      await fetchCart(); // Refresh cart after updating
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data || { message: 'Failed to update cart item' });
      setLoading(false);
      return false;
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (itemId:number) => {
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/orders/cart/items/${itemId}/`);
      await fetchCart(); // Refresh cart after removing
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data || { message: 'Failed to remove item from cart' });
      setLoading(false);
      return false;
    }
  };
  
  // Clear entire cart
  const clearCart = async () => {
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/orders/cart/`);
      setCartItems([]);
      setCartSummary({
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0
      });
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data || { message: 'Failed to clear cart' });
      setLoading(false);
      return false;
    }
  };
  
  // Create order from cart
  const checkout = async (paymentMethod:any) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/orders/orders/create/`, { payment_method: paymentMethod });
      
      // Clear cart after successful checkout
      setCartItems([]);
      setCartSummary({
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0
      });
      
      setLoading(false);
      return { success: true, order: response.data };
    } catch (err) {
      setError(err.response?.data || { message: 'Checkout failed' });
      setLoading(false);
      return { success: false, error: err.response?.data };
    }
  };

  const value = {
    cartItems,
    cartSummary,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart: fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};