import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, UtensilsCrossed, CheckCheck, XCircle, RefreshCw, Bell, Phone, User, MapPin, Sparkles, ShieldAlert, CheckCircle, Trash2, Volume2, VolumeX } from 'lucide-react';
import { api } from '../api/api';
import { playKitchenBell, testKitchenBell, isBellMuted, setBellMuted, checkAndNotifyNewOrders, requestNotificationPermission } from '../utils/soundAlert';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedTable, setSelectedTable] = useState('ALL');
  const [tablesList, setTablesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [bellMuted, setBellMutedState] = useState(isBellMuted());
  const [testStatus, setTestStatus] = useState('');

  const fetchOrders = async () => {
    try {
      const data = await api.getAllOrders(activeStatus, selectedTable);
      setOrders(data || []);

      // Check for new incoming orders across all phones/devices during polling
      const { hasNew, newOrders } = checkAndNotifyNewOrders(data || []);
      if (hasNew && newOrders.length > 0) {
        setNewOrderAlert(newOrders[0]);
        setTimeout(() => setNewOrderAlert(null), 12000);
      }
    } catch (e) {
      console.error("Error fetching orders:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTestBell = async () => {
    setTestStatus('ringing');
    requestNotificationPermission();
    const played = await testKitchenBell();
    setTimeout(() => {
      setTestStatus(played ? 'success' : 'muted');
      setTimeout(() => setTestStatus(''), 3000);
    }, 1200);
  };

  const handleToggleMute = () => {
    const next = !bellMuted;
    setBellMuted(next);
    setBellMutedState(next);
  };

  useEffect(() => {
    api.getActiveTables().then(data => setTablesList(data || []));
  }, []);

  useEffect(() => {
    fetchOrders();

    // 1. Cross-tab BroadcastChannel listener (both channels)
    let channel = null;
    let legacyChannel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('garam_masala_restaurant_channel');
        legacyChannel = new BroadcastChannel('vinayaka_restaurant_channel');
        const handleMsg = (event) => {
          if (event.data?.type === 'NEW_ORDER') {
            playKitchenBell();
            setNewOrderAlert(event.data.payload);
            fetchOrders();
            setTimeout(() => setNewOrderAlert(null), 12000);
          } else if (event.data?.type === 'ORDERS_UPDATED') {
            fetchOrders();
          }
        };
        channel.onmessage = handleMsg;
        legacyChannel.onmessage = handleMsg;
      }
    } catch (e) {}

    // 2. Same-window custom event listeners
    const handleOrderPlaced = (e) => {
      playKitchenBell();
      setNewOrderAlert(e.detail);
      fetchOrders();
      setTimeout(() => setNewOrderAlert(null), 12000);
    };

    const handleNewOrderAlert = (e) => {
      setNewOrderAlert(e.detail);
      fetchOrders();
      setTimeout(() => setNewOrderAlert(null), 12000);
    };

    const handleOrdersUpdated = () => {
      fetchOrders();
    };

    const handleMuteChanged = (e) => {
      setBellMutedState(e.detail?.muted);
    };

    window.addEventListener('garam_masala_order_placed', handleOrderPlaced);
    window.addEventListener('vinayaka_order_placed', handleOrderPlaced);
    window.addEventListener('gm_new_order_received', handleNewOrderAlert);
    window.addEventListener('garam_masala_orders_updated', handleOrdersUpdated);
    window.addEventListener('vinayaka_orders_updated', handleOrdersUpdated);
    window.addEventListener('gm_bell_mute_changed', handleMuteChanged);
    window.addEventListener('storage', handleOrdersUpdated);

    // 3. Fast 2-second polling interval for bulletproof live sync across devices
    const timer = setInterval(fetchOrders, 2000);

    return () => {
      if (channel) channel.close();
      if (legacyChannel) legacyChannel.close();
      window.removeEventListener('garam_masala_order_placed', handleOrderPlaced);
      window.removeEventListener('vinayaka_order_placed', handleOrderPlaced);
      window.removeEventListener('gm_new_order_received', handleNewOrderAlert);
      window.removeEventListener('garam_masala_orders_updated', handleOrdersUpdated);
      window.removeEventListener('vinayaka_orders_updated', handleOrdersUpdated);
      window.removeEventListener('gm_bell_mute_changed', handleMuteChanged);
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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Kya aap sach me is order ko permanently delete karna chahte hain?")) {
      return;
    }
    try {
      await api.deleteOrder(orderId);
      fetchOrders();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleDeleteAllCancelled = async () => {
    if (!window.confirm(`Kya aap sach me sabhi (${cancelledCount}) cancelled orders ko permanently delete karna chahte hain?`)) {
      return;
    }
    try {
      await api.deleteCancelledOrders();
      fetchOrders();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Verify Table</span>
          </span>
        );
      case 'PREPARING':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/50">Cooking in Kitchen (Confirmed)</span>;
      case 'SERVED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/50">Served / On Table</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">Completed / Paid</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/50">Rejected / Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Live Incoming Order Alert Banner with 1-Click Captain Confirmation */}
      {newOrderAlert && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-bold flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xl animate-bounce-subtle border-2 border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-black text-amber-300 flex items-center justify-center animate-spin shrink-0" style={{ animationDuration: '3s' }}>
              <Bell className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-2">
                <span>🔔 Naya Order: Table {newOrderAlert.tableNumber}</span>
                <span className="text-[10px] bg-black text-amber-300 px-2 py-0.5 rounded-full font-bold">Verification Needed</span>
              </div>
              <div className="text-xs font-medium text-black/90 mt-0.5">
                Customer: <strong>{newOrderAlert.customerName}</strong> &bull; Bill: <strong>₹{newOrderAlert.totalAmount}</strong> &bull; Order #{newOrderAlert.orderNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={async () => {
                await handleStatusChange(newOrderAlert.id, 'PREPARING');
                setNewOrderAlert(null);
              }}
              className="px-4 py-2 rounded-xl bg-black text-emerald-300 hover:text-emerald-200 text-xs font-black flex items-center gap-1.5 shadow transition-transform active:scale-95"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>1-Click Accept (Send to Kitchen)</span>
            </button>

            <button
              onClick={async () => {
                await handleStatusChange(newOrderAlert.id, 'CANCELLED');
                setNewOrderAlert(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-950 text-red-200 hover:bg-red-900 text-xs font-black flex items-center gap-1.5 shadow transition-transform active:scale-95"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Reject (Fake/Empty)</span>
            </button>

            <button
              onClick={() => setNewOrderAlert(null)}
              className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-black text-xs font-bold"
              title="Close Banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Filters & Refresh Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 sm:p-5 rounded-3xl border border-gray-800 shadow-xl">
        
        {/* Status Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Verify Table', count: pendingCount },
            { id: 'PREPARING', label: 'In Kitchen' },
            { id: 'SERVED', label: 'Served' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled', count: cancelledCount }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setActiveStatus(st.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeStatus === st.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
                  : 'bg-black/40 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>{st.label}</span>
              {st.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                  {st.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table Filter Dropdown, Clear Cancelled & Refresh */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {cancelledCount > 0 && (
            <button
              onClick={handleDeleteAllCancelled}
              className="px-3 py-2 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow shrink-0"
              title="Sabhi cancelled orders ko permanently delete karein"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Clear Cancelled ({cancelledCount})</span>
            </button>
          )}
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

          {/* Kitchen Bell Alert Status & One-Click Test Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/70 p-1.5 px-2.5 sm:px-3 rounded-2xl border border-amber-500/40 shadow-inner shrink-0">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                {!bellMuted && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${bellMuted ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-gray-300 font-bold text-[11px] hidden lg:inline">
                {bellMuted ? 'Bell Muted' : 'Kitchen Bell ON'}
              </span>
            </div>

            <button
              onClick={handleTestBell}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow ${
                testStatus === 'ringing'
                  ? 'bg-amber-400 text-black scale-105 animate-bounce'
                  : testStatus === 'success'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black active:scale-95'
              }`}
              title="Kitchen dining bell chime bajayein aur browser sound unlock karein"
            >
              <Bell className="w-3.5 h-3.5 fill-black" />
              <span>
                {testStatus === 'ringing'
                  ? '🔔 Ringing...'
                  : testStatus === 'success'
                  ? '✓ Bell Ringing!'
                  : 'Test Bell 🛎️'}
              </span>
            </button>

            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-xl border text-xs transition-colors ${
                bellMuted
                  ? 'bg-red-950/80 border-red-700 text-red-300 hover:bg-red-900'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
              }`}
              title={bellMuted ? 'Unmute Bell' : 'Mute Bell'}
            >
              {bellMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

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
                    <div className="col-span-2 space-y-2.5">
                      <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-2.5 text-xs text-amber-300 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                        <div>
                          <strong className="block text-amber-200 uppercase tracking-wider text-[10px]">Captain / Waiter 1-Click Confirmation</strong>
                          <span className="text-[11px] text-gray-300">Check karein Table <strong>{ord.tableNumber}</strong> par customer baitha hai ya nahi.</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleStatusChange(ord.id, 'PREPARING')}
                          className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30 font-black text-xs active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept &amp; Send to Kitchen</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(ord.id, 'CANCELLED')}
                          className="py-3 px-3 rounded-2xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/80 flex items-center justify-center gap-1.5 transition-all font-black text-xs active:scale-95"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject (Fake / Khaali Table)</span>
                        </button>
                      </div>
                    </div>
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
                    <div className="col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-red-950/40 border border-red-500/30">
                      <span className="text-xs text-red-400 font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>Order Rejected / Cancelled</span>
                      </span>
                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 transition-all text-xs font-black shadow active:scale-95 shrink-0"
                        title="Sabhi jagah se permanently delete karein"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanent Delete</span>
                      </button>
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
