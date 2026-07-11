import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from './components/ui/sonner';

// Auth Pages
import Splash from './pages/Auth/Splash';
import Onboarding from './pages/Auth/Onboarding';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Mechanic Pages
import MechanicHome from './pages/Mechanic/Home';
import SearchResults from './pages/Mechanic/SearchResults';
import ProductDetails from './pages/Mechanic/ProductDetails';
import RequestPart from './pages/Mechanic/RequestPart';
import Cart from './pages/Mechanic/Cart';
import Checkout from './pages/Mechanic/Checkout';
import MechanicOrders from './pages/Mechanic/Orders';
import OrderTracking from './pages/Mechanic/OrderTracking';
import Messages from './pages/Shared/Messages';
import Notifications from './pages/Shared/Notifications';
import Profile from './pages/Shared/Profile';

// Seller Pages
import SellerDashboard from './pages/Seller/Dashboard';
import Inventory from './pages/Seller/Inventory';
import SellerOrderDetails from './pages/Seller/OrderDetails';
import ShopProfile from './pages/Seller/ShopProfile';

function AppRoutes() {
  const { isLoggedIn, role } = useApp();

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {role === 'mechanic' ? (
        <>
          <Route path="/" element={<MechanicHome />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/request-part" element={<RequestPart />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MechanicOrders />} />
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
        </>
      ) : (
        <>
          <Route path="/" element={<SellerDashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/order/:id" element={<SellerOrderDetails />} />
          <Route path="/shop-profile" element={<ShopProfile />} />
        </>
      )}
      <Route path="/messages" element={<Messages />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <AppRoutes />
          <Toaster position="top-center" />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
