import React, { useState, useEffect, useMemo } from 'react';
import { IndianRupee, Calendar, TrendingUp, ChefHat, CheckCircle2, XCircle, Printer, Filter, Utensils, Clock, MapPin, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../api/api';
import { formatOrderTime } from '../utils/timeUtils';

const getLocalDateString = (d) => {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function AdminDailySales() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('TODAY'); // 'TODAY' | 'YESTERDAY' | '7DAYS' | '30DAYS' | 'CUSTOM' | 'ALL'
  const [customDate, setCustomDate] = useState(() => getLocalDateString(new Date()));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getAllOrders('ALL', 'ALL');
      setOrders(data || []);
    } catch (e) {
      console.error("Error loading orders for sales:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => fetchOrders();
    window.addEventListener('garam_masala_orders_updated', handleUpdate);
    window.addEventListener('vinayaka_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('garam_masala_orders_updated', handleUpdate);
      window.removeEventListener('vinayaka_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filter orders according to date selection
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = getLocalDateString(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return orders.filter(ord => {
      if (!ord.createdAt) return true;
      const orderDate = new Date(ord.createdAt);
      const orderDateStr = getLocalDateString(ord.createdAt);

      switch (dateFilter) {
        case 'TODAY':
          return orderDateStr === todayStr;
        case 'YESTERDAY':
          return orderDateStr === yesterdayStr;
        case '7DAYS':
          return orderDate >= sevenDaysAgo;
        case '30DAYS':
          return orderDate >= thirtyDaysAgo;
        case 'CUSTOM':
          return orderDateStr === customDate;
        case 'ALL':
        default:
          return true;
      }
    });
  }, [orders, dateFilter, customDate]);

  // Completed (billed) orders
  const completedOrders = useMemo(() => {
    return filteredOrders.filter(o => o.status === 'COMPLETED' || o.status === 'SERVED');
  }, [filteredOrders]);

  // Cancelled orders
  const cancelledOrders = useMemo(() => {
    return filteredOrders.filter(o => o.status === 'CANCELLED');
  }, [filteredOrders]);

  // Total Revenue
  const totalRevenue = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [completedOrders]);

  // Cancelled / Saved Amount
  const totalSavedFromFake = useMemo(() => {
    return cancelledOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [cancelledOrders]);

  // Average Order Value (AOV)
  const averageOrderValue = completedOrders.length > 0 
    ? Math.round(totalRevenue / completedOrders.length) 
    : 0;

  // Dishes breakdown (Dish name -> quantity and revenue)
  const dishBreakdown = useMemo(() => {
    const map = {};
    completedOrders.forEach(ord => {
      if (Array.isArray(ord.items)) {
        ord.items.forEach(item => {
          const name = item.menuItemName || 'Dish';
          if (!map[name]) {
            map[name] = { name, quantity: 0, revenue: 0 };
          }
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          map[name].quantity += qty;
          map[name].revenue += item.subtotal ? Number(item.subtotal) : (qty * price);
        });
      }
    });

    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [completedOrders]);

  // Table-wise breakdown
  const tableBreakdown = useMemo(() => {
    const map = {};
    completedOrders.forEach(ord => {
      const table = ord.tableNumber || 'Takeaway/Other';
      if (!map[table]) {
        map[table] = { table, count: 0, revenue: 0 };
      }
      map[table].count += 1;
      map[table].revenue += Number(ord.totalAmount) || 0;
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [completedOrders]);

  // Date-wise history aggregation (for table)
  const dateWiseHistory = useMemo(() => {
    const map = {};
    orders.forEach(ord => {
      const d = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Other';

      if (!map[d]) {
        map[d] = { date: d, rawDate: ord.createdAt, totalOrders: 0, completed: 0, cancelled: 0, revenue: 0 };
      }
      map[d].totalOrders += 1;
      if (ord.status === 'COMPLETED' || ord.status === 'SERVED') {
        map[d].completed += 1;
        map[d].revenue += Number(ord.totalAmount) || 0;
      } else if (ord.status === 'CANCELLED') {
        map[d].cancelled += 1;
      }
    });

    return Object.values(map).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  }, [orders]);

  const handlePrint = () => {
    window.print();
  };

  const getFilterTitle = () => {
    switch (dateFilter) {
      case 'TODAY': return "Today's Report (आज का हिसाब)";
      case 'YESTERDAY': return "Yesterday's Report (कल का हिसाब)";
      case '7DAYS': return "Last 7 Days (पिछले 7 दिन)";
      case '30DAYS': return "Last 30 Days (पिछले 30 दिन)";
      case 'CUSTOM': return `Date Report: ${customDate}`;
      case 'ALL': return "All-Time Complete Sales (कुल हिसाब)";
      default: return "Daily Sales Report";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Date Filter Bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111626] to-[#0c101d] p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-xl sm:text-2xl font-black text-amber-300">
              Daily Sales &amp; Cost Analytics
            </h3>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
              Owner Dashboard
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Garam Masala Restaurant ka daily hisaab-kitaab, total revenue aur dish-wise sales report.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-2xl bg-black/60 border border-gray-700 text-gray-300 hover:text-amber-400 text-xs flex items-center gap-1.5 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-bold hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Daily Closing Summary</span>
          </button>
        </div>
      </div>

      {/* Date Quick Filter Pills */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900/60 p-4 rounded-3xl border border-gray-800 shadow-xl">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'TODAY', label: "Today (आज)" },
            { id: 'YESTERDAY', label: "Yesterday (कल)" },
            { id: '7DAYS', label: "Last 7 Days" },
            { id: '30DAYS', label: "Last 30 Days" },
            { id: 'ALL', label: "All Time" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                dateFilter === f.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
                  : 'bg-black/40 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Custom Date Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">Specific Date:</span>
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setDateFilter('CUSTOM');
            }}
            className="bg-black/70 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Selected Timeframe Indicator */}
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Showing: {getFilterTitle()}</span>
        </span>
        <span className="text-xs text-gray-400">
          Total {filteredOrders.length} Orders in this period
        </span>
      </div>

      {/* 4 Main Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Revenue / Sales */}
        <div className="p-5 rounded-3xl bg-[#0f1424] border border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Sales / Kamai
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-cinzel">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Billed from {completedOrders.length} completed tables
          </p>
        </div>

        {/* Card 2: Completed Orders Count */}
        <div className="p-5 rounded-3xl bg-[#0f1424] border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Orders Completed
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-cinzel">
            {completedOrders.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Dining tables served successfully
          </p>
        </div>

        {/* Card 3: Average Order Value (AOV) */}
        <div className="p-5 rounded-3xl bg-[#0f1424] border border-blue-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Avg Bill Per Table
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-300 font-cinzel">
            ₹{averageOrderValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Per table average spending
          </p>
        </div>

        {/* Card 4: Cancelled / Saved from Pranks */}
        <div className="p-5 rounded-3xl bg-[#0f1424] border border-red-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Pranks / Cancelled
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-400 font-cinzel">
            {cancelledOrders.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            ₹{totalSavedFromFake.toLocaleString('en-IN')} food waste saved
          </p>
        </div>

      </div>

      {/* Two Column Grid: Top Selling Dishes & Table Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Top Selling Dishes */}
        <div className="lg:col-span-7 bg-[#0d1222] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-400" />
              <h4 className="font-cinzel text-base sm:text-lg font-bold text-amber-300">
                Top Selling Dishes ({dishBreakdown.length} Items)
              </h4>
            </div>
            <span className="text-xs text-gray-400">Sorted by plates sold</span>
          </div>

          {dishBreakdown.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Is selected timeframe me koi completed dish order nahi mila.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pr-1">
              {dishBreakdown.map((item, idx) => {
                const maxQty = dishBreakdown[0]?.quantity || 1;
                const percent = Math.round((item.quantity / maxQty) * 100);

                return (
                  <div key={idx} className="bg-black/50 p-3 rounded-2xl border border-gray-800/80 space-y-1.5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-gray-300 text-xs">
                          {item.quantity} plates
                        </span>
                        <span className="font-black text-amber-400 text-sm">
                          ₹{item.revenue}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Progress Bar */}
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Table-wise Business Contribution */}
        <div className="lg:col-span-5 bg-[#0d1222] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h4 className="font-cinzel text-base sm:text-lg font-bold text-amber-300">
                Table Wise Sales
              </h4>
            </div>
            <span className="text-xs text-gray-400">{tableBreakdown.length} Tables</span>
          </div>

          {tableBreakdown.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Koi table sales data nahi hai abhi.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pr-1">
              {tableBreakdown.map((t, idx) => (
                <div key={idx} className="bg-black/50 p-3 rounded-2xl border border-gray-800/80 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold shrink-0">
                      <MapPin className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-black text-white">{t.table}</div>
                      <div className="text-[11px] text-gray-400">{t.count} Orders served</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-amber-400 text-sm sm:text-base font-mono">
                      ₹{t.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Date-by-Date Full Sales History Table */}
      <div className="bg-[#0d1222] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
          <div>
            <h4 className="font-cinzel text-base sm:text-lg font-bold text-amber-300">
              Daily Hisaab-Kitaab History (तारीख अनुसार रिकॉर्ड)
            </h4>
            <p className="text-xs text-gray-400">
              Pichle dino ka complete hisaab aur daily turnover.
            </p>
          </div>
          <span className="text-xs text-gray-400">
            Total {dateWiseHistory.length} Days Recorded
          </span>
        </div>

        {dateWiseHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Abhi koi past history record nahi hai.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Date (तारीख)</th>
                  <th className="py-3 px-3">Total Orders</th>
                  <th className="py-3 px-3">Completed</th>
                  <th className="py-3 px-3">Cancelled / Pranks</th>
                  <th className="py-3 px-3 text-right">Total Revenue (कमाई)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {dateWiseHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white font-sans">
                      {row.date}
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {row.totalOrders}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {row.completed}
                    </td>
                    <td className="py-3 px-3 text-red-400">
                      {row.cancelled}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-400 font-black text-sm sm:text-base">
                      ₹{row.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[10px] font-sans font-bold">
                        Billed &amp; Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
