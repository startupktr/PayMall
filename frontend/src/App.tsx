import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import Login from "@/components/Login";
import HomePage from "@/pages/HomePage";
import ScanPage from "@/pages/ScanPage";
import CartPage from "@/pages/CartPage";
import TransactionsPage from "@/pages/TransactionsPage";
import PaymentSetupPage from "@/pages/PaymentSetupPage";
import PaymentPage from "@/pages/PaymentPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

const App = () => {
  return (
    <React.StrictMode>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
          <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/payment-setup" element={<PaymentSetupPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </CartProvider>
      </AuthProvider>
        </TooltipProvider>
    </React.StrictMode>
  );
};

export default App
