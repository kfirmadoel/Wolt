// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RestaurantDetail from './pages/RestaurantDetail';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <CartProvider>
          <div className="app-root">
            <Navbar />
            <div className="app-main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/restaurant/:id"
                  element={
                    <ProtectedRoute>
                      <RestaurantDetail />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            
            <footer className="wolt-footer">
              <div className="wolt-footer-container">
                <div className="footer-brand">
                  <span className="footer-brand-logo">wolt</span>
                  <span>• Delivery & Takeaway</span>
                </div>
                
              </div>
            </footer>
          </div>
          </CartProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;