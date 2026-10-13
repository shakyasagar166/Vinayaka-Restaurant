import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Read table from URL params or local storage
  const [tableNumber, setTableNumber] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTable = params.get('table');
    if (urlTable) {
      localStorage.setItem('vr_table', urlTable);
      return urlTable;
    }
    return localStorage.getItem('vr_table') || 'Rooftop-01';
  });

  const [customerName, setCustomerName] = useState(() => localStorage.getItem('vr_cust_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('vr_cust_phone') || '');
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vr_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (tableNumber) localStorage.setItem('vr_table', tableNumber);
  }, [tableNumber]);

  useEffect(() => {
    if (customerName) localStorage.setItem('vr_cust_name', customerName);
  }, [customerName]);

  useEffect(() => {
    if (customerPhone) localStorage.setItem('vr_cust_phone', customerPhone);
  }, [customerPhone]);

  const addToCart = (menuItem, notes = '') => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(ci => ci.menuItem.id === menuItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        if (notes) updated[existingIndex].notes = notes;
        return updated;
      } else {
        return [...prev, { menuItem, quantity: 1, notes }];
      }
    });
  };

  const updateQuantity = (menuItemId, delta) => {
    setCartItems(prev => {
      return prev
        .map(ci => {
          if (ci.menuItem.id === menuItemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean);
    });
  };

  const setItemNotes = (menuItemId, notes) => {
    setCartItems(prev =>
      prev.map(ci => ci.menuItem.id === menuItemId ? { ...ci, notes } : ci)
    );
  };

  const removeFromCart = (menuItemId) => {
    setCartItems(prev => prev.filter(ci => ci.menuItem.id !== menuItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('vr_cart');
  };

  const totalCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  const subtotal = cartItems.reduce((acc, ci) => acc + (ci.menuItem.price * ci.quantity), 0);
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gst;

  return (
    <CartContext.Provider
      value={{
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        cartItems,
        addToCart,
        updateQuantity,
        setItemNotes,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        gst,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        isTableModalOpen,
        setIsTableModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
