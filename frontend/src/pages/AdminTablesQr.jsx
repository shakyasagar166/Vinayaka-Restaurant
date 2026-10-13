import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Plus, MapPin, Copy, ExternalLink, Sparkles, Check } from 'lucide-react';
import { api } from '../api/api';

export default function AdminTablesQr() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedTable, setCopiedTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    section: 'Rooftop Open Air',
    seatingCapacity: 4
  });

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await api.getAllTables();
      setTables(data || []);
    } catch (e) {
      console.error("Error loading tables:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const getTableUrl = (tableNumber) => {
    const origin = window.location.origin;
    return `${origin}/?table=${encodeURIComponent(tableNumber)}`;
  };

  const handleCopyLink = (tableNumber) => {
    const url = getTableUrl(tableNumber);
    navigator.clipboard.writeText(url);
    setCopiedTable(tableNumber);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTable.tableNumber.trim()) return;

    try {
      await api.createTable({
        ...newTable,
        active: true
      });
      setShowAddModal(false);
      setNewTable({ tableNumber: '', section: 'Rooftop Open Air', seatingCapacity: 4 });
      loadTables();
    } catch (err) {
      alert("Error adding table: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Print and Add Table Actions */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-5 rounded-2xl border border-gray-800">
        <div>
          <h3 className="font-cinzel text-xl font-bold text-amber-300">
            Dining Tables &amp; Table QR Standees (क्यूआर कोड जनरेटर)
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Har table ka apna unique QR code hai. Customer scan karte hi us table ka menu khul jayega!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print All QR Cards</span>
          </button>
        </div>
      </div>

      {/* Grid of Printable Table QR Cards */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Loading table QR codes...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((t) => {
            const tableUrl = getTableUrl(t.tableNumber);
            const isCopied = copiedTable === t.tableNumber;

            return (
              <div
                key={t.id || t.tableNumber}
                className="print-card rounded-3xl bg-[#0f1424] border border-amber-500/30 p-5 flex flex-col items-center text-center shadow-xl relative overflow-hidden group hover:border-amber-400/60 transition-all"
              >
                {/* Background glow in non-print */}
                <div className="no-print absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

                {/* Restaurant Branding Header on Card */}
                <div className="w-full border-b border-amber-500/20 pb-3 mb-4">
                  <span className="font-cinzel text-xs font-extrabold tracking-widest text-amber-400 uppercase block">
                    Garam Masala Restaurant
                  </span>
                  <span className="text-[10px] text-gray-400 tracking-wider uppercase block">
                    Family Restaurant &amp; Dining
                  </span>
                </div>

                {/* Table Number Heading */}
                <div className="mb-3">
                  <div className="font-cinzel text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                    {t.tableNumber}
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-medium">
                    {t.section} &bull; {t.seatingCapacity} Seater
                  </div>
                </div>

                {/* QR Code Canvas */}
                <div className="p-3.5 bg-white rounded-2xl shadow-md border-2 border-amber-500/40 my-1">
                  <QRCodeSVG
                    value={tableUrl}
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Instructions on Standee */}
                <div className="mt-3 text-[11px] text-gray-400">
                  <p className="font-bold text-gray-300">Scan QR Code with Camera</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">To View Menu &amp; Place Order</p>
                </div>

                {/* Action Buttons for Screen View (Hidden when printing) */}
                <div className="no-print w-full mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCopyLink(t.tableNumber)}
                    className="flex items-center gap-1 text-gray-400 hover:text-amber-400 transition-colors"
                    title="Copy QR URL"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{isCopied ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={tableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold text-[11px]"
                  >
                    <span>Test Table</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-sm bg-[#0e1322] border-t sm:border border-amber-500/30 rounded-t-3xl sm:rounded-2xl p-5 text-white shadow-2xl z-10 pb-safe">
            <h3 className="font-cinzel text-base font-bold text-amber-400 mb-3">
              Add New Dining Table
            </h3>
            <form onSubmit={handleAddTable} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Table Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rooftop-06, Lounge-VIP-03"
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                  className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Section</label>
                <select
                  value={newTable.section}
                  onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                  className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Rooftop Open Air">Rooftop Open Air</option>
                  <option value="Rooftop Sky Deck">Rooftop Sky Deck</option>
                  <option value="Luxury Lounge">Luxury Lounge</option>
                  <option value="VIP Lounge">VIP Lounge</option>
                  <option value="AC Family Dining">AC Family Dining</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.seatingCapacity}
                  onChange={(e) => setNewTable({ ...newTable, seatingCapacity: parseInt(e.target.value, 10) || 4 })}
                  className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-bold"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
