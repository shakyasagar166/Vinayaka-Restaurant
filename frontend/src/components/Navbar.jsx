import React from 'react';
import { ShoppingBag, MapPin, Sparkles, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onNavigate, currentPage }) {
  const { tableNumber, totalCount, grandTotal, setIsCartOpen, setIsTableModalOpen } = useCart();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-amber-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('menu')}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group select-none min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
                <span className="font-cinzel text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  GM
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="font-cinzel text-sm sm:text-base md:text-lg font-black tracking-wider text-white group-hover:text-amber-400 transition-colors truncate">
                  GARAM MASALA
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  Family
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 tracking-wider uppercase flex items-center gap-1 truncate">
                <span>Restaurant &amp; Dining</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-400 inline shrink-0" />
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            
            {/* Table Number Pill (Clickable to change table) */}
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Change Dining Table"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-none text-[11px] sm:text-xs">
                {tableNumber || 'Table'}
              </span>
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-amber-500/25 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-black shrink-0" />
              <span className="hidden sm:inline font-black">Cart</span>
              {totalCount > 0 && (
                <span className="bg-black text-amber-400 font-black text-[11px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-sm">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Staff / Admin Access Button */}
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all ${
                  currentPage.startsWith('admin')
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                    : 'bg-gray-800/80 hover:bg-gray-700 text-amber-300 border-amber-500/30'
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="p-2 rounded-xl text-gray-400 hover:text-amber-400 hover:bg-gray-800/60 border border-transparent hover:border-amber-500/20 text-xs transition-colors"
                title="Staff / Manager Login"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
