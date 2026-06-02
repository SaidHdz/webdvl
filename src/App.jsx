import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import ProductDetailWrapper from './components/ProductDetailWrapper';
import CartDrawer from './components/CartDrawer';
import NavMenu from './components/NavMenu';
import Checkout from './components/Checkout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import ModuleHub from './components/ModuleHub';
import CrmModule from './components/modules/CrmModule';
import ScmModule from './components/modules/ScmModule';
import ErpModule from './components/modules/ErpModule';
import { useAuth } from './context/AuthContext';

/**
 * Root application shell.
 *
 * Routing is organized in three areas:
 * - Public storefront: catalog, product detail, login/register.
 * - Customer checkout (auth required).
 * - Back-office modules CRM / SCM / ERP, each gated by a module permission.
 *
 * After login, staff are routed to the module hub and customers to the store.
 */
function App() {
  const { isAuthenticated, isStaff } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-10">
      <Toaster position="top-center" richColors theme="dark" />
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => navigate('/hub')}
      />

      <main className="pt-24 px-4 max-w-7xl mx-auto">
        <Routes>
          {/* Storefront */}
          <Route path="/" element={<ProductGrid onProductClick={handleProductClick} />} />
          <Route path="/product/:id" element={<ProductDetailWrapper />} />

          {/* Authentication */}
          <Route path="/login" element={
            <div className="flex justify-center items-center py-10">
              <LoginForm onToggleMode={() => navigate('/register')} onSuccess={(to) => navigate(to || '/')} />
            </div>
          } />
          <Route path="/register" element={
            <div className="flex justify-center items-center py-10">
              <RegisterForm onToggleMode={() => navigate('/login')} onSuccess={(to) => navigate(to || '/')} />
            </div>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout onBack={() => navigate(-1)} onSuccess={() => navigate('/')} />
            </ProtectedRoute>
          } />

          {/* Post-login module hub (staff only) */}
          <Route path="/hub" element={
            <ProtectedRoute staffOnly>
              <ModuleHub />
            </ProtectedRoute>
          } />

          {/* Back-office modules, each gated by its permission */}
          <Route path="/crm/*" element={
            <ProtectedRoute staffOnly moduleRequired="crm">
              <CrmModule />
            </ProtectedRoute>
          } />
          <Route path="/scm/*" element={
            <ProtectedRoute staffOnly moduleRequired="scm">
              <ScmModule />
            </ProtectedRoute>
          } />
          <Route path="/erp/*" element={
            <ProtectedRoute staffOnly moduleRequired="erp">
              <ErpModule />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => { setIsCartOpen(false); navigate('/checkout'); }}
      />

      <NavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Quick access to the hub for logged-in staff */}
      {isAuthenticated && isStaff && (
        <button
          onClick={() => navigate('/hub')}
          className="fixed bottom-6 right-6 z-50 bg-neon-lime text-dark-card px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(219,255,0,0.3)] hover:scale-105"
        >
          Menu de Modulos
        </button>
      )}
    </div>
  );
}

export default App;
