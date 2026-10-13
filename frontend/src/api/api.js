const rawApiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const API_BASE_URL = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) : '/api';

// Cross-tab broadcast channel for real-time synchronization across all tabs and windows
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('vinayaka_restaurant_channel');
  }
} catch (e) {
  console.warn("BroadcastChannel not available:", e);
}

function broadcastEvent(type, payload) {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
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

// Initial default menu items for Vinayaka Restaurant (Rooftop & Lounge)
const FALLBACK_MENU = [
  {
    id: 1,
    name: "Paneer Angara Tikka",
    description: "Cottage cheese cubes marinated in fiery red spices, smoked over charcoal tandoor with mint glaze.",
    category: "Rooftop Starters",
    price: 320,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 3,
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 15
  },
  {
    id: 2,
    name: "Crispy Chilli Baby Corn",
    description: "Golden fried tender baby corn tossed with bell peppers, spring onions, garlic & sweet-spicy oriental glaze.",
    category: "Rooftop Starters",
    price: 260,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: false,
    spicyLevel: 2,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 12
  },
  {
    id: 3,
    name: "Chicken Afghani Malai Tikka",
    description: "Succulent boneless chicken chunks marinated in rich cashew cream, grated cheese & cardamom.",
    category: "Rooftop Starters",
    price: 380,
    isVeg: false,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 1,
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 18
  },
  {
    id: 4,
    name: "Tandoori Soya Chaap",
    description: "Juicy soya chaap soaked in traditional Amritsari tandoori spices and brushed with butter.",
    category: "Rooftop Starters",
    price: 280,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: false,
    spicyLevel: 2,
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 15
  },
  {
    id: 5,
    name: "Vinayaka Loaded Peri Peri Fries",
    description: "Crispy skin-on potato fries dusted with tangy peri-peri seasoning and drizzled with molten cheddar cheese.",
    category: "Rooftop Starters",
    price: 210,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: false,
    spicyLevel: 2,
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 10
  },
  {
    id: 6,
    name: "Vinayaka Dal Makhani Handi",
    description: "Black lentils slow cooked overnight on low charcoal heat with dairy butter, rich cream & roasted cumin.",
    category: "Main Course",
    price: 290,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 1,
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 15
  },
  {
    id: 7,
    name: "Shahi Paneer Lababdar",
    description: "Soft cottage cheese simmered in a luscious tomato, onion & roasted cashew gravy with grated paneer.",
    category: "Main Course",
    price: 340,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 2,
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 20
  },
  {
    id: 8,
    name: "Clay Oven Butter Chicken Masala",
    description: "Tandoor roasted shredded chicken steeped in silky makhani gravy with fenugreek butter glaze.",
    category: "Main Course",
    price: 420,
    isVeg: false,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 2,
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 20
  },
  {
    id: 9,
    name: "Butter Garlic Chur-Chur Naan",
    description: "Crispy multi-layered tandoori naan stuffed with roasted garlic and herbs, crushed with fresh desi ghee.",
    category: "Breads & Rice",
    price: 90,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 1,
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 10
  },
  {
    id: 10,
    name: "Hyderabadi Dum Biryani (Handi Veg)",
    description: "Fragrant aged basmati rice layered with garden vegetables, saffron milk, fried onions & whole spices.",
    category: "Breads & Rice",
    price: 290,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 2,
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 18
  },
  {
    id: 11,
    name: "Murgh Dum Biryani (Lounge Special)",
    description: "Slow-cooked marinated chicken layered with aromatic rice, mint, kewra water and saffron.",
    category: "Breads & Rice",
    price: 390,
    isVeg: false,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 2,
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 20
  },
  {
    id: 12,
    name: "Blue Lagoon Citrus Curacao",
    description: "Refreshing blend of blue curacao, freshly squeezed lime, mint sprig and sparkling fizz on crushed ice.",
    category: "Rooftop Mocktails",
    price: 180,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 0,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 5
  },
  {
    id: 13,
    name: "Vinayaka Sunset Passion Punch",
    description: "Exotic layered orange, cranberry nectar and passionfruit with citrus wheel and rosemary smoke aroma.",
    category: "Rooftop Mocktails",
    price: 220,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 0,
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 6
  },
  {
    id: 14,
    name: "Classic Mint Mojito Fizz",
    description: "Hand-muddled garden mint leaves, lime chunks, organic cane syrup topped with club soda.",
    category: "Rooftop Mocktails",
    price: 160,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: false,
    spicyLevel: 0,
    imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 5
  },
  {
    id: 15,
    name: "Hot Sizzling Brownie with Vanilla Gelato",
    description: "Warm roasted walnut fudge brownie served on a cast iron sizzler plate with pouring hot Belgian dark chocolate.",
    category: "Desserts",
    price: 250,
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: true,
    spicyLevel: 0,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&auto=format&fit=crop&q=80",
    preparationTimeMinutes: 10
  }
];

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

// Helper to get local stored menu items with fallback
function getLocalMenuItems() {
  try {
    const raw = localStorage.getItem('mock_menu');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Local storage read error:", e);
  }
  localStorage.setItem('mock_menu', JSON.stringify(FALLBACK_MENU));
  return FALLBACK_MENU;
}

function saveLocalMenuItems(items) {
  try {
    localStorage.setItem('mock_menu', JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('vinayaka_menu_updated'));
    broadcastEvent('MENU_UPDATED', items);
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
        if (Array.isArray(serverItems) && serverItems.length > 0) {
          localStorage.setItem('mock_menu', JSON.stringify(serverItems));
          return serverItems;
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
        if (Array.isArray(serverItems) && serverItems.length > 0) {
          localStorage.setItem('mock_menu', JSON.stringify(serverItems));
          return serverItems;
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
    items = items.map(it => String(it.id) === String(id) ? { ...it, isAvailableToday: boolVal } : it);
    saveLocalMenuItems(items);

    // 2. Broadcast to all other tabs & windows
    broadcastEvent('MENU_ITEM_TOGGLED', { id, isAvailableToday: boolVal });
    window.dispatchEvent(new CustomEvent('vinayaka_menu_updated'));

    // 3. Sync to backend database
    try {
      const res = await fetch(`${API_BASE_URL}/menu/${id}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          isAvailableToday: boolVal,
          availableToday: boolVal
        })
      });
      if (res.ok) {
        return await res.json();
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
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadForServer)
      });
      if (res.ok) {
        const serverOrder = await res.json();
        let updatedOrders = getLocalOrders().filter(o => o.orderNumber !== serverOrder.orderNumber && o.id !== serverOrder.id);
        updatedOrders.unshift(serverOrder);
        saveLocalOrders(updatedOrders);
        broadcastEvent('NEW_ORDER', serverOrder);
        window.dispatchEvent(new CustomEvent('vinayaka_order_placed', { detail: serverOrder }));
        window.dispatchEvent(new CustomEvent('vinayaka_orders_updated'));
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
    window.dispatchEvent(new CustomEvent('vinayaka_orders_updated'));

    return newOrder;
  },

  // Track Order Status (Customer)
  async trackOrder(orderNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/track/${orderNumber}`);
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

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const serverOrders = await res.json();
        if (Array.isArray(serverOrders)) {
          localStorage.setItem('mock_orders', JSON.stringify(serverOrders));
          orders = serverOrders;
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

  // Staff Login
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }

    if (username === 'admin' && password === 'vinayaka@123') {
      return {
        token: 'demo-admin-jwt-token-vinayaka-rooftop-2026',
        username: 'admin',
        fullName: 'Vinayaka Manager',
        role: 'ADMIN'
      };
    }
    throw new Error('Galat username ya password. Default: admin / vinayaka@123');
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
