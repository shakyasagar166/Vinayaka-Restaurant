import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import TableSelectorModal from './components/TableSelectorModal';
import CustomerMenu from './pages/CustomerMenu';
import OrderSuccess from './pages/OrderSuccess';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('menu'); // 'menu' | 'track' | 'login' | 'admin'
  const [latestOrder, setLatestOrder] = useState(null);

  // If user opens URL directly with ?page=admin or hash #admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam === 'admin') {
      setCurrentPage(isAuthenticated ? 'admin' : 'login');
    }
  }, [isAuthenticated]);

  const handleOrderSuccess = (order) => {
    setLatestOrder(order);
    setCurrentPage('track');
  };

  const handleNavigate = (page) => {
    if (page === 'admin' && !isAuthenticated) {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentPage === 'menu' && (
          <CustomerMenu onNavigate={handleNavigate} />
        )}

        {currentPage === 'track' && (
          <OrderSuccess
            initialOrder={latestOrder}
            onOrderMore={() => handleNavigate('menu')}
          />
        )}

        {currentPage === 'login' && (
          <AdminLogin
            onLoginSuccess={() => handleNavigate('admin')}
            onCancel={() => handleNavigate('menu')}
          />
        )}

        {currentPage === 'admin' && (
          isAuthenticated ? (
            <AdminDashboard onNavigateToMenu={() => handleNavigate('menu')} />
          ) : (
            <AdminLogin
              onLoginSuccess={() => handleNavigate('admin')}
              onCancel={() => handleNavigate('menu')}
            />
          )
        )}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer onOrderSuccess={handleOrderSuccess} />
      <TableSelectorModal />

      {/* Footer */}
      <footer className="no-print py-8 border-t border-gray-900 bg-[#06080e] text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-cinzel text-amber-400 font-bold tracking-widest text-sm uppercase">
            Garam Masala Family Restaurant
          </p>
          <p className="text-gray-400">
            असली स्वाद &bull; शुद्ध मसाले &bull; पारिवारिक माहौल &bull; Authentic Taste
          </p>
          <div className="pt-2 flex justify-center items-center gap-4 text-[11px]">
            <button
              onClick={() => handleNavigate('menu')}
              className="text-gray-400 hover:text-amber-400 transition-colors"
            >
              Dining Menu
            </button>
            <span>&bull;</span>
            <button
              onClick={() => handleNavigate(isAuthenticated ? 'admin' : 'login')}
              className="text-amber-400/90 hover:text-amber-300 font-semibold transition-colors"
            >
              Admin Portal
            </button>
          </div>
          <p className="text-[10px] text-gray-600 pt-3">
            &copy; {new Date().getFullYear()} Garam Masala Restaurant. Direct contactless table ordering.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
