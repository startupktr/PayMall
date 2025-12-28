import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import {
  ChevronRight,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TransactionsPage = () => {
  const { toast } = useToast();
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(
    null
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState(null);

  useEffect(() => {
    orders();
  }, []);

  const orders = async () => {
    const response = await axios.get(
      `${BASE_URL}/orders/orders/`
    );
    setTransactions(response.data);
  };
  const itemsData = async (id: Number) => {
    const response = await axios.get(
      `${BASE_URL}/orders/orders/${id}`
    );
    setItems(response.data);
  };

  const toggleTransaction = (id: string) => {
    setExpandedTransaction(expandedTransaction === id ? null : id);
  };

  const downloadInvoice = (id: string) => {
    toast({
      title: "Invoice Download",
      description: `Downloading invoice for transaction ${id}`,
    });
  };

  return (
    <div className="pb-20 min-h-screen bg-paymall-light">
      <Header title="Your Transactions" showBack={true} />

      <main className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">Transaction History</h3>

            <div className="relative">
              <Button
                onClick={() => setFilterOpen(!filterOpen)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                Sort by
                {filterOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white shadow-medium rounded-md z-10">
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                      Recent first
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                      Oldest first
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                      Amount (high to low)
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                      Amount (low to high)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {transactions?.map((transaction: any) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl shadow-soft overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    toggleTransaction(transaction.id);
                    if (!expandedTransaction) {
                      itemsData(transaction.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{transaction.mall.name}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(transaction.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        ₹{parseFloat(transaction.total).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">
                          View Details
                        </span>
                        <ChevronRight size={14} className="text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <div
                  className={cn(
                    "bg-gray-50 overflow-hidden transition-all duration-300",
                    expandedTransaction === transaction.id
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium">Order Details</h5>
                      <span className="text-xs bg-paymall-primary/10 text-paymall-primary px-2 py-1 rounded">
                        {transaction.order_number}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      {items?.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="font-medium">
                            ₹{parseFloat(item.total_price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Payment Method</span>
                      <span>{transaction.payment_method}</span>
                    </div>

                    <div className="flex justify-between font-medium mt-3 pt-3 border-t">
                      <span>Total Amount</span>
                      <span>₹{parseFloat(transaction.total).toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => downloadInvoice(transaction.order_number)}
                        className="flex-1 bg-paymall-primary hover:bg-paymall-primary/90 flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        Invoice
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1 border-paymall-primary text-paymall-primary hover:bg-paymall-primary/5 flex items-center justify-center gap-2"
                      >
                        <FileText size={16} />
                        Return
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 mb-4 text-center text-sm text-gray-500">
            Showing {transactions?.length} transactions
          </div>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
};

export default TransactionsPage;
