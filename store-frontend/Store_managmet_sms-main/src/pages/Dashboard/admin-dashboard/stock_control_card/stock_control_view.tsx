/**
 * ViewStockControlCard
 *
 * Fetches all Stock Control Cards from the API and lets the store-manager
 * search by item name, view the full movement history, and print the card.
 */
import React, { useState, useEffect } from "react";
import { FaPrint, FaSearch } from "react-icons/fa";
import HttpNetworkService from "../../../../services/network";
import SharedPreferencesService from "../../../../services/storage";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

// ── Types ────────────────────────────────────────────────────────────────────
interface UnitMeasurement { id: number; unit: string; }
interface StockIn   { id: number; quantity: number; ref_key: number; unit_price: number; total_price: number; }
interface StockOut  { id: number; quantity: number; ref_key: number; unit_price: number; total_price: number; }
interface StockBal  { id: number; quantity: number; ref_key: number; unit_price: number; total_price: number; }
interface GrnRef    { id: number; date: string; supplier: string; }
interface ReferanceScc {
  id: number;
  scc_id: number;
  date: string;
  grn_id: number | null;
  iv_id: number | null;
  unit_measurement: UnitMeasurement;
  grn: GrnRef | null;
  stock_in: StockIn[];
  stock_out: StockOut[];
  stock_balance: StockBal[];
}
interface ItemType        { id: number; type: string; }
interface ItemDetails     { id: number; name: string; unit_measurement: UnitMeasurement; type: ItemType; }
interface StockControlCard {
  id: number;
  item: string;
  location_shelves_no: string;
  max_stock_level: number;
  min_stock_level: number;
  item_details: ItemDetails;
  referance_scc: ReferanceScc[];
}

// ── Component ────────────────────────────────────────────────────────────────
const ViewStockControlCard: React.FC = () => {
  const [allCards, setAllCards]         = useState<StockControlCard[]>([]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [searchResults, setSearchResults] = useState<StockControlCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<StockControlCard | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // Fetch all SCCs on mount
  useEffect(() => {
    http
      .get<StockControlCard[]>("scc")
      .then((data) => {
        setAllCards(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load stock cards");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchResults([]);
      setSelectedCard(null);
      return;
    }
    const results = allCards.filter((c) =>
      c.item.toLowerCase().includes(term)
    );
    setSearchResults(results);
    setSelectedCard(results.length === 1 ? results[0] : null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printable-area")?.innerHTML;
    if (!printContents) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = `
      <style>
        @media print {
          .search-section { display: none; }
          .print-actions  { display: none; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 11px; }
          th { background: #f2f2f2; }
        }
      </style>
      <div style="text-align:center;margin:20px 0">
        <h1 style="font-size:20px;font-weight:bold">Nile Insurance Company</h1>
        <h2 style="font-size:16px">Stock Control Card — ${selectedCard?.item ?? ""}</h2>
      </div>
      ${printContents}
    `;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
      Loading stock cards…
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      {error}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Stock Control Cards</h1>
        <p className="text-sm text-slate-400 mt-0.5">{allCards.length} items tracked</p>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 search-section">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by item name (e.g. Printer, Paper)…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-slate-400 transition"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            Search
          </button>
        </div>

        {/* Search results list */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Results ({searchResults.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`p-3.5 border rounded-xl cursor-pointer transition ${
                    selectedCard?.id === card.id
                      ? "bg-blue-50 border-blue-400"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-800 text-sm">{card.item}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Shelf: {card.location_shelves_no}
                  </p>
                  <p className="text-xs text-slate-400">
                    Type: {card.item_details?.type?.type ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchTerm && searchResults.length === 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl">
            No items found matching "{searchTerm}".
          </div>
        )}
      </div>

      {/* ── Selected card detail ────────────────────────────────────────────── */}
      {selectedCard && (
        <div id="printable-area" className="space-y-4">
          {/* Print button */}
          <div className="flex justify-end print-actions">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
            >
              <FaPrint /> Print
            </button>
          </div>

          <h2 className="text-lg font-bold text-center text-slate-800">
            Stock Control Card — {selectedCard.item}
          </h2>

          {/* Card header */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 grid grid-cols-2 gap-4">
            <div className="space-y-1 text-sm">
              <p><span className="font-medium text-slate-700">Item:</span> {selectedCard.item}</p>
              <p><span className="font-medium text-slate-700">Location / Shelf:</span> {selectedCard.location_shelves_no}</p>
              <p><span className="font-medium text-slate-700">Type:</span> {selectedCard.item_details?.type?.type ?? "—"}</p>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium text-slate-700">Max Stock Level:</span> {selectedCard.max_stock_level}</p>
              <p><span className="font-medium text-slate-700">Min Stock Level:</span> {selectedCard.min_stock_level}</p>
              <p><span className="font-medium text-slate-700">Unit:</span> {selectedCard.item_details?.unit_measurement?.unit ?? "—"}</p>
            </div>
          </div>

          {/* Movement table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            {selectedCard.referance_scc.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-sm">
                No stock movements recorded yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th rowSpan={2} className="px-4 py-3 text-left border-b border-r border-slate-100">Date</th>
                    <th colSpan={2} className="px-4 py-2 text-center border-b border-r border-slate-100">Reference</th>
                    <th rowSpan={2} className="px-4 py-3 text-left border-b border-r border-slate-100">Unit</th>
                    <th colSpan={3} className="px-4 py-2 text-center border-b border-r border-slate-100">Stock In</th>
                    <th colSpan={3} className="px-4 py-2 text-center border-b border-r border-slate-100">Stock Out</th>
                    <th colSpan={3} className="px-4 py-2 text-center border-b border-slate-100">Balance</th>
                  </tr>
                  <tr>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">GRN</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">IV</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">Qty</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">Unit Price</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">Total</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">Qty</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">Unit Price</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">Total</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">Qty</th>
                    <th className="px-3 py-2 text-center border-b border-r border-slate-100">Unit Price</th>
                    <th className="px-3 py-2 text-center border-b border-slate-100">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {selectedCard.referance_scc.map((ref, i) => {
                    const inQty    = ref.stock_in.reduce((s, x) => s + x.quantity, 0);
                    const inPrice  = ref.stock_in[0]?.unit_price ?? 0;
                    const inTotal  = ref.stock_in.reduce((s, x) => s + x.total_price, 0);
                    const outQty   = ref.stock_out.reduce((s, x) => s + x.quantity, 0);
                    const outPrice = ref.stock_out[0]?.unit_price ?? 0;
                    const outTotal = ref.stock_out.reduce((s, x) => s + x.total_price, 0);
                    const balQty   = ref.stock_balance.reduce((s, x) => s + x.quantity, 0);
                    const balPrice = ref.stock_balance[0]?.unit_price ?? 0;
                    const balTotal = ref.stock_balance.reduce((s, x) => s + x.total_price, 0);

                    return (
                      <tr key={i} className={`hover:bg-slate-50 transition ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                        <td className="px-4 py-3 border-r border-slate-50">
                          {new Date(ref.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{ref.grn_id ?? "—"}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{ref.iv_id ?? "—"}</td>
                        <td className="px-3 py-3 border-r border-slate-50">{ref.unit_measurement?.unit ?? "—"}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{inQty || "—"}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{inQty ? inPrice.toFixed(2) : "—"}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{inQty ? inTotal.toFixed(2) : "—"}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{outQty || "—"}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{outQty ? outPrice.toFixed(2) : "—"}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{outQty ? outTotal.toFixed(2) : "—"}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50 font-medium text-slate-800">{balQty}</td>
                        <td className="px-3 py-3 text-center border-r border-slate-50">{balPrice.toFixed(2)}</td>
                        <td className="px-3 py-3 text-center font-medium text-slate-800">{balTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewStockControlCard;
