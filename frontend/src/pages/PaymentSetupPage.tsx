
import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { CreditCard, Landmark, Wallet, Check, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Sample payment methods
const initialPaymentMethods = [
  {
    id: 1,
    type: 'card',
    name: 'Credit Card',
    detail: '**** **** **** 1234',
    default: true,
    icon: CreditCard
  },
  {
    id: 2,
    type: 'upi',
    name: 'UPI',
    detail: 'user@upi',
    default: false,
    icon: Wallet
  }
];

const PaymentSetupPage = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMethodType, setNewMethodType] = useState('');
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [upiId, setUpiId] = useState('');
  
  const setDefaultPayment = (id: number) => {
    setPaymentMethods(prevMethods =>
      prevMethods.map(method => ({
        ...method,
        default: method.id === id
      }))
    );
    
    toast({
      title: "Default payment updated",
      description: "Your default payment method has been updated",
    });
  };
  
  const addPaymentMethod = () => {
    // Form validation would be here in a real app
    
    if (newMethodType === 'card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        toast({
          title: "Error",
          description: "Please fill in all card details",
          variant: "destructive",
        });
        return;
      }
      
      const newCard = {
        id: Date.now(),
        type: 'card',
        name: 'Credit Card',
        detail: `**** **** **** ${cardNumber.slice(-4)}`,
        default: paymentMethods.length === 0,
        icon: CreditCard
      };
      
      setPaymentMethods(prev => [...prev, newCard]);
    }
    else if (newMethodType === 'upi') {
      if (!upiId) {
        toast({
          title: "Error",
          description: "Please enter a valid UPI ID",
          variant: "destructive",
        });
        return;
      }
      
      const newUpi = {
        id: Date.now(),
        type: 'upi',
        name: 'UPI',
        detail: upiId,
        default: paymentMethods.length === 0,
        icon: Wallet
      };
      
      setPaymentMethods(prev => [...prev, newUpi]);
    }
    
    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully",
    });
    
    // Reset form fields
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setUpiId('');
    
    setDialogOpen(false);
  };
  
  const deletePaymentMethod = (id: number) => {
    const methodToDelete = paymentMethods.find(method => method.id === id);
    
    if (methodToDelete?.default && paymentMethods.length > 1) {
      // If deleting the default method, make another one default
      const newDefault = paymentMethods.find(method => method.id !== id);
      if (newDefault) {
        setDefaultPayment(newDefault.id);
      }
    }
    
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    
    toast({
      title: "Payment method removed",
      description: "The payment method has been removed successfully",
    });
  };

  return (
    <div className="pb-20 min-h-screen bg-paymall-light">
      <Header title="Payment Methods" showBack={true} />
      
      <main className="max-w-md mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <div className="bg-white rounded-xl shadow-soft p-4">
            <h3 className="font-medium text-gray-800">Your Payment Methods</h3>
            
            <div className="mt-4 space-y-3">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={cn(
                    "border rounded-lg p-4 relative",
                    method.default ? "border-paymall-primary bg-paymall-primary/5" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      method.default ? "bg-paymall-primary text-white" : "bg-gray-100"
                    )}>
                      <method.icon size={20} />
                    </div>
                    
                    <div className="ml-3">
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-gray-500">{method.detail}</p>
                    </div>
                    
                    {method.default && (
                      <span className="absolute right-3 top-3 bg-paymall-primary/10 text-paymall-primary text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-end gap-2">
                    {!method.default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDefaultPayment(method.id)}
                        className="text-xs"
                      >
                        <Check size={14} className="mr-1" /> Set Default
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePaymentMethod(method.id)}
                      className="text-xs text-red-500 border-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} className="mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              {paymentMethods.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No payment methods added yet</p>
                </div>
              )}
              
              <Button
                onClick={() => setDialogOpen(true)}
                className="w-full bg-paymall-primary hover:bg-paymall-primary/90 mt-3"
              >
                Add Payment Method
              </Button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <h4 className="font-medium text-gray-700 mb-2">About Payment Methods</h4>
              <p>
                Payment methods added here will be available during checkout. 
                You can set a default payment method for faster checkout.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          
          {!newMethodType ? (
            <div className="space-y-4 py-4">
              <button
                onClick={() => setNewMethodType('card')}
                className="w-full flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="w-6 h-6 text-paymall-primary" />
                <span className="ml-3 font-medium">Credit/Debit Card</span>
              </button>
              
              <button
                onClick={() => setNewMethodType('upi')}
                className="w-full flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Wallet className="w-6 h-6 text-paymall-primary" />
                <span className="ml-3 font-medium">UPI</span>
              </button>
              
              <button
                onClick={() => setNewMethodType('cash')}
                className="w-full flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Landmark className="w-6 h-6 text-paymall-primary" />
                <span className="ml-3 font-medium">Cash</span>
              </button>
            </div>
          ) : newMethodType === 'card' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Number</label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Name on Card</label>
                <Input
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">CVV</label>
                  <Input
                    placeholder="123"
                    type="password"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setNewMethodType('')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={addPaymentMethod}
                  className="flex-1 bg-paymall-primary hover:bg-paymall-primary/90"
                >
                  Save Card
                </Button>
              </div>
            </div>
          ) : newMethodType === 'upi' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">UPI ID</label>
                <Input
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setNewMethodType('')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={addPaymentMethod}
                  className="flex-1 bg-paymall-primary hover:bg-paymall-primary/90"
                >
                  Link UPI
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h4 className="font-medium text-green-800">Cash Payment Added</h4>
                <p className="text-sm text-green-700 mt-1">
                  You can pay with cash at checkout
                </p>
              </div>
              
              <div className="pt-4 flex">
                <Button
                  onClick={() => {
                    setPaymentMethods(prev => [
                      ...prev,
                      {
                        id: Date.now(),
                        type: 'cash',
                        name: 'Cash',
                        detail: 'Pay at checkout',
                        default: paymentMethods.length === 0,
                        icon: Landmark
                      }
                    ]);
                    
                    setDialogOpen(false);
                    
                    toast({
                      title: "Cash payment added",
                      description: "Cash payment option has been added"
                    });
                  }}
                  className="w-full bg-paymall-primary hover:bg-paymall-primary/90"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Navigation />
    </div>
  );
};

export default PaymentSetupPage;
