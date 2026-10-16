import React, { useState, useEffect } from 'react';
import { ChefHat, Utensils, QrCode, LogOut, ExternalLink, IndianRupee, Clock, CheckCircle2, RefreshCw, Sparkles, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminOrders from './AdminOrders';
import AdminMenu from './AdminMenu';
import AdminTablesQr from './AdminTablesQr';
import AdminProfile from './AdminProfile';
import AdminDailySales from './AdminDailySales';
import { api } from '../api/api';

export default function AdminDashboard({ onNavigateToMenu }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'tables'
  const [stats, setStats] = useState({
    totalOrdersToday: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    servedOrders: 0,
    completedOrders: 0,
    totalRevenueToday: 0
  });

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      if (data) setStats(data);
    } catch (e) {
      console.warn("Failed to load stats:", e);
    }
  };

  useEffect(() => {
    loadStats();

    const handleUpdate = () => loadStats();
    window.addEventListener('vinayaka_order_placed', handleUpdate);
    window.addEventListener('vinayaka_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let channel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('vinayaka_restaurant_channel');
        channel.onmessage = () => loadStats();
      }
    } catch (e) {}

    const interval = setInterval(loadStats, 2000);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('vinayaka_order_placed', handleUpdate);
      window.removeEventListener('vinayaka_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-white pb-24">
      
      {/* Top Header & Staff Bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#121829] to-[#0c101c] p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                Garam Masala Admin Portal
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {user?.role || 'Admin'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Logged in as <strong className="text-amber-300">{user?.fullName || 'Owner'}</strong> &bull; Garam Masala Family Restaurant
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateToMenu}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Customer Menu</span>
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Real-time Business Stats KPI Cards */}
      <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Revenue */}
        <div 
          onClick={() => setActiveTab('sales')}
          className="p-4 rounded-2xl bg-[#0f1424] border border-amber-500/30 hover:border-amber-400/80 cursor-pointer flex items-center space-x-3 shadow-lg transition-all hover:scale-[1.02]"
          title="Click to view daily hisaab-kitaab & sales analytics"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">
                Today's Sales
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">Report ↗</span>
            </div>
            <span className="text-lg sm:text-xl font-extrabold text-amber-300">
              ₹{stats.totalRevenueToday}
            </span>
          </div>
        </div>

        {/* Pending Table Verification Orders (Need Captain Action) */}
        <div className="p-4 rounded-2xl bg-[#0f1424] border border-amber-500/40 flex items-center space-x-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">
              Verify Table Orders
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-amber-400">
                {stats.pendingOrders}
              </span>
              {stats.pendingOrders > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                  Action
                </span>
              )}
            </div>
          </div>
        </div>

        {/* In Kitchen Cooking */}
        <div className="p-4 rounded-2xl bg-[#0f1424] border border-blue-500/30 flex items-center space-x-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">
              In Kitchen
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-blue-300">
              {stats.preparingOrders}
            </span>
          </div>
        </div>

        {/* Completed Today */}
        <div className="p-4 rounded-2xl bg-[#0f1424] border border-emerald-500/30 flex items-center space-x-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block">
              Completed Today
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-300">
              {stats.completedOrders}
            </span>
          </div>
        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="no-print flex border-b border-gray-800 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Live Kitchen Orders</span>
          {stats.pendingOrders > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse flex items-center gap-1">
              <span>{stats.pendingOrders} Verify</span>
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'menu'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menu &amp; Stock Control (In Stock / Sold Out)</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sales'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <IndianRupee className="w-4 h-4 text-amber-400" />
          <span>Daily Sales &amp; Cost Hisaab (दैनिक रिपोर्ट)</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'tables'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Table QR Generator &amp; Standees</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>About &amp; Owner Profile</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'menu' && <AdminMenu />}
        {activeTab === 'sales' && <AdminDailySales />}
        {activeTab === 'tables' && <AdminTablesQr />}
        {activeTab === 'profile' && <AdminProfile />}
      </div>

    </div>
  );
}
