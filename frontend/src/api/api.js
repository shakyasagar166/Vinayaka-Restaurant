const DEFAULT_BACKEND_URL = 'https://vinayaka-restaurant-backend.onrender.com';
const rawApiUrl = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '')
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : DEFAULT_BACKEND_URL;
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

// Safe fetch with timeout so offline / slow requests never freeze the UI
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Cross-tab broadcast channel for real-time synchronization across all tabs and windows
let broadcastChannel = null;
let legacyChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('garam_masala_restaurant_channel');
    legacyChannel = new BroadcastChannel('vinayaka_restaurant_channel');
  }
} catch (e) {
  console.warn("BroadcastChannel not available:", e);
}

function broadcastEvent(type, payload) {
  try {
    const msg = { type, payload, timestamp: Date.now() };
    if (broadcastChannel) broadcastChannel.postMessage(msg);
    if (legacyChannel) legacyChannel.postMessage(msg);
  } catch (e) {
    console.warn("Broadcast error:", e);
  }
}

// Helper for authorized headers
function getAuthHeaders() {
  const token = localStorage.getItem('vr_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Clean menu initialization - dishes are added directly by restaurant admin
const FALLBACK_MENU = [];

// Helper to normalize availability properties so 'isAvailableToday' and 'availableToday' are always in sync
export function normalizeItem(item) {
  if (!item) return item;
  const isAvail = (item.isAvailableToday !== undefined)
    ? Boolean(item.isAvailableToday)
    : (item.availableToday !== undefined ? Boolean(item.availableToday) : true);

  return {
    ...item,
    isAvailableToday: isAvail,
    availableToday: isAvail,
    isVeg: (item.isVeg !== undefined) ? Boolean(item.isVeg) : (item.veg !== undefined ? Boolean(item.veg) : true),
    isChefSpecial: (item.isChefSpecial !== undefined) ? Boolean(item.isChefSpecial) : Boolean(item.chefSpecial)
  };
}

const FALLBACK_TABLES = [
  { id: 1, tableNumber: "Rooftop-01", section: "Rooftop Open Air", seatingCapacity: 4, active: true },
  { id: 2, tableNumber: "Rooftop-02", section: "Rooftop Open Air", seatingCapacity: 4, active: true },
  { id: 3, tableNumber: "Rooftop-03", section: "Rooftop Open Air", seatingCapacity: 6, active: true },
  { id: 4, tableNumber: "Rooftop-04", section: "Rooftop Sky Deck", seatingCapacity: 2, active: true },
  { id: 5, tableNumber: "Rooftop-05", section: "Rooftop Sky Deck", seatingCapacity: 4, active: true },
  { id: 6, tableNumber: "Lounge-01", section: "Luxury Lounge", seatingCapacity: 6, active: true },
  { id: 7, tableNumber: "Lounge-VIP-02", section: "VIP Lounge", seatingCapacity: 8, active: true },
  { id: 8, tableNumber: "Table-01", section: "AC Family Dining", seatingCapacity: 4, active: true },
  { id: 9, tableNumber: "Table-02", section: "AC Family Dining", seatingCapacity: 4, active: true },
  { id: 10, tableNumber: "Table-03", section: "AC Family Dining", seatingCapacity: 6, active: true },
];

// Helper to get local stored menu items
function getLocalMenuItems() {
  try {
    const raw = localStorage.getItem('mock_menu');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeItem);
    }
  } catch (e) {
    console.error("Local storage read error:", e);
  }
  return [];
}

function saveLocalMenuItems(items) {
  try {
    const normalized = (items || []).map(normalizeItem);
    localStorage.setItem('mock_menu', JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('vinayaka_menu_updated'));
    broadcastEvent('MENU_UPDATED', normalized);
  } catch (e) {
    console.error("Local storage save error:", e);
  }
}

// Helper to get and save orders in unified local storage
function getLocalOrders() {
  try {
    const raw = localStorage.getItem('mock_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Local storage orders read error:", e);
  }
  return [];
}

function saveLocalOrders(orders) {
  try {
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('vinayaka_orders_updated'));
    broadcastEvent('ORDERS_UPDATED', orders);
  } catch (e) {
    console.error("Local storage orders save error:", e);
  }
}

export const api = {
  // Public Menu Endpoints (Customers) - returns all items with their current isAvailableToday status
  async getAvailableMenu() {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/all`);
      if (res.ok) {
        const serverItems = await res.json();
        if (Array.isArray(serverItems)) {
          const normalized = serverItems.map(normalizeItem);
          localStorage.setItem('mock_menu', JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (e) {
      // Backend not running, fall back to local
    }

    return getLocalMenuItems();
  },

  // Staff / Admin: Get All Menu Items (Includes out of stock)
  async getAllMenu() {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/all`, { headers: getAuthHeaders() });
      if (res.ok) {
        const serverItems = await res.json();
        if (Array.isArray(serverItems)) {
          const normalized = serverItems.map(normalizeItem);
          localStorage.setItem('mock_menu', JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    return getLocalMenuItems();
  },

  // Toggle Item Availability ("Aaj kya kya hai" - In Stock / Sold Out)
  async toggleItemAvailability(id, isAvailableToday) {
    const boolVal = Boolean(isAvailableToday);

    // 1. Update local storage IMMEDIATELY for 0ms latency
    let items = getLocalMenuItems();
    items = items.map(it => String(it.id) === String(id) ? { ...it, isAvailableToday: boolVal, availableToday: boolVal } : it);
    saveLocalMenuItems(items);

    // 2. Broadcast to all other tabs & windows
    broadcastEvent('MENU_ITEM_TOGGLED', { id, isAvailableToday: boolVal, availableToday: boolVal });
    window.dispatchEvent(new CustomEvent('vinayaka_menu_updated'));

    // 3. Sync to backend database
    try {
      const res = await fetch(`${API_BASE_URL}/menu/${id}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          isAvailableToday: boolVal,
          availableToday: boolVal
        })
      });
      if (res.ok) {
        const updated = await res.json();
        const norm = normalizeItem(updated);
        items = getLocalMenuItems().map(it => String(it.id) === String(id) ? norm : it);
        saveLocalMenuItems(items);
        return norm;
      }
    } catch (e) {
      // offline
    }

    return items.find(it => String(it.id) === String(id));
  },

  // Create Menu Item (with photo support) - Single Submission to prevent duplicate entries
  async createMenuItem(data) {
    // 1. First attempt to save directly on server
    try {
      const res = await fetch(`${API_BASE_URL}/menu`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const serverCreated = await res.json();
        let items = getLocalMenuItems().filter(it => String(it.id) !== String(serverCreated.id));
        items.unshift(serverCreated);
        saveLocalMenuItems(items);
        broadcastEvent('MENU_UPDATED', items);
        window.dispatchEvent(new CustomEvent('vinayaka_menu_updated'));
        return serverCreated;
      }
    } catch (e) {
      console.warn("Server unavailable for createMenuItem, saving locally:", e);
    }

    // 2. Offline fallback ONLY if server is unreachable
    const newItem = {
      ...data,
      id: Date.now(),
      isAvailableToday: data.isAvailableToday !== false,
      isChefSpecial: Boolean(data.isChefSpecial),
      isVeg: Boolean(data.isVeg),
      price: Number(data.price) || 0,
      spicyLevel: Number(data.spicyLevel) || 1,
      preparationTimeMinutes: Number(data.preparationTimeMinutes) || 15
    };

    let items = getLocalMenuItems();
    items.unshift(newItem);
    saveLocalMenuItems(items);
    broadcastEvent('MENU_UPDATED', items);
    window.dispatchEvent(new CustomEvent('vinayaka_menu_updated'));

    return newItem;
  },

  // Update Menu Item
  async updateMenuItem(id, data) {
    let items = getLocalMenuItems();
    items = items.map(it => String(it.id) === String(id) ? { ...it, ...data, isAvailableToday: data.isAvailableToday !== false } : it);
    saveLocalMenuItems(items);

    broadcastEvent('MENU_UPDATED', items);
    window.dispatchEvent(new CustomEvent('vinayaka_menu_updated'));

    try {
      const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // offline
    }

    return items.find(it => String(it.id) === String(id));
  },

  // Delete Menu Item
  async deleteMenuItem(id) {
    // Remove from local cache immediately
    let items = getLocalMenuItems();
    items = items.filter(it => String(it.id) !== String(id));
    saveLocalMenuItems(items);

    broadcastEvent('MENU_UPDATED', items);
    window.dispatchEvent(new CustomEvent('vinayaka_menu_updated'));

    try {
      const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        return await res.json().catch(() => ({ success: true }));
      }
    } catch (e) {
      console.warn("Delete request offline fallback:", e);
    }

    return { success: true };
  },

  // Tables
  async getActiveTables() {
    try {
      const res = await fetch(`${API_BASE_URL}/tables/active`);
      if (res.ok) return await res.json();
    } catch (e) {
      // offline
    }
    const local = localStorage.getItem('mock_tables');
    return local ? JSON.parse(local) : FALLBACK_TABLES;
  },

  async getAllTables() {
    try {
      const res = await fetch(`${API_BASE_URL}/tables`, { headers: getAuthHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      // offline
    }
    const local = localStorage.getItem('mock_tables');
    return local ? JSON.parse(local) : FALLBACK_TABLES;
  },

  // Place Order (NO LOGIN NEEDED FOR CUSTOMER) - CRITICAL SYNC
  async placeOrder(orderData) {
    const currentMenu = getLocalMenuItems();
    const uniqueSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const orderNumber = "VR-" + dateStr + "-" + uniqueSuffix;

    // Calculate items & totals with item name and price included
    const preparedItems = orderData.items.map((it, idx) => {
      const itemInfo = currentMenu.find(m => String(m.id) === String(it.menuItemId)) || {};
      const name = it.itemName || itemInfo.name || "Dining Dish";
      const price = Number(it.price || itemInfo.price || 250);
      return {
        id: idx + 1,
        menuItemId: it.menuItemId,
        itemName: name,
        menuItemName: name,
        price: price,
        quantity: Number(it.quantity) || 1,
        subtotal: price * (Number(it.quantity) || 1),
        notes: it.notes || ''
      };
    });

    const totalAmount = preparedItems.reduce((sum, x) => sum + x.subtotal, 0);

    const payloadForServer = {
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone || '',
      orderType: orderData.orderType || 'DINE_IN',
      specialInstructions: orderData.specialInstructions || '',
      items: preparedItems.map(p => ({
        menuItemId: p.menuItemId,
        itemName: p.itemName,
        price: p.price,
        quantity: p.quantity,
        notes: p.notes
      }))
    };

    // 1. Post to backend Spring Boot server
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadForServer)
      }, 10000);
      if (res.ok) {
        const serverOrder = await res.json();
        let updatedOrders = getLocalOrders().filter(o => o.orderNumber !== serverOrder.orderNumber && o.id !== serverOrder.id);
        updatedOrders.unshift(serverOrder);
        saveLocalOrders(updatedOrders);
        broadcastEvent('NEW_ORDER', serverOrder);
        window.dispatchEvent(new CustomEvent('vinayaka_order_placed', { detail: serverOrder }));
        window.dispatchEvent(new CustomEvent('garam_masala_order_placed', { detail: serverOrder }));
        window.dispatchEvent(new CustomEvent('gm_new_order_received', { detail: serverOrder }));
        window.dispatchEvent(new CustomEvent('vinayaka_orders_updated'));
        window.dispatchEvent(new CustomEvent('garam_masala_orders_updated'));
        return serverOrder;
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error("Server rejected order:", res.status, errJson);
      }
    } catch (e) {
      console.warn("Backend not reached for place order, local order saved:", e);
    }

    // 2. Offline Fallback order
    const newOrder = {
      id: Date.now(),
      orderNumber: orderNumber,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone || '',
      orderType: orderData.orderType || 'DINE_IN',
      specialInstructions: orderData.specialInstructions || '',
      status: "PENDING",
      totalAmount: totalAmount,
      items: preparedItems,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const existingOrders = getLocalOrders();
    existingOrders.unshift(newOrder);
    saveLocalOrders(existingOrders);

    broadcastEvent('NEW_ORDER', newOrder);
    window.dispatchEvent(new CustomEvent('vinayaka_order_placed', { detail: newOrder }));
    window.dispatchEvent(new CustomEvent('garam_masala_order_placed', { detail: newOrder }));
    window.dispatchEvent(new CustomEvent('gm_new_order_received', { detail: newOrder }));
    window.dispatchEvent(new CustomEvent('vinayaka_orders_updated'));
    window.dispatchEvent(new CustomEvent('garam_masala_orders_updated'));

    return newOrder;
  },

  // Track Order Status (Customer)
  async trackOrder(orderNumber) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/orders/track/${orderNumber}`, {}, 6000);
      if (res.ok) {
        const serverOrder = await res.json();
        return serverOrder;
      }
    } catch (e) {
      // offline
    }
    const orders = getLocalOrders();
    return orders.find(o => o.orderNumber === orderNumber) || null;
  },

  // Staff: Get All Live Orders (CRITICAL SYNC WITH ADMIN PROFILE)
  async getAllOrders(status = null, table = null) {
    let orders = getLocalOrders();

    try {
      let url = `${API_BASE_URL}/orders`;
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      if (table && table !== 'ALL') params.append('table', table);
      if ([...params].length) url += `?${params.toString()}`;

      const res = await fetchWithTimeout(url, { headers: getAuthHeaders() }, 6000);
      if (res.ok) {
        const serverOrders = await res.json();
        if (Array.isArray(serverOrders)) {
          // Merge with any local orders that might be newer or pending
          const serverIds = new Set(serverOrders.map(o => String(o.orderNumber || o.id)));
          const unsyncedLocal = orders.filter(o => !serverIds.has(String(o.orderNumber || o.id)));
          const merged = [...serverOrders, ...unsyncedLocal];
          localStorage.setItem('mock_orders', JSON.stringify(merged));
          orders = merged;
        }
      }
    } catch (e) {
      // offline
    }

    // Apply filters
    if (status && status !== 'ALL') {
      orders = orders.filter(o => o.status === status);
    }
    if (table && table !== 'ALL') {
      orders = orders.filter(o => o.tableNumber === table);
    }

    return orders;
  },

  // Staff: Update Order Status
  async updateOrderStatus(orderId, newStatus) {
    let orders = getLocalOrders();
    orders = orders.map(o => String(o.id) === String(orderId) ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o);
    saveLocalOrders(orders);

    broadcastEvent('ORDER_STATUS_CHANGED', { orderId, status: newStatus });
    window.dispatchEvent(new CustomEvent('vinayaka_orders_updated'));

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // offline
    }

    return orders.find(o => String(o.id) === String(orderId));
  },

  // Staff: Delete Order Permanently (Supports ID or Order Number)
  async deleteOrder(orderId, orderNumber = null) {
    let orders = getLocalOrders();
    const targetIdStr = orderId != null ? String(orderId).trim() : '';
    const targetNumStr = orderNumber != null ? String(orderNumber).trim() : '';

    orders = orders.filter(o => {
      const oIdStr = o.id != null ? String(o.id).trim() : '';
      const oNumStr = o.orderNumber != null ? String(o.orderNumber).trim() : '';

      const match1 = targetIdStr && (oIdStr === targetIdStr || oNumStr === targetIdStr);
      const match2 = targetNumStr && (oNumStr === targetNumStr || oIdStr === targetNumStr);
      return !(match1 || match2);
    });
    saveLocalOrders(orders);

    broadcastEvent('ORDERS_UPDATED', orders);
    window.dispatchEvent(new CustomEvent('garam_masala_orders_updated'));
    window.dispatchEvent(new CustomEvent('vinayaka_orders_updated'));

    const identifier = targetNumStr || targetIdStr;
    if (identifier) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(identifier)}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) {
          return await res.json().catch(() => ({ success: true }));
        }
      } catch (e) {
        // offline fallback
      }
    }

    return { success: true };
  },

  // Staff: Delete All Cancelled Orders Permanently
  async deleteCancelledOrders() {
    let orders = getLocalOrders();
    const remaining = orders.filter(o => o.status !== 'CANCELLED');
    const deletedCount = orders.length - remaining.length;
    saveLocalOrders(remaining);

    broadcastEvent('ORDERS_UPDATED', remaining);
    window.dispatchEvent(new CustomEvent('garam_masala_orders_updated'));
    window.dispatchEvent(new CustomEvent('vinayaka_orders_updated'));

    try {
      const res = await fetch(`${API_BASE_URL}/orders/cancelled`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // offline fallback
    }

    return { success: true, deletedCount };
  },

  // Staff Login
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('vr_token', data.token);
          localStorage.setItem('vr_user', JSON.stringify(data));
        }
        return data;
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Galat username ya password. (Invalid credentials).');
      }
    } catch (e) {
      if (e.message && e.message.includes('Galat username')) {
        throw e;
      }
      // Offline fallback if server is momentarily unreachable
      if (username === 'garammasala' && password === 'garammasala12') {
        const userObj = {
          token: 'garam-masala-admin-token-2026',
          username: 'garammasala',
          fullName: 'Garam Masala Owner',
          role: 'ADMIN'
        };
        localStorage.setItem('vr_token', userObj.token);
        localStorage.setItem('vr_user', JSON.stringify(userObj));
        return userObj;
      }
      throw new Error('Galat username ya password.');
    }
  },

  // Restaurant & Owner Profile (Admin editable & Customer visible)
  async getRestaurantProfile() {
    try {
      const res = await fetch(`${API_BASE_URL}/restaurant/profile`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('restaurant_profile', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // offline fallback
    }

    const local = localStorage.getItem('restaurant_profile');
    if (local) {
      try { return JSON.parse(local); } catch (err) {}
    }

    return {
      restaurantName: "Garam Masala Family Restaurant",
      tagline: "Asli Swad, Shuddh Masale & Parivarik Mahol",
      ownerName: "Sagar Shakya",
      ownerTitle: "Restaurant Owner & Host",
      aboutStory: "Garam Masala Family Restaurant me aapka hardik swagat hai! Hum apne customers ko shuddh, taaza aur lajawab swad parosne ke liye committed hain. Hamare yahan special tandoori rotiya, dal handi, paneer dishes, crispy chilli potato aur desi chowmein authentic swad me taiyar ki jaati hain.",
      contactPhone: "+91 98765 43210",
      address: "Garam Masala Restaurant, Near Main Market, Ghaziabad",
      openingHours: "11:00 AM - 11:30 PM (Daily)",
      bannerImage: "/images/restaurant-interior.webp"
    };
  },

  async updateRestaurantProfile(profileData) {
    localStorage.setItem('restaurant_profile', JSON.stringify(profileData));
    broadcastEvent('PROFILE_UPDATED', profileData);
    window.dispatchEvent(new CustomEvent('garam_masala_profile_updated', { detail: profileData }));

    try {
      const res = await fetch(`${API_BASE_URL}/restaurant/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem('restaurant_profile', JSON.stringify(updated));
        return updated;
      }
    } catch (e) {
      // offline
    }

    return profileData;
  },

  // Dashboard Stats
  async getStats() {
    const orders = getLocalOrders();
    return {
      totalOrdersToday: orders.length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      preparingOrders: orders.filter(o => o.status === 'PREPARING').length,
      servedOrders: orders.filter(o => o.status === 'SERVED').length,
      completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      totalRevenueToday: orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + (o.totalAmount || 0), 0)
    };
  }
};
