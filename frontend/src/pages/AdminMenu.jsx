import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Check, X, Sparkles, Upload, Image as ImageIcon, Camera, Flame, Eye, EyeOff, Search } from 'lucide-react';
import { api } from '../api/api';

// Curated high-res food photo presets for instant 1-click selection
const FOOD_PHOTO_PRESETS = [
  { name: "Paneer Tikka", url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=700&auto=format&fit=crop&q=80" },
  { name: "Dal Makhani", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80" },
  { name: "Paneer Gravy", url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80" },
  { name: "Chicken Tikka", url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=700&auto=format&fit=crop&q=80" },
  { name: "Butter Chicken", url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700&auto=format&fit=crop&q=80" },
  { name: "Dum Biryani", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80" },
  { name: "Garlic Naan", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=700&auto=format&fit=crop&q=80" },
  { name: "Crispy Starters", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80" },
  { name: "Cocktail / Drink", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=700&auto=format&fit=crop&q=80" },
  { name: "Mojito Glass", url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=700&auto=format&fit=crop&q=80" },
  { name: "Brownie Sizzler", url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&auto=format&fit=crop&q=80" },
  { name: "Loaded Fries", url: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=700&auto=format&fit=crop&q=80" },
];

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [photoTab, setPhotoTab] = useState('upload'); // 'upload' | 'preset' | 'url'
  const fileInputRef = useRef(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Rooftop Starters',
    price: '',
    isVeg: true,
    isAvailableToday: true,
    isChefSpecial: false,
    spicyLevel: 1,
    imageUrl: '',
    preparationTimeMinutes: 15
  });

  const loadAllMenu = async () => {
    setLoading(true);
    try {
      const items = await api.getAllMenu();
      setMenuItems(items || []);
    } catch (e) {
      console.error("Error loading menu:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMenu();
    const handleUpdate = () => loadAllMenu();
    window.addEventListener('vinayaka_menu_updated', handleUpdate);
    return () => window.removeEventListener('vinayaka_menu_updated', handleUpdate);
  }, []);

  const handleToggleAvailability = async (item) => {
    const updatedStatus = !item.isAvailableToday;
    try {
      await api.toggleItemAvailability(item.id, updatedStatus);
      setMenuItems(prev =>
        prev.map(it => String(it.id) === String(item.id) ? { ...it, isAvailableToday: updatedStatus } : it)
      );
    } catch (e) {
      alert("Failed to update stock status: " + e.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'Rooftop Starters',
      price: '',
      isVeg: true,
      isAvailableToday: true, // Default In-Stock!
      isChefSpecial: false,
      spicyLevel: 1,
      imageUrl: FOOD_PHOTO_PRESETS[0].url,
      preparationTimeMinutes: 15
    });
    setPhotoTab('upload');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      isVeg: item.isVeg,
      isAvailableToday: item.isAvailableToday !== false,
      isChefSpecial: Boolean(item.isChefSpecial),
      spicyLevel: item.spicyLevel || 1,
      imageUrl: item.imageUrl || '',
      preparationTimeMinutes: item.preparationTimeMinutes || 15
    });
    setPhotoTab('upload');
    setIsModalOpen(true);
  };

  // Client-side image upload & auto compression via Canvas
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 800x800 for optimal fast loading
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id, name) => {
    if (isDeletingId) return;
    if (window.confirm(`Kya aap "${name}" ko menu se delete karna chahte hain?`)) {
      try {
        setIsDeletingId(id);
        await api.deleteMenuItem(id);
        setMenuItems(prev => prev.filter(it => String(it.id) !== String(id)));
        await loadAllMenu();
      } catch (e) {
        alert("Failed to delete dish: " + e.message);
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name || !formData.name.trim()) {
      alert("Kripya dish ka naam darj karein.");
      return;
    }
    if (!formData.price || isNaN(formData.price)) {
      alert("Kripya dish ka sahi daam (price) darj karein.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        preparationTimeMinutes: parseInt(formData.preparationTimeMinutes, 10) || 15,
        spicyLevel: parseInt(formData.spicyLevel, 10) || 1,
        isAvailableToday: Boolean(formData.isAvailableToday)
      };

      if (editingItem) {
        await api.updateMenuItem(editingItem.id, payload);
      } else {
        await api.createMenuItem(payload);
      }

      setIsModalOpen(false);
      await loadAllMenu();
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(menuItems.map(m => m.category)))];

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || (item.category && item.category.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900/90 to-[#0e1322] p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-300">
              Menu &amp; Daily Stock Control ("आज क्या क्या है")
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30">
              Live Sync
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Nayi dish photo ke sath add karein. Jo item aaj kitchen mein nahi hai use ek click mein <strong>"Sold Out"</strong> karein, aur jaise hi available ho <strong>"In Stock"</strong> karein — customer ko turant dikhega!
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 font-black" />
          <span>+ Add New Dish (नई डिश जोड़ें)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-gray-800 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'bg-gray-900/80 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Loading restaurant menu...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-[#0e1322] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-black/70 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-4 px-5">Food Dish (खाना / पेय)</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4 text-center">Status (आज ग्राहक को दिखेगा?)</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                      
                      {/* Dish Info with Photo */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={item.imageUrl || FOOD_PHOTO_PRESETS[0].url}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-800 border border-amber-500/30 shrink-0 shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              {item.isVeg ? (
                                <div className="w-3.5 h-3.5 border-2 border-emerald-500 rounded flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                </div>
                              ) : (
                                <div className="w-3.5 h-3.5 border-2 border-red-500 rounded flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                </div>
                              )}
                              <span>{item.name}</span>
                              {item.isChefSpecial && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-bold border border-amber-500/30">
                                  ⭐ Chef Special
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 line-clamp-1 max-w-sm mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full bg-gray-800/80 text-gray-300 text-[11px] font-medium border border-gray-700">
                          {item.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-black text-amber-400 text-sm whitespace-nowrap">
                        ₹{item.price}
                      </td>

                      {/* Today's Availability Quick Switch */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shadow-sm ${
                            item.isAvailableToday !== false
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30'
                          }`}
                          title="Click to toggle availability"
                        >
                          {item.isAvailableToday !== false ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>In Stock (उपलब्ध है)</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-red-400" />
                              <span>Sold Out (आज खत्म)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 rounded-xl bg-gray-800 hover:bg-amber-500 hover:text-black text-gray-300 transition-colors shadow-sm"
                            title="Edit Dish"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-2 rounded-xl bg-gray-800 hover:bg-red-600 hover:text-white text-gray-400 transition-colors shadow-sm"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Friendly Cards View (Under md) */}
          <div className="block md:hidden space-y-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-[#0e1322] border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={item.imageUrl || FOOD_PHOTO_PRESETS[0].url}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-gray-800 border border-amber-500/30 shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                      {item.isVeg ? (
                        <div className="w-3 h-3 border-2 border-emerald-500 rounded flex items-center justify-center shrink-0">
                          <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                        </div>
                      ) : (
                        <div className="w-3 h-3 border-2 border-red-500 rounded flex items-center justify-center shrink-0">
                          <div className="w-1 h-1 rounded-full bg-red-500"></div>
                        </div>
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="text-amber-400 font-black text-base mt-0.5">
                      ₹{item.price}
                    </div>

                    <div className="text-[11px] text-gray-400 truncate">
                      {item.category}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-amber-500 hover:text-black text-gray-300"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-red-600 hover:text-white text-gray-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Big Touch-Friendly Toggle Button */}
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow active:scale-95 ${
                    item.isAvailableToday !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  }`}
                >
                  {item.isAvailableToday !== false ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>In Stock (उपलब्ध है - ग्राहक को दिखेगा)</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-400" />
                      <span>Sold Out (आज खत्म - ग्राहक को दिखेगा)</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Dish Modal with Direct Photo Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-[#0d121f] border border-amber-500/30 rounded-3xl p-6 text-white shadow-2xl z-10 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4 font-bold" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-amber-400">
                  {editingItem ? 'Edit Dish Details' : 'Add New Dish (नई डिश जोड़ें)'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              
              {/* Photo Upload Section */}
              <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Dish Photo (फोटो अपलोड करें)</span>
                  </label>
                  
                  {/* Photo tabs */}
                  <div className="flex gap-1 bg-gray-900 rounded-lg p-0.5 border border-gray-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPhotoTab('upload')}
                      className={`px-2 py-1 rounded-md font-bold transition-all ${
                        photoTab === 'upload' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoTab('preset')}
                      className={`px-2 py-1 rounded-md font-bold transition-all ${
                        photoTab === 'preset' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ✨ Food Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoTab('url')}
                      className={`px-2 py-1 rounded-md font-bold transition-all ${
                        photoTab === 'url' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🔗 Paste Link
                    </button>
                  </div>
                </div>

                {/* Photo Preview and Action */}
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-900 border-2 border-amber-500/40 shrink-0 shadow-md">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[9px] mt-1">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {photoTab === 'upload' && (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choose Photo / कैमरा या गैलरी से फोटो चुनें</span>
                        </button>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Apne computer ya mobile se seedha food photo select karein.
                        </p>
                      </div>
                    )}

                    {photoTab === 'preset' && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-gray-400 block">Select a popular dish photo:</span>
                        <div className="grid grid-cols-4 gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                          {FOOD_PHOTO_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, imageUrl: preset.url }))}
                              className={`p-1 rounded-lg border text-[10px] truncate transition-all ${
                                formData.imageUrl === preset.url
                                  ? 'bg-amber-500 text-black font-bold border-amber-400'
                                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-amber-500/40'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {photoTab === 'url' && (
                      <div>
                        <input
                          type="url"
                          placeholder="Paste image web URL (https://...)"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dish Name */}
              <div>
                <label className="block text-gray-300 mb-1 font-bold">
                  Dish Name (डिश का नाम) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tandoori Paneer Tikka / Crispy Corn"
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Rooftop Starters">Rooftop Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Breads & Rice">Breads & Rice</option>
                    <option value="Rooftop Mocktails">Rooftop Mocktails</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-bold">
                    Price (₹) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 280"
                    className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 mb-1 font-bold">Description / विवरण</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Food ingredients, preparation style, taste (e.g. charcoal smoked, creamy rich sauce)..."
                  className="w-full bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Spice & Prep Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">Spiciness Level (तीखापन)</label>
                  <select
                    value={formData.spicyLevel}
                    onChange={(e) => setFormData({ ...formData, spicyLevel: parseInt(e.target.value, 10) })}
                    className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={0}>Non-Spicy / Sweet (मिठाई/पेय)</option>
                    <option value={1}>Mild Spicy (कम तीखा) 🌶️</option>
                    <option value={2}>Medium Spicy (मीडियम) 🌶️🌶️</option>
                    <option value={3}>Hot &amp; Fiery (ज़्यादा तीखा) 🌶️🌶️🌶️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-bold">Prep Time (तैयारी समय)</label>
                  <input
                    type="number"
                    value={formData.preparationTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: e.target.value })}
                    placeholder="15 mins"
                    className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Toggles: Pure Veg, Chef Special, In Stock Today */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-gray-800 space-y-3">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Preferences &amp; Daily Availability
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Veg / Non-Veg */}
                  <label className="flex items-center space-x-2.5 cursor-pointer bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                    <span className="font-semibold text-emerald-400">Pure Veg 🌱</span>
                  </label>

                  {/* Chef Special */}
                  <label className="flex items-center space-x-2.5 cursor-pointer bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                    <input
                      type="checkbox"
                      checked={formData.isChefSpecial}
                      onChange={(e) => setFormData({ ...formData, isChefSpecial: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span className="font-semibold text-amber-400">Chef Special ⭐</span>
                  </label>

                  {/* Available Today (In Stock) */}
                  <label className="flex items-center space-x-2.5 cursor-pointer bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/50">
                    <input
                      type="checkbox"
                      checked={formData.isAvailableToday}
                      onChange={(e) => setFormData({ ...formData, isAvailableToday: e.target.checked })}
                      className="accent-emerald-400 w-4 h-4 rounded"
                    />
                    <span className="font-bold text-emerald-300">In Stock (उपलब्ध) ✓</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex justify-end space-x-2.5 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving Dish...' : (editingItem ? 'Save Changes' : 'Create & Publish Dish')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
