import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api/api';

export default function TableSelectorModal() {
  const { isTableModalOpen, setIsTableModalOpen, tableNumber, setTableNumber } = useCart();
  const [tables, setTables] = useState([]);
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [customTableInput, setCustomTableInput] = useState('');

  useEffect(() => {
    if (isTableModalOpen) {
      api.getActiveTables().then(data => setTables(data || []));
    }
  }, [isTableModalOpen]);

  if (!isTableModalOpen) return null;

  const sections = ['ALL', ...Array.from(new Set(tables.map(t => t.section)))];
  const filteredTables = selectedSection === 'ALL'
    ? tables
    : tables.filter(t => t.section === selectedSection);

  const handleSelectTable = (num) => {
    setTableNumber(num);
    setIsTableModalOpen(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customTableInput.trim()) {
      setTableNumber(customTableInput.trim());
      setIsTableModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setIsTableModalOpen(false)}
      />

      <div className="relative w-full sm:max-w-lg bg-[#0d121f] border-t sm:border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-2xl z-10 max-h-[90vh] overflow-y-auto pb-safe">
        
        {/* Mobile handle */}
        <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-3 sm:hidden"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-black text-amber-300">
                Select Dining Table
              </h3>
              <p className="text-xs text-gray-400">
                Aap kis table par baithe hain?
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTableModalOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Filters */}
        <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedSection === sec
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Table Cards Grid */}
        <div className="max-h-64 overflow-y-auto py-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredTables.map(t => {
            const isSelected = tableNumber === t.tableNumber;
            return (
              <button
                key={t.id || t.tableNumber}
                onClick={() => handleSelectTable(t.tableNumber)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/40 shadow-lg'
                    : 'bg-gray-900/60 border-gray-800 hover:border-amber-500/40 text-gray-200'
                }`}
              >
                <div>
                  <div className="font-black text-sm tracking-wide flex items-center justify-between">
                    <span>{t.tableNumber}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate mt-0.5">
                    {t.section}
                  </div>
                </div>
                <div className="text-[10px] text-amber-400/80 mt-2 font-bold">
                  {t.seatingCapacity} Seater
                </div>
              </button>
            );
          })}
        </div>

        {/* Manual Table Number Input */}
        <form onSubmit={handleCustomSubmit} className="mt-4 pt-3 border-t border-gray-800">
          <label className="block text-xs text-gray-400 mb-1.5 font-semibold">
            Or type table number manually:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Rooftop-05, Lounge-02"
              value={customTableInput}
              onChange={(e) => setCustomTableInput(e.target.value)}
              className="flex-1 bg-black/60 border border-gray-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow transition-colors active:scale-95"
            >
              Set Table
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
