import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Utensils, Star, MapPin, ChevronRight, RefreshCw, Flame, Clock, Check } from 'lucide-react';
import MenuCard from '../components/MenuCard';
import { useCart } from '../context/CartContext';
import { api } from '../api/api';

const CATEGORY_ICONS = {
  'All': '🌟',
  'Rooftop Starters': '🔥',
  'Main Course': '🍛',
  'Breads & Rice': '🫓',
  'Rooftop Mocktails': '🍹',
  'Desserts': '🍨'
};

export default function CustomerMenu({ onNavigate }) {
  const { tableNumber, setIsTableModalOpen, totalCount, grandTotal, setIsCartOpen } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [chefSpecialOnly, setChefSpecialOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [hideOutOfStock, setHideOutOfStock] = useState(false); // Toggle to hide or show sold out items
  const [loading, setLoading] = useState(true);

  const loadMenu = async () => {
    try {
      const items = await api.getAvailableMenu();
      setMenuItems(items || []);

      const uniqueCats = ['All', ...Array.from(new Set((items || []).map(i => i.category)))];
      setCategories(uniqueCats);
    } catch (e) {
      console.error("Error loading menu:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();

    // 1. Cross-tab BroadcastChannel listener for instant zero-lag updates from Admin
    let channel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('vinayaka_restaurant_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'MENU_UPDATED' || event.data?.type === 'MENU_ITEM_TOGGLED') {
            loadMenu();
          }
        };
      }
    } catch (e) {}

    // 2. Same-window custom event & storage listeners
    const handleUpdate = () => {
      loadMenu();
    };

    window.addEventListener('vinayaka_menu_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    // 3. Fast 2-second background polling
    const timer = setInterval(loadMenu, 2000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('vinayaka_menu_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const isAvail = (item.isAvailableToday !== undefined)
      ? Boolean(item.isAvailableToday)
      : (item.availableToday !== undefined ? Boolean(item.availableToday) : true);
    if (hideOutOfStock && !isAvail) {
      return false;
    }

    // Category filter
    if (activeCategory !== 'All' && item.category !== activeCategory) {
      return false;
    }
    // Veg/Non-Veg filter
    if (vegOnly && !item.isVeg) return false;
    if (nonVegOnly && item.isVeg) return false;
    // Chef Special filter
    if (chefSpecialOnly && !item.isChefSpecial) return false;
    // Spicy filter
    if (spicyOnly && (item.spicyLevel || 0) < 2) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description ? item.description.toLowerCase().includes(q) : false;
      const matchCat = item.category ? item.category.toLowerCase().includes(q) : false;
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const availableCount = menuItems.filter(i => i.isAvailableToday !== false).length;
  const outOfStockCount = menuItems.filter(i => i.isAvailableToday === false).length;

  return (
    <div className="min-h-screen pb-32 pt-3 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">
      
      {/* Luxurious Rooftop Dining Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-[#12182b] via-[#1b233a] to-[#0c101c] p-5 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Contactless Dining &bull; Direct Table Ordering &bull; No Login Required</span>
            </div>
            
            <h1 className="font-cinzel text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-wide">
              Vinayaka Restaurant
            </h1>
            <p className="font-heading italic text-amber-400 text-base sm:text-lg flex items-center gap-2">
              <span>Rooftop Sky Dining &amp; Luxury Lounge</span>
              <span className="text-gray-400 text-xs font-sans not-italic">&bull; Open 12:00 PM - 11:30 PM</span>
            </p>
            <p className="text-gray-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Apni table par baithe baithe order karein. Order seedha kitchen chef ke screen par live pahunchega!
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.9 (500+ Dine-in Reviews)</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{availableCount} Dishes Available Today</span>
              </span>
            </div>
          </div>

          {/* Current Table Card */}
          <div className="shrink-0 bg-black/60 border-2 border-amber-500/40 rounded-3xl p-5 flex items-center justify-between md:flex-col md:items-start gap-3 backdrop-blur-xl shadow-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80 block">
                Seated Dining Table
              </span>
              <div className="text-2xl sm:text-3xl font-cinzel font-black text-amber-300 flex items-center gap-2 mt-0.5">
                <MapPin className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>{tableNumber || "Select Table"}</span>
              </div>
            </div>
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="text-xs px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold border border-amber-500/40 transition-all shadow"
            >
              Change Table
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Search & Filter Controls */}
      <div className="space-y-3 sticky top-16 z-30 pt-2 pb-2 bg-[#080b11]/95 backdrop-blur-xl border-b border-gray-800/80">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food & drinks (Paneer, Dal Makhani, Chicken Tikka, Mojito, Naan, Biryani)..."
            className="w-full bg-[#101524] border border-gray-800 focus:border-amber-400 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Food Dietary Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          
          {/* Veg Only Toggle */}
          <button
            onClick={() => {
              setVegOnly(!vegOnly);
              if (!vegOnly) setNonVegOnly(false);
            }}
            className={`px-3.5 py-2 rounded-2xl border flex items-center gap-1.5 whitespace-nowrap transition-all font-bold ${
              vegOnly
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-lg'
                : 'bg-[#101524] border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <div className="w-3 h-3 border-2 border-emerald-500 rounded flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
            <span>Pure Veg (शाकाहारी)</span>
          </button>

          {/* Non Veg Toggle */}
          <button
            onClick={() => {
              setNonVegOnly(!nonVegOnly);
              if (!nonVegOnly) setVegOnly(false);
            }}
            className={`px-3.5 py-2 rounded-2xl border flex items-center gap-1.5 whitespace-nowrap transition-all font-bold ${
              nonVegOnly
                ? 'bg-red-950/80 border-red-500 text-red-300 ring-2 ring-red-500/40 shadow-lg'
                : 'bg-[#101524] border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <div className="w-3 h-3 border-2 border-red-500 rounded flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            </div>
            <span>Non-Veg (मांसाहारी)</span>
          </button>

          {/* Chef's Signature Toggle */}
          <button
            onClick={() => setChefSpecialOnly(!chefSpecialOnly)}
            className={`px-3.5 py-2 rounded-2xl border flex items-center gap-1.5 whitespace-nowrap transition-all font-bold ${
              chefSpecialOnly
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-lg'
                : 'bg-[#101524] border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Chef's Special ⭐</span>
          </button>

          {/* Spicy Only Toggle */}
          <button
            onClick={() => setSpicyOnly(!spicyOnly)}
            className={`px-3.5 py-2 rounded-2xl border flex items-center gap-1.5 whitespace-nowrap transition-all font-bold ${
              spicyOnly
                ? 'bg-orange-950/80 border-orange-500 text-orange-300 ring-2 ring-orange-500/40 shadow-lg'
                : 'bg-[#101524] border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <span>🌶️ Spicy</span>
          </button>

          {/* Hide/Show Sold Out Items Toggle */}
          {outOfStockCount > 0 && (
            <button
              onClick={() => setHideOutOfStock(!hideOutOfStock)}
              className={`px-3.5 py-2 rounded-2xl border flex items-center gap-1.5 whitespace-nowrap transition-all font-bold ${
                hideOutOfStock
                  ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                  : 'bg-[#101524] border-gray-800 text-gray-400'
              }`}
            >
              <span>{hideOutOfStock ? 'Showing In-Stock Only' : `Show All (${outOfStockCount} Sold Out)`}</span>
            </button>
          )}

          <button
            onClick={loadMenu}
            className="ml-auto p-2.5 rounded-2xl bg-[#101524] border border-gray-800 text-gray-400 hover:text-amber-400 transition-colors shrink-0"
            title="Refresh Dishes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Horizontal Slider */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => {
            const count = cat === 'All'
              ? menuItems.length
              : menuItems.filter(i => i.category === cat).length;
            const isActive = activeCategory === cat;
            const icon = CATEGORY_ICONS[cat] || '🍽️';

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
                    : 'bg-[#101524] text-gray-300 hover:text-white hover:bg-gray-800/80 border border-gray-800'
                }`}
              >
                <span>{icon}</span>
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-black/30 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Dishes Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="rounded-3xl bg-gray-900/50 border border-gray-800 h-72 animate-pulse"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-[#0e1322] rounded-3xl border border-gray-800 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center mx-auto text-3xl">
            🍽️
          </div>
          <h3 className="text-xl font-bold text-gray-200 font-cinzel">Koi Dish Nahi Mili</h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Aapne jo filter ya search lagaya hai usme koi item nahi mila. Filter reset karein.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setVegOnly(false);
              setNonVegOnly(false);
              setChefSpecialOnly(false);
              setSpicyOnly(false);
              setHideOutOfStock(false);
            }}
            className="mt-3 px-5 py-2.5 rounded-2xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-colors shadow-md"
          >
            Show All Menu Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredItems.map(item => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Floating Bottom Cart Bar (Swiggy / Zomato style for mobile & desktop) */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-40 animate-bounce-subtle">
          <div
            onClick={() => setIsCartOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-4 rounded-3xl shadow-2xl shadow-amber-500/35 border-2 border-yellow-300/40 flex items-center justify-between text-black font-black active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-2xl bg-black text-amber-300 flex items-center justify-center text-xs font-black shadow">
                {totalCount}
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-black/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-black inline" />
                  <span>Table {tableNumber}</span>
                </div>
                <div className="text-lg font-black leading-tight">
                  ₹{grandTotal} <span className="text-xs font-medium text-black/70">(Final Bill)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-black bg-black text-amber-300 px-4 py-2.5 rounded-2xl shadow-lg">
              <span>View Order</span>
              <ChevronRight className="w-4 h-4 font-bold" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
