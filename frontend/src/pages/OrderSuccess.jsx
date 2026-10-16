import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, ChefHat, UtensilsCrossed, CheckCheck, MapPin, Plus, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { api } from '../api/api';

export default function OrderSuccess({ initialOrder, onOrderMore }) {
  const [order, setOrder] = useState(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll for status updates every 5 seconds
  useEffect(() => {
    if (!order || !order.orderNumber) return;

    const refreshOrderStatus = async () => {
      try {
        const updated = await api.trackOrder(order.orderNumber);
        if (updated) {
          setOrder(updated);
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    };

    let channel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('vinayaka_restaurant_channel');
        channel.onmessage = (e) => {
          if (e.data?.type === 'ORDER_STATUS_CHANGED' || e.data?.type === 'ORDERS_UPDATED') {
            refreshOrderStatus();
          }
        };
      }
    } catch (e) {}

    const handleUpdate = () => refreshOrderStatus();
    window.addEventListener('vinayaka_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const interval = setInterval(refreshOrderStatus, 2000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('vinayaka_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [order?.orderNumber]);

  const handleManualRefresh = async () => {
    if (!order?.orderNumber) return;
    setIsRefreshing(true);
    try {
      const updated = await api.trackOrder(order.orderNumber);
      if (updated) setOrder(updated);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center text-white">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold">No Order Found</h2>
        <p className="text-sm text-gray-400 mt-1">Please place an order from the menu.</p>
        <button
          onClick={onOrderMore}
          className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  // Determine active step index
  const statusSteps = [
    { key: 'PENDING', label: 'Table Verification', hindi: 'Captain Confirmation', icon: Clock },
    { key: 'PREPARING', label: 'In Kitchen', hindi: 'Accepted & Cooking', icon: ChefHat },
    { key: 'SERVED', label: 'Served on Table', hindi: 'Table Par Serve Hua', icon: UtensilsCrossed },
    { key: 'COMPLETED', label: 'Completed', hindi: 'Order Complete / Paid', icon: CheckCheck }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'PREPARING': return 1;
      case 'SERVED': return 2;
      case 'COMPLETED': return 3;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6 text-white pb-24">
      
      {/* Top Banner */}
      <div className="text-center space-y-2 bg-gradient-to-b from-[#111728] to-[#0a0e1a] p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse ${
          order.status === 'CANCELLED' 
            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
            : order.status === 'PENDING'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
        }`}>
          {order.status === 'CANCELLED' ? (
            <AlertCircle className="w-9 h-9" />
          ) : order.status === 'PENDING' ? (
            <Clock className="w-9 h-9 animate-spin" style={{ animationDuration: '6s' }} />
          ) : (
            <CheckCircle2 className="w-9 h-9" />
          )}
        </div>
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-400">
          {order.status === 'CANCELLED'
            ? 'Order Cancelled'
            : order.status === 'PENDING'
            ? 'Order Received (Verification Pending)'
            : 'Order Confirmed & In Kitchen!'}
        </h2>
        <p className="text-gray-300 text-sm">
          {order.status === 'CANCELLED'
            ? 'Yeh order cancel/reject kar diya gaya hai.'
            : order.status === 'PENDING'
            ? 'Aapka order receive hua hai. Waiter table verify karke accept karega!'
            : 'Chef kitchen me aapka taaza khana bana rahe hain.'}
        </p>

        {/* Order Meta details */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 font-mono text-amber-300">
            Order #{order.orderNumber}
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Table: {order.tableNumber}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-gray-300">
            Guest: {order.customerName}
          </span>
        </div>
      </div>

      {/* Verification Notice Card */}
      {order.status === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm space-y-1.5 shadow-lg">
          <div className="font-black text-amber-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Table Verification In Progress...</span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            Aapka order receive ho gaya hai! Restaurant captain Table <strong>{order.tableNumber}</strong> par aakar/dekhkar order 1-click me confirm karega, aur turant kitchen me khana banna shuru ho jayega. Kripya apni table par baithe rahein!
          </p>
        </div>
      )}

      {order.status === 'PREPARING' && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm space-y-1 shadow-lg">
          <div className="font-black text-emerald-400 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-emerald-400" />
            <span>Order Accepted by Captain &amp; In Kitchen!</span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            Captain ne aapki table verify karke order accept kar diya hai. Kitchen me chef aapka khana taaza bana rahe hain!
          </p>
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 text-center text-xs sm:text-sm font-bold space-y-1 shadow-lg">
          <div className="text-base font-black text-red-400">✗ Order Not Confirmed / Cancelled</div>
          <p className="text-xs text-gray-300">
            Yeh order restaurant dwara reject/cancel kar diya gaya hai (Table par koi customer upasthit nahi tha ya order galat tha).
          </p>
        </div>
      )}

      {/* Live Status Stepper */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-amber-300 uppercase tracking-wider">
              Live Order Status
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-400"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {order.status === 'CANCELLED' ? (
          <div className="p-4 rounded-xl bg-red-900/40 border border-red-500 text-red-300 text-center font-bold text-xs">
            Yeh order cancel ho gaya hai. (Order was rejected or cancelled).
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-2 relative">
            {statusSteps.map((step, idx) => {
              const isPastOrCurrent = currentIndex >= idx;
              const isCurrent = currentIndex === idx;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center text-center space-y-1.5">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-amber-500 text-black ring-4 ring-amber-500/20 scale-105 shadow-lg'
                      : isPastOrCurrent
                      ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}>
                    <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className={`block text-[10px] sm:text-xs font-black leading-tight ${
                      isCurrent ? 'text-amber-300' : isPastOrCurrent ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] text-gray-400 mt-0.5">
                      {step.hindi}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Items Breakdown */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-gray-200 border-b border-gray-800 pb-3">
          Order Summary &amp; Bill Breakdown
        </h3>

        <div className="space-y-3">
          {order.items && order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-gray-800/60 last:border-0">
              <div className="flex-1">
                <span className="font-semibold text-white">
                  {item.menuItemName}
                </span>
                <span className="text-gray-400 ml-2">
                  × {item.quantity}
                </span>
                {item.notes && (
                  <p className="text-[11px] text-amber-400/80 italic mt-0.5">
                    Note: "{item.notes}"
                  </p>
                )}
              </div>
              <div className="font-bold text-amber-400 ml-4">
                ₹{item.subtotal || (item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {order.specialInstructions && (
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300">
            <span className="font-semibold text-amber-400">Special Note: </span>
            <span>"{order.specialInstructions}"</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-base sm:text-lg font-bold">
          <span className="text-gray-300">Total Bill Amount:</span>
          <span className="text-amber-400 font-extrabold text-xl">₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Order More Action */}
      <div className="pt-2">
        <button
          onClick={onOrderMore}
          className="w-full py-3.5 px-4 rounded-2xl bg-gray-800/90 hover:bg-gray-800 text-amber-300 hover:text-amber-400 font-bold border border-amber-500/30 flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        >
          <Plus className="w-5 h-5 text-amber-400" />
          <span>Add More Dishes to Table {order.tableNumber}</span>
        </button>
      </div>

    </div>
  );
}
