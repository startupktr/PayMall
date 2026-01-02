import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Wallet, Landmark, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<"CREDIT" | "UPI" | "CASH">("CREDIT");
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { cart, checkout } = useCart();

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cart, navigate]);

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const { items, subtotal, tax, total } = cart;

  const processPayment = async () => {
    setLoading(true);

    try {
      const response = await checkout(paymentMethod);

      if (response.success) {
        setResult(response.order);
        setPaymentComplete(true);

        toast({
          title: "Order placed",
          description: "Your order has been placed successfully!",
        });
      } else {
        toast({
          title: "Checkout failed",
          description: response.error?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-paymall-light">
      <Header title="Payment" showBack={true} />

      <main className="max-w-md mx-auto px-4">
        {!paymentComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            {/* ORDER SUMMARY */}
            <div className="bg-white rounded-xl shadow-soft p-4">
              <h3 className="font-medium text-gray-800">Order Summary</h3>

              <div className="mt-4 space-y-3">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <Separator className="my-2" />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-₹{(subtotal * 0.1).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="mt-6 bg-white rounded-xl shadow-soft p-4">
              <h3 className="font-medium text-gray-800 mb-4">
                Select Payment Method
              </h3>

              <div className="space-y-3">
                {/* CREDIT */}
                <div
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer",
                    paymentMethod === "CREDIT"
                      ? "border-paymall-primary bg-paymall-primary/5"
                      : "border-gray-200"
                  )}
                  onClick={() => setPaymentMethod("CREDIT")}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        paymentMethod === "CREDIT"
                          ? "bg-paymall-primary text-white"
                          : "bg-gray-100"
                      )}
                    >
                      <CreditCard size={20} />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">Credit Card</h4>
                      <p className="text-sm text-gray-500">
                        **** **** **** 1234
                      </p>
                    </div>
                  </div>
                </div>

                {/* UPI */}
                <div
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer",
                    paymentMethod === "UPI"
                      ? "border-paymall-primary bg-paymall-primary/5"
                      : "border-gray-200"
                  )}
                  onClick={() => setPaymentMethod("UPI")}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        paymentMethod === "UPI"
                          ? "bg-paymall-primary text-white"
                          : "bg-gray-100"
                      )}
                    >
                      <Wallet size={20} />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">UPI</h4>
                      <p className="text-sm text-gray-500">user@upi</p>
                    </div>
                  </div>
                </div>

                {/* CASH */}
                <div
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer",
                    paymentMethod === "CASH"
                      ? "border-paymall-primary bg-paymall-primary/5"
                      : "border-gray-200"
                  )}
                  onClick={() => setPaymentMethod("CASH")}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        paymentMethod === "CASH"
                          ? "bg-paymall-primary text-white"
                          : "bg-gray-100"
                      )}
                    >
                      <Landmark size={20} />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">Cash</h4>
                      <p className="text-sm text-gray-500">Pay at checkout</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={processPayment}
                disabled={loading}
                className="w-full mt-6 bg-paymall-primary hover:bg-paymall-primary/90"
              >
                {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </div>
          </motion.div>
        ) : (
          /* SUCCESS SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle size={50} className="text-green-600" />
              </div>

              <h2 className="text-2xl font-bold mt-6">
                Payment Successful!
              </h2>

              <div className="mt-6 py-4 border-y">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-medium">
                    {result.order_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium">
                    ₹{Number(result.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => navigate("/home")}
                  className="bg-paymall-primary hover:bg-paymall-primary/90"
                >
                  Back to Home
                </Button>

                <Button
                  onClick={() => navigate("/transactions")}
                  variant="outline"
                  className="mt-3 w-full"
                >
                  View Order Details
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default PaymentPage;
