import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { Trash2, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';


const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBreakup, setShowBreakup] = useState(false);
  const {
    cartItems,
    cartSummary: { subtotal, tax, total },
    updateCartItem,
    removeFromCart,
    checkout,
  } = useCart();
  
  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    updateCartItem(itemId, quantity);
  };

  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const handleCheckout = async () => {
    toast({
      title: "Checkout",
      description: "Proceeding to checkout...",
    });
    
    // Navigate to payment page
    navigate('/payment');

  };
  

  return (
    <div className="pb-20 min-h-screen bg-paymall-light">
      <Header title="Your Cart" showBack={true} />
      
      <main className="max-w-md mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          {cartItems.length > 0 ? (
            <div className="bg-white rounded-xl shadow-soft p-4">
              <h3 className="font-medium text-gray-800">Cart Items ({cartItems.length})</h3>
              
              <div className="mt-4 space-y-4">
                {cartItems.map((item:any) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="text-paymall-primary font-semibold mt-1">
                        ₹{parseFloat(item.product.price).toFixed(2)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          
                          <span className="w-4 text-center text-sm">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="font-medium">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-soft p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M10 11V17M14 11V17M3 6H21M19 6V16.2C19 17.8802 19 18.7202 18.673 19.362C18.3854 19.9265 17.9265 20.3854 17.362 20.673C16.7202 21 15.8802 21 14.2 21H9.8C8.11984 21 7.27976 21 6.63803 20.673C6.07354 20.3854 5.6146 19.9265 5.32698 19.362C5 18.7202 5 17.8802 5 16.2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add items by scanning products
              </p>
              <Button
                onClick={() => navigate('/scan')}
                className="mt-6 bg-paymall-primary hover:bg-paymall-primary/90"
              >
                Scan Products
              </Button>
            </div>
          )}
          
          {cartItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Price Summary */}
              <div className="bg-white rounded-xl shadow-soft p-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">Price Details</h3>
                  <button
                    onClick={() => setShowBreakup(!showBreakup)}
                    className="flex items-center text-sm text-paymall-primary"
                  >
                    {showBreakup ? "Hide" : "Show"} Breakup
                    {showBreakup ? (
                      <ChevronUp size={16} className="ml-1" />
                    ) : (
                      <ChevronDown size={16} className="ml-1" />
                    )}
                  </button>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{(parseFloat(subtotal)).toFixed(2)}</span>
                  </div>
                  
                  {showBreakup && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Discount (10%)</span>
                        <span>-₹{(subtotal*0.1).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Tax (18%)</span>
                        <span>₹{parseFloat(tax).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>₹{parseFloat(total).toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-paymall-primary hover:bg-paymall-primary/90"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
      
      <Navigation />
    </div>
  );
};

export default CartPage;
