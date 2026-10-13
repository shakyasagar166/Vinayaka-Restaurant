import React, { useState } from 'react';
import { Plus, Minus, Star, Clock, MessageSquareQuote, Check, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MenuCard({ item }) {
  const { cartItems, addToCart, updateQuantity, setItemNotes } = useCart();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const cartEntry = cartItems.find(ci => String(ci.menuItem.id) === String(item.id));
  const quantity = cartEntry ? cartEntry.quantity : 0;
  const currentNote = cartEntry ? cartEntry.notes : '';

  const handleAdd = () => {
    addToCart(item, noteText);
  };

  const handleSaveNote = () => {
    if (quantity > 0) {
      setItemNotes(item.id, noteText);
    } else {
      addToCart(item, noteText);
    }
    setShowNoteInput(false);
  };

  // Render spice peppers
  const renderSpiceMeter = () => {
    const level = item.spicyLevel || 1;
    if (level === 0) return null;
    return (
      <div className="flex items-center gap-0.5 text-[10px] text-amber-400/90 bg-black/60 px-2 py-0.5 rounded-full border border-white/10" title={`Spiciness Level: ${level}/3`}>
        <span className="text-red-400">🌶️</span>
        <span className="font-semibold text-gray-300">
          {level === 1 ? 'Mild' : level === 2 ? 'Medium' : 'Spicy'}
        </span>
      </div>
    );
  };

  const isAvailable = (item.isAvailableToday !== undefined)
    ? Boolean(item.isAvailableToday)
    : (item.availableToday !== undefined ? Boolean(item.availableToday) : true);

  return (
    <div className={`group relative rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between bg-gradient-to-b from-[#111728] via-[#0d121f] to-[#090d16] border border-amber-500/20 shadow-xl ${
      !isAvailable
        ? 'opacity-60 grayscale-[30%]'
        : 'hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5'
    }`}>
      
      {/* Food Photography & Overlay Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-950">
        <img
          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-black/50"></div>

        {/* Top Badges (Veg/Non-Veg + Chef Special) */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {/* Authentic Indian Veg/Non-Veg Stamp */}
          <div className="px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md flex items-center gap-1.5 border border-white/15 shadow-md">
            {item.isVeg ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-emerald-500 rounded flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  VEG
                </span>
              </>
            ) : (
              <>
                <div className="w-3.5 h-3.5 border-2 border-red-500 rounded flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                </div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  NON-VEG
                </span>
              </>
            )}
          </div>

          {/* Chef's Signature Badge */}
          {item.isChefSpecial && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black uppercase tracking-wider shadow-lg">
              <Star className="w-3 h-3 fill-black text-black" />
              <span>Chef's Choice</span>
            </span>
          )}
        </div>

        {/* Top Right Badges (Spice & Time) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          {renderSpiceMeter()}
          {item.preparationTimeMinutes && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-gray-300 text-[10px] border border-white/10">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              <span>{item.preparationTimeMinutes}m</span>
            </div>
          )}
        </div>

        {/* Rating Floating Tag */}
        <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-amber-500/20">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>4.9</span>
          <span className="text-[9px] text-gray-400 font-normal">(Rooftop Hit)</span>
        </div>

        {/* Sold Out Overlay if unavailable */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="px-4 py-1.5 rounded-full bg-red-600/90 text-white text-xs font-black uppercase tracking-wider shadow-xl border border-red-400/50">
              Aaj Khatam / Sold Out Today
            </div>
          </div>
        )}
      </div>

      {/* Appetizing Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1 tracking-wide">
              {item.name}
            </h3>
            <div className="text-right">
              <span className="text-amber-400 font-black text-lg sm:text-xl whitespace-nowrap">
                ₹{item.price}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed font-sans">
            {item.description || "Freshly cooked to order with signature Vinayaka aromatic seasonings."}
          </p>

          {/* Active Note Preview */}
          {currentNote && (
            <div className="mb-2.5 text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/25 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate italic">Chef Note: "{currentNote}"</span>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between gap-2">
          
          {/* Custom Instruction Note Trigger */}
          <button
            onClick={() => {
              setNoteText(currentNote);
              setShowNoteInput(!showNoteInput);
            }}
            disabled={!item.isAvailableToday}
            className="text-[11px] text-gray-400 hover:text-amber-400 flex items-center gap-1 transition-colors px-1 py-1"
            title="Custom instructions: Less spicy, extra sauce..."
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>

          {/* Add / Quantity Buttons */}
          {isAvailable ? (
            quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black text-xs font-black transition-all active:scale-95 shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 font-black" />
                <span>ADD</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-amber-500/15 border border-amber-500/60 rounded-2xl px-2 py-1 shadow-md">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-6 h-6 rounded-xl bg-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-300 flex items-center justify-center transition-all active:scale-90 font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-black text-amber-300 min-w-[18px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-6 h-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-black transition-all active:scale-90"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )
          ) : (
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Unavailable
            </span>
          )}

        </div>

        {/* Dropdown Note Input */}
        {showNoteInput && (
          <div className="mt-3 p-3 rounded-2xl bg-black/80 border border-amber-500/40 animate-fadeIn">
            <label className="block text-[11px] text-amber-300 mb-1.5 font-bold">
              👨‍🍳 Cooking request for Kitchen Chef:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Kam mirch, bina pyaz, extra crispy..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSaveNote}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow"
                title="Save"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
