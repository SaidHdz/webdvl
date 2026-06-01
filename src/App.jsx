import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import ProductDetailWrapper from './components/ProductDetailWrapper';
import CartDrawer from './components/CartDrawer';
import NavMenu from './components/NavMenu';
import Checkout from './components/Checkout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import EmployeeManager from './components/EmployeeManager';
import SupplierManager from './components/SupplierManager';
import ClientManager from './components/ClientManager';
import InventoryManager from './components/InventoryManager';
import LogisticsManager from './components/LogisticsManager';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { apiService } from './services/api';

/**
 * Navegación secundaria para el Panel Admin
 */
const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { label: 'General', path: '/admin' },
    { label: 'Inventario', path: '/admin/scm/inventario' },
    { label: 'Logística', path: '/admin/logistica' },
    { label: 'Proveedores', path: '/admin/scm/proveedores' },
    { label: 'Clientes', path: '/admin/crm/clientes' },
    { label: 'Personal', path: '/admin/rh/empleados' },
  ];

  return (
    <nav className="flex flex-wrap justify-center gap-2 bg-dark-card p-2 rounded-3xl md:rounded-full border border-white/5 mb-10 w-full max-w-3xl mx-auto sticky top-24 z-40 shadow-2xl backdrop-blur-md">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
              isActive 
                ? 'bg-neon-lime text-dark-card shadow-[0_0_20px_rgba(219,255,0,0.3)]' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // CACHE GLOBAL DE ADMIN
  const [adminData, setAdminData] = useState({
    metrics: { totalClientes: 0, totalInventario: 0, totalEmpleados: 0 },
    orders: [],
    employees: [],
    suppliers: [],
    clients: [],
    inventory: [],
    logistics: [],
    lastFetched: null
  });
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const navigate = useNavigate();
  // LOCK para evitar bucles de peticiones
  const isFetching = useRef(false);

  // Función única para refrescar todo el sistema administrativo (MEGA-JSON)
  const refreshAdminData = async (force = false) => {
    if (isFetching.current) return;
    
    const now = Date.now();
    if (!force && adminData.lastFetched && (now - adminData.lastFetched < 60000)) {
        return;
    }

    try {
      isFetching.current = true;
      setLoadingAdmin(true);
      
      const [megaRes, suppliersRes, logisticsRes] = await Promise.all([
        apiService.getAdminMegaData().catch(() => null),
        apiService.getSuppliers().catch(() => null),
        apiService.getLogistics().catch(() => null)
      ]);

      setAdminData(prev => {
        let data = Array.isArray(megaRes) ? megaRes[0] : megaRes;
        if (data?.json) data = data.json;

        const rawClients = data?.crm || [];
        const uniqueClients = Array.from(new Map(rawClients.map(c => [c.email || c.nombre, c])).values());

        const rawInventory = data?.scm || [];

        const rawEmployees = data?.rh || [];
        const uniqueEmployees = Array.from(new Map(rawEmployees.map(e => [e.id_empleado || e.nombre, e])).values());

        const rawSuppliers = Array.isArray(suppliersRes) ? suppliersRes : (suppliersRes?.data || []);
        const uniqueSuppliers = Array.from(new Map(rawSuppliers.map(p => [p.id_proveedor || p.nombre_taller, p])).values());

        const rawLogistics = Array.isArray(logisticsRes) ? logisticsRes : (logisticsRes?.data || []);

        const realMetrics = {
            totalClientes: data?.metrics?.totalClientes || uniqueClients.length,
            totalInventario: data?.metrics?.totalInventario || rawInventory.reduce((acc, i) => acc + Number(i.stock_actual || 0), 0),
            totalEmpleados: data?.metrics?.totalEmpleados || uniqueEmployees.length
        };

        return {
          metrics: realMetrics,
          orders: data?.orders || prev.orders,
          employees: uniqueEmployees,
          suppliers: uniqueSuppliers,
          clients: uniqueClients,
          inventory: rawInventory,
          logistics: rawLogistics,
          lastFetched: Date.now()
        };
      });

    } catch (error) {
      console.error('Admin sync error:', error);
      toast.error('Límite de API. Espera un momento.');
    } finally {
      setLoadingAdmin(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    if (isAuthenticated && user.role === 'admin') {
      console.log('Admin ready.');
    }
  }, [isAuthenticated, user]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleOrderSuccess = () => {
    setShowSuccess(true);
    navigate('/');
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleAdminNavigation = () => {
    navigate('/admin');
    setIsMenuOpen(false);
  };

  /**
   * Actualiza el estado de un pedido en la vista local (Frontend Only)
   */
  const handleUpdateLogisticsStatus = (orderId, newStatus) => {
    setAdminData(prev => ({
        ...prev,
        logistics: prev.logistics.map(order => 
            order.id_pedido === orderId ? { ...order, estado: newStatus } : order
        )
    }));
    toast.success(`Pedido ${orderId} actualizado a ${newStatus}`);
  };

  return (
    <div className="min-h-screen pb-10">
      <Toaster position="top-center" richColors theme="dark" />
      <Header 
        onMenuClick={() => setIsMenuOpen(true)} 
        onCartClick={() => setIsCartOpen(true)} 
        onAdminClick={handleAdminNavigation}
      />

      <main className="pt-24 px-4 max-w-7xl mx-auto">
        {showSuccess && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-white text-black px-10 py-5 rounded-[20px] font-syne font-black uppercase tracking-[4px] shadow-[0_0_50px_rgba(255,255,255,0.4)] animate-bounce text-xs flex items-center gap-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Orden Confirmada
          </div>
        )}

        <Routes>
          <Route path="/" element={<ProductGrid onProductClick={handleProductClick} />} />
          <Route path="/product/:id" element={<ProductDetailWrapper />} />
          <Route path="/login" element={
            <div className="flex justify-center items-center py-10">
              <LoginForm onToggleMode={() => navigate('/register')} onSuccess={() => navigate('/')} />
            </div>
          } />
          <Route path="/register" element={
            <div className="flex justify-center items-center py-10">
              <RegisterForm onToggleMode={() => navigate('/login')} onSuccess={() => navigate('/')} />
            </div>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout onBack={() => navigate(-1)} onSuccess={handleOrderSuccess} />
            </ProtectedRoute>
          } />

          {/* Rutas Administrativas */}
          <Route path="/admin/*" element={
            <ProtectedRoute roleRequired="admin">
              <div className="relative pt-6">
                <AdminNav />
                
                <button 
                  onClick={() => refreshAdminData(true)}
                  className="fixed bottom-24 right-6 bg-dark-card border border-white/10 text-white/40 hover:text-accent p-4 rounded-full shadow-2xl z-50 transition-all active:rotate-180 hover:scale-110"
                  title="Refrescar Datos ERP"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path></svg>
                </button>

                <Routes>
                  <Route index element={<AdminDashboard externalData={adminData} loading={loadingAdmin} />} />
                  <Route path="scm/inventario" element={<InventoryManager inventory={adminData.inventory} loading={loadingAdmin} />} />
                  <Route path="logistica" element={
                    <LogisticsManager 
                      orders={adminData.logistics} 
                      loading={loadingAdmin} 
                      onUpdateStatus={handleUpdateLogisticsStatus}
                    />
                  } />
                  <Route path="scm/proveedores" element={<SupplierManager externalData={adminData.suppliers} loading={loadingAdmin} />} />
                  <Route path="crm/clientes" element={<ClientManager externalData={adminData.clients} allOrders={adminData.logistics} loading={loadingAdmin} />} />
                  <Route path="rh/empleados" element={
                    <EmployeeManager 
                      employees={adminData.employees} 
                      loading={loadingAdmin}
                      onCreateEmployee={() => toast.info('Módulo en desarrollo')} 
                    />
                  } />
                </Routes>
              </div>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={handleCheckoutClick}
      />

      <NavMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
           {user.role === 'admin' && (
             <button 
               onClick={handleAdminNavigation}
               className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(109,40,217,0.3)] border border-white/20"
             >
               Panel Admin
             </button>
           )}
           <button 
             onClick={logout}
             className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/50 backdrop-blur-md"
           >
             LOGOUT ({user.name})
           </button>
        </div>
      )}
    </div>
  );
}

export default App;
