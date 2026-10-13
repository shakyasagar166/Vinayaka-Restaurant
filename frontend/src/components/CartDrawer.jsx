import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Utensils, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api/api';

export default function CartDrawer({ onOrderSuccess }) {
  const {
    isCartOpen,
    setIsCartOpen,
    tableNumber,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    gst,
    grandTotal,
    setIsTableModalOpen
  } = useCart();

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCartOpen) return null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName || customerName.trim() === '') {
      setErrorMessage('Kripya apna naam darj karein (Please enter your name).');
      return;
    }

    if (!tableNumber || tableNumber.trim() === '') {
      setErrorMessage('Dining table select karein (Please select your table).');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Aapka cart khaali hai. Kripya menu se item select karein.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        tableNumber: tableNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone ? customerPhone.trim() : '',
        specialInstructions: specialInstructions.trim(),
        items: cartItems.map(ci => ({
          menuItemId: ci.menuItem.id,
          itemName: ci.menuItem.name,
          price: ci.menuItem.price,
          quantity: ci.quantity,
          notes: ci.notes || ''
        }))
      };

      const placedOrder = await api.placeOrder(orderPayload);
      clearCart();
      setIsCartOpen(false);
      onOrderSuccess(placedOrder);
    } catch (err) {
      setErrorMessage(err.message || 'Order place karne mein samasya aayi. Kripya dobara koshish karein.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sheet Container: Bottom Sheet on Mobile, Slide Drawer on Desktop */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-w-full flex">
        <div className="w-full sm:w-screen sm:max-w-md max-h-[92vh] sm:max-h-full rounded-t-3xl sm:rounded-none bg-[#0d121f] border-t sm:border-t-0 sm:border-l border-amber-500/30 text-white shadow-2xl flex flex-col overflow-hidden">
          
          {/* Mobile Bottom Sheet Grab Handle */}
          <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0"></div>

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-black/40 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-cinzel font-black text-amber-300">
                  Your Dining Order
                </h2>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <span>Dining at:</span>
                  <button 
                    onClick={() => { setIsCartOpen(false); setIsTableModalOpen(true); }}
                    className="text-amber-400 font-bold underline hover:text-amber-300"
                  >
                    {tableNumber || "Select Table"}
                  </button>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-900/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Customer Details Form */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Guest Information
                </span>
                <span className="text-[10px] text-gray-400">No login required</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Aapka Naam / Guest Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Mobile Number <span className="text-gray-500 text-[10px]">(Optional - For Receipt)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Items List */}
            {cartItems.length === 0 ? (
              <div className="text-center py-10">
                <Utensils className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-300 text-sm font-bold">Cart is empty</p>
                <p className="text-gray-500 text-xs mt-1">Select delicious dishes from the rooftop menu to place an order.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold">Dishes in Order ({cartItems.length})</span>
                  <button
                    onClick={clearCart}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {cartItems.map((ci) => (
                    <div
                      key={ci.menuItem.id}
                      className="p-3 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-amber-500/30 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {ci.menuItem.isVeg ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                          )}
                          <h4 className="font-bold text-sm text-white truncate">
                            {ci.menuItem.name}
                          </h4>
                        </div>
                        <div className="text-xs text-amber-400 mt-0.5 font-bold">
                          ₹{ci.menuItem.price} × {ci.quantity} = ₹{ci.menuItem.price * ci.quantity}
                        </div>
                        {ci.notes && (
                          <div className="text-[11px] text-gray-400 italic mt-0.5 truncate">
                            Note: "{ci.notes}"
                          </div>
                        )}
                      </div>

                      {/* Quantity Modifier with Touch Friendly Targets */}
                      <div className="flex items-center space-x-1 bg-black/60 border border-gray-700 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(ci.menuItem.id, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-white bg-gray-800/80 active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-amber-300 min-w-[20px] text-center">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(ci.menuItem.id, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-black hover:text-black bg-amber-500 font-bold active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(ci.menuItem.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Special Cooking Request for Chef:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Bring drinks first, make starters extra crispy, extra napkins..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer & Submit Action (Safe Area Spaced for iPhones) */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-800 bg-black/80 space-y-3 pb-safe shrink-0">
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Restaurant GST (5%)</span>
                  <span className="text-white font-semibold">₹{gst}</span>
                </div>
                <div className="flex justify-between text-base font-black text-amber-400 pt-1.5 border-t border-gray-800">
                  <span>Grand Total</span>
                  <span className="text-lg">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-base flex items-center justify-center space-x-2 transition-all shadow-xl shadow-amber-500/30 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Order to Kitchen...</span>
                ) : (
                  <>
                    <span>Place Order (Send to Kitchen)</span>
                    <ArrowRight className="w-5 h-5 font-black" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-gray-400">
                Directly sent to Garam Masala Restaurant's kitchen screen &bull; Table {tableNumber}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
