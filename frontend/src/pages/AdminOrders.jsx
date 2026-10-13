import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, UtensilsCrossed, CheckCheck, XCircle, RefreshCw, Bell, Phone, User, MapPin, Sparkles } from 'lucide-react';
import { api } from '../api/api';

// Browser synthesizer chime for new incoming kitchen orders
function playOrderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedTable, setSelectedTable] = useState('ALL');
  const [tablesList, setTablesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await api.getAllOrders(activeStatus, selectedTable);
      setOrders(data || []);
    } catch (e) {
      console.error("Error fetching orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getActiveTables().then(data => setTablesList(data || []));
  }, []);

  useEffect(() => {
    fetchOrders();

    // 1. Cross-tab BroadcastChannel listener
    let channel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('vinayaka_restaurant_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_ORDER') {
            playOrderChime();
            setNewOrderAlert(event.data.payload);
            fetchOrders();
            setTimeout(() => setNewOrderAlert(null), 8000);
          } else if (event.data?.type === 'ORDERS_UPDATED') {
            fetchOrders();
          }
        };
      }
    } catch (e) {}

    // 2. Same-window custom event listeners
    const handleOrderPlaced = (e) => {
      playOrderChime();
      setNewOrderAlert(e.detail);
      fetchOrders();
      setTimeout(() => setNewOrderAlert(null), 8000);
    };

    const handleOrdersUpdated = () => {
      fetchOrders();
    };

    window.addEventListener('vinayaka_order_placed', handleOrderPlaced);
    window.addEventListener('vinayaka_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);

    // 3. Fast 2-second polling interval for bulletproof live sync
    const timer = setInterval(fetchOrders, 2000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('vinayaka_order_placed', handleOrderPlaced);
      window.removeEventListener('vinayaka_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
      clearInterval(timer);
    };
  }, [activeStatus, selectedTable]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/50 animate-pulse">New Order / नया</span>;
      case 'PREPARING':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/50">Cooking / बन रहा है</span>;
      case 'SERVED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/50">Served / परोसा गया</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">Paid / पूर्ण</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/50">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Live Incoming Order Alert Banner */}
      {newOrderAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-bold flex items-center justify-between shadow-2xl animate-bounce-subtle">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-amber-300 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
              <Bell className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-wider">
                🔔 Naya Customer Order Aaya Hai! (Table {newOrderAlert.tableNumber})
              </div>
              <div className="text-xs font-medium text-black/80">
                Customer: <strong>{newOrderAlert.customerName}</strong> &bull; Total: <strong>₹{newOrderAlert.totalAmount}</strong> &bull; #{newOrderAlert.orderNumber}
              </div>
            </div>
          </div>

          <button
            onClick={() => setNewOrderAlert(null)}
            className="px-3 py-1.5 rounded-xl bg-black text-amber-300 text-xs font-bold hover:bg-gray-900 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Filters & Refresh Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 sm:p-5 rounded-3xl border border-gray-800 shadow-xl">
        
        {/* Status Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending (New)' },
            { id: 'PREPARING', label: 'In Kitchen' },
            { id: 'SERVED', label: 'Served' },
            { id: 'COMPLETED', label: 'Completed' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setActiveStatus(st.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                activeStatus === st.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
                  : 'bg-black/40 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Table Filter Dropdown & Refresh */}
        <div className="flex items-center gap-3">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="bg-black/60 border border-gray-700 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Dining Tables</option>
            {tablesList.map(t => (
              <option key={t.id || t.tableNumber} value={t.tableNumber}>
                {t.tableNumber} ({t.section})
              </option>
            ))}
          </select>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-2xl bg-black/60 border border-gray-700 text-gray-400 hover:text-amber-400 text-xs flex items-center gap-1.5 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">Refresh</span>
          </button>
        </div>

      </div>

      {/* Orders Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Loading live kitchen orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800/80 p-8 space-y-3">
          <ChefHat className="w-14 h-14 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-200 font-cinzel">Koi Order Nahi Hai Abhi</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Jaise hi customer apni table se QR scan karke order karega, wo yahan <strong>turant live sound alert ke sath show hoga!</strong>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((ord) => (
            <div
              key={ord.id || ord.orderNumber}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all bg-[#0e1322] shadow-xl ${
                ord.status === 'PENDING'
                  ? 'border-amber-500/80 shadow-2xl shadow-amber-500/15 ring-2 ring-amber-500/40 animate-pulse-subtle'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                {/* Header: Table, Order Number, Status */}
                <div className="flex items-start justify-between gap-2 border-b border-gray-800 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-400 font-cinzel font-black text-xl">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>{ord.tableNumber}</span>
                    </div>
                    <span className="font-mono text-[11px] text-gray-400 block mt-0.5">
                      #{ord.orderNumber}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(ord.status)}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-black/50 rounded-2xl p-3 mb-3 text-xs space-y-1.5 border border-gray-800/80">
                  <div className="flex items-center gap-1.5 text-gray-200">
                    <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Customer: <strong className="text-white text-sm">{ord.customerName}</strong></span>
                  </div>
                  {ord.customerPhone && (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{ord.customerPhone}</span>
                    </div>
                  )}
                  {ord.createdAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Clock className="w-3 h-3 text-gray-500 shrink-0" />
                      <span>Time: {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {/* Ordered Items List */}
                <div className="space-y-2 mb-3">
                  <span className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">
                    Ordered Dishes ({ord.items ? ord.items.length : 0}):
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {ord.items && ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs bg-gray-900/70 p-2.5 rounded-xl border border-gray-800">
                        <div>
                          <span className="font-bold text-white text-sm">
                            {item.quantity} × {item.menuItemName}
                          </span>
                          {item.notes && (
                            <p className="text-[11px] text-amber-400 italic mt-0.5">
                              Note: "{item.notes}"
                            </p>
                          )}
                        </div>
                        <span className="text-amber-300 font-bold ml-2 whitespace-nowrap">
                          ₹{item.subtotal || (item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                {ord.specialInstructions && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 mb-3">
                    <strong>Chef Instruction:</strong> "{ord.specialInstructions}"
                  </div>
                )}
              </div>

              {/* Bottom: Total & Status Action Buttons */}
              <div className="pt-3 border-t border-gray-800 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400">Total Bill Amount:</span>
                  <span className="text-amber-400 text-lg font-black">₹{ord.totalAmount}</span>
                </div>

                {/* Workflow Status Action Buttons */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {ord.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(ord.id, 'PREPARING')}
                        className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-md font-black"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Start Cooking</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(ord.id, 'CANCELLED')}
                        className="py-2.5 px-3 rounded-2xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 flex items-center justify-center gap-1.5 transition-colors font-bold"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  {ord.status === 'PREPARING' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(ord.id, 'SERVED')}
                        className="col-span-2 py-2.5 px-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-lg font-black"
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>Mark Food Served to Table {ord.tableNumber}</span>
                      </button>
                    </>
                  )}

                  {ord.status === 'SERVED' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(ord.id, 'COMPLETED')}
                        className="col-span-2 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-lg font-black"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark Bill Paid &amp; Completed</span>
                      </button>
                    </>
                  )}

                  {ord.status === 'COMPLETED' && (
                    <div className="col-span-2 text-center text-xs text-emerald-400 font-bold py-1 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
                      ✓ Order successfully closed &amp; billed
                    </div>
                  )}

                  {ord.status === 'CANCELLED' && (
                    <div className="col-span-2 text-center text-xs text-red-400 font-bold py-1 bg-red-950/30 rounded-xl border border-red-500/30">
                      ✗ Order cancelled
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
