import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Trash2, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBreakup, setShowBreakup] = useState(false);

  const {
    cart,
    isLoaded,
    loadCart,
    updateItem,
    removeItem,
  } = useCart();

  // ✅ Load cart ONLY when CartPage opens
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // ⏳ Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cart...
      </div>
    );
  }

  // 🛒 Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="pb-20 min-h-screen bg-paymall-light">
        <Header title="Your Cart" showBack />
        <main className="max-w-md mx-auto px-4 mt-6">
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
            <p className="mt-2 text-sm text-gray-500">
              Add items by scanning products
            </p>
            <Button
              onClick={() => navigate("/scan")}
              className="mt-6 bg-paymall-primary hover:bg-paymall-primary/90"
            >
              Scan Products
            </Button>
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  const { items, subtotal, tax, total } = cart;

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    await updateItem(itemId, quantity);
  };

  const handleRemoveItem = async (itemId: number) => {
    await removeItem(itemId);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const handleCheckout = () => {
    navigate("/payment");
  };

  return (
    <div className="pb-20 min-h-screen bg-paymall-light">
      <Header title="Your Cart" showBack />

      <main className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow-soft p-4">
            <h3 className="font-medium text-gray-800">
              Cart Items ({items.length})
            </h3>

            <div className="mt-4 space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-4 text-center text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
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
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {showBreakup && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
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
      </main>

      <Navigation />
    </div>
  );
};

export default CartPage;
