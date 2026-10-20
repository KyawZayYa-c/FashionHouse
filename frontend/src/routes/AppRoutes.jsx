import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/Home';
import AdminDashboard from '../pages/AdminDashboard';
// ကျန်တဲ့ Pages တွေကို import လုပ်ပါ

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- User Routes (Public) --- */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<div>Shop Page (Coming Soon)</div>} />
          <Route path="about" element={<div>About Page (Coming Soon)</div>} />
          <Route path="contact" element={<div>Contact Page (Coming Soon)</div>} />
          <Route path="login" element={<div>Login Page (Coming Soon)</div>} />
          <Route path="cart" element={<div>Cart Page (Coming Soon)</div>} />
        </Route>

        {/* --- Admin Routes (Protected - နောက်မှ Auth ချိတ်ရန်) --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> {/* /admin ကို ရောက်ရင် Dashboard ပြမယ် */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<div>Manage Products (Coming Soon)</div>} />
          <Route path="orders" element={<div>Manage Orders (Coming Soon)</div>} />
          <Route path="users" element={<div>Manage Users (Coming Soon)</div>} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<div className="text-center py-20 text-2xl">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;