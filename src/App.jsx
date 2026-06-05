import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import ProductGrid from './components/ProductGrid';
import ProductDetailWrapper from './components/ProductDetailWrapper';
import CartDrawer from './components/CartDrawer';
import NavMenu from './components/NavMenu';
import Checkout from './components/Checkout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ModuleHub from './components/ModuleHub';
import CrmModule from './components/modules/CrmModule';
import ScmModule from './components/modules/ScmModule';
import ErpModule from './components/modules/ErpModule';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

/**
 * Root application shell.
 */
function App() {
  const { isAuthenticated, isStaff } = useAuth();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Global filter state for ProductGrid
  const [currentCategory, setCurrentCategory] = useState('Todas');
  const [currentSearch, setCurrentSearch] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const collectionRef = useRef(null);

  // 1. Disable browser scroll restoration to prevent fighting with our logic
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Resolute Jump-to-Collection Logic
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo === 'collection') {
        const performInstantJump = () => {
            if (collectionRef.current) {
                const headerOffset = 100;
                const elementPosition = collectionRef.current.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // Force the viewport to the grid IMMEDIATELY without any animation
                window.scrollTo(0, offsetPosition);
                
                // Clear the flag
                window.history.replaceState({}, document.title);
                return true;
            }
            return false;
        };

        // Aggressive polling to beat Framer Motion's mounting cycle
        const interval = setInterval(() => {
            if (performInstantJump()) clearInterval(interval);
        }, 10);

        // Safety timeout
        const timeout = setTimeout(() => clearInterval(interval), 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }
  }, [location.pathname, location.state]);

  const scrollToCollection = (category = 'Todas', search = '') => {
    setCurrentCategory(category);
    setCurrentSearch(search);
    
    if (location.pathname !== '/') {
        // Force replace to ensure we clean the history stack
        navigate('/', { 
            state: { scrollTo: 'collection' },
            replace: true 
        });
    } else {
        if (collectionRef.current) {
            const headerOffset = 100;
            const elementPosition = collectionRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    }
  };

  const scrollToTop = () => {
    if (location.pathname !== '/') {
        navigate('/', { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster 
        position="top-center" 
        theme="dark" 
        richColors 
        toastOptions={{
            style: { 
                background: '#0a0a0a', 
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff' 
            },
            classNames: {
                success: '!text-[#a855f7]',
                error: '!text-[#ff4444]',
            }
        }}
      />
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => navigate('/hub')}
        onScrollToCollection={scrollToCollection}
        onScrollToTop={scrollToTop}
      />

      <main className="relative flex-grow">
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Storefront Home with Hero */}
                <Route path="/" element={
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Hero onExploreClick={() => scrollToCollection()} />
                        <div ref={collectionRef} className="pt-24 px-4 max-w-7xl mx-auto min-h-screen">
                            <ProductGrid 
                                onProductClick={handleProductClick} 
                                initialCategory={currentCategory}
                                initialSearch={currentSearch}
                            />
                        </div>
                        <Footer />
                    </motion.div>
                } />

                {/* Product Detail */}
                <Route path="/product/:id" element={
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ProductDetailWrapper onBackToCollection={() => scrollToCollection()} />
                    </motion.div>
                } />

                {/* Authentication */}
                <Route path="/login" element={
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="flex justify-center items-center py-10 pt-32 min-h-[80vh]"
                    >
                        <LoginForm onToggleMode={() => navigate('/register')} onSuccess={(to) => navigate(to || '/')} />
                    </motion.div>
                } />
                <Route path="/register" element={
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="flex justify-center items-center py-10 pt-32 min-h-[80vh]"
                    >
                        <RegisterForm onToggleMode={() => navigate('/login')} onSuccess={(to) => navigate(to || '/')} />
                    </motion.div>
                } />

                <Route path="/checkout" element={
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -10 }}
                        className="pt-20 px-4 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-hidden"
                    >
                        <ProtectedRoute>
                            <Checkout onBack={() => navigate(-1)} onSuccess={() => navigate('/')} />
                        </ProtectedRoute>
                    </motion.div>
                } />

                <Route path="/profile" element={
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="pt-32 px-4 max-w-7xl mx-auto min-h-screen"
                    >
                        <ProtectedRoute>
                            <Profile onBack={() => navigate('/')} />
                        </ProtectedRoute>
                    </motion.div>
                } />

                {/* Post-login module hub (staff only) */}
                <Route path="/hub" element={
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="pt-32 px-4 max-w-7xl mx-auto"
                    >
                        <ProtectedRoute staffOnly>
                        <ModuleHub />
                        </ProtectedRoute>
                    </motion.div>
                } />

                {/* Back-office modules */}
                <Route path="/crm/*" element={
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32 px-4 max-w-7xl mx-auto">
                        <ProtectedRoute staffOnly moduleRequired="crm">
                        <CrmModule />
                        </ProtectedRoute>
                    </motion.div>
                } />
                <Route path="/scm/*" element={
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32 px-4 max-w-7xl mx-auto">
                        <ProtectedRoute staffOnly moduleRequired="scm">
                        <ScmModule />
                        </ProtectedRoute>
                    </motion.div>
                } />
                <Route path="/erp/*" element={
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32 px-4 max-w-7xl mx-auto">
                        <ProtectedRoute staffOnly moduleRequired="erp">
                        <ErpModule />
                        </ProtectedRoute>
                    </motion.div>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => { setIsCartOpen(false); navigate('/checkout'); }}
        onScrollToCollection={scrollToCollection}
      />

      <NavMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onScrollToCollection={scrollToCollection}
      />

      {/* Quick access to the hub for logged-in staff */}
      {isAuthenticated && isStaff && (
        <button
          onClick={() => navigate('/hub')}
          className="fixed bottom-6 right-6 z-50 bg-white text-black px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-105"
        >
          Menu de Modulos
        </button>
      )}
    </div>
  );
}

export default App;
