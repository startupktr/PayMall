import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import SplashScreen from "@/components/SplashScreen";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import HomePage from "@/pages/HomePage";
import ScanPage from "@/pages/ScanPage";
import CartPage from "@/pages/CartPage";
import TransactionsPage from "@/pages/TransactionsPage";
import PaymentSetupPage from "@/pages/PaymentSetupPage";
import PaymentPage from "@/pages/PaymentPage";
import NotFound from "@/pages/NotFound";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import { MallProvider } from "@/contexts/MallProvider";
import { LocationProvider } from "@/contexts/LocationProvider";

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <AuthProvider>
        <LocationProvider>
          <MallProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />

                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />

                  <Route path="/home" element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  } />

                  <Route path="/scan" element={
                    <ProtectedRoute>
                      <ScanPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/transactions" element={
                    <ProtectedRoute>
                      <TransactionsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/payment-setup" element={
                    <ProtectedRoute>
                      <PaymentSetupPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/payment" element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  } />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </MallProvider>
        </LocationProvider>
      </AuthProvider>
    </TooltipProvider>
  );
};

export default App;
