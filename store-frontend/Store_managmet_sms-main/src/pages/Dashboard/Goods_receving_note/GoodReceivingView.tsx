import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";
import { cn } from "../../../lib/format";
import {
  Badge,
  Table,
  Td,
  Th,
  Tr,
} from "../../../components/ui";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

import { GRN } from "./types";

const ViewReceivingGoods: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";
  const [receivingGoodsData, setReceivingGoodsData] = useState<GRN | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getId = () => {
    const segments = location.pathname.split("/");
    return parseInt(segments[segments.length - 1], 10) || 0;
  };

  const id = getId();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    http
      .get<GRN>(`grn/${id}`)
      .then((data) => {
        setReceivingGoodsData(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load GRN"
        );
        setLoading(false);
      });
  }, [id]);

  const formatCurrency = (value: number | null | undefined) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
  };

  if (loading) return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4" />
      <p className="text-slate-500 dark:text-slate-400">Loading GRN details…</p>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl">
        <p className="text-sm font-medium">Error loading GRN data</p>
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      </div>
    </div>
  );

  if (!receivingGoodsData) return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-slate-500 dark:text-slate-400">No GRN data available</p>
    </div>
  );

  const grnItems = receivingGoodsData.grn_items || [];
  const totalValue =
    (receivingGoodsData.total as { total_price?: number } | null)?.total_price ??
    (typeof receivingGoodsData.total === "number"
      ? receivingGoodsData.total
      : 0);
  const totalItems = grnItems.length;
  const totalQuantity = grnItems.reduce(
    (sum, item) => sum + (item.quantity_received || 0),
    0
  );

  const grnStatus = (receivingGoodsData as { status?: string })?.status || "pending";

  const statusConfig: Record<string, { className: string; label: string }> = {
    pending: { className: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300", label: "Pending" },
    approved: { className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300", label: "Approved" },
    rejected: { className: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300", label: "Rejected" },
    fulfilled: { className: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300", label: "Fulfilled" },
  };
  const badgeConfig = statusConfig[grnStatus] || statusConfig.pending;

  const handlePrint = () => {
    if (!receivingGoodsData) return;

    const themeClass = darkMode ? "dark" : "light";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printHtml = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nile Insurance - GRN #${receivingGoodsData.id}</title>
  <style>
    :root { color-scheme: ${themeClass}; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; color: #1f2937; background: #fff; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 25px; border-bottom: 3px solid #2563eb; }
    .header h1 { font-size: 28px; font-weight: 800; color: #2563eb; margin: 0; }
    .header h2 { font-size: 18px; font-weight: 600; color: #6b7280; margin: 8px 0 0; }
    .header p { font-size: 14px; color: #6b7280; margin: 4px 0 0; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .meta-group { display: flex; flex-direction: column; gap: 6px; }
    .meta-group p { margin: 0; font-size: 14px; }
    .meta-group .label { font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .meta-group .value { font-size: 15px; color: #111827; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 13px; }
    th { background-color: #2563eb; color: #fff; font-weight: 600; text-align: left; padding: 12px 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #1d4ed8; }
    td { border: 1px solid #e5e7eb; padding: 10px 8px; color: #374151; }
    tr:nth-child(even) td { background-color: #f9fafb; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-medium { font-weight: 500; }
    .font-bold { font-weight: 600; }
    .total-row { background-color: #eff6ff !important; font-weight: 700; color: #2563eb; }
    .signature { margin-top: 40px; padding-top: 25px; border-top: 2px solid #e5e7eb; }
    .signature-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
    .sig-field { display: flex; flex-direction: column; gap: 8px; }
    .sig-label { font-weight: 600; color: #374151; font-size: 13px; }
    .sig-value { font-size: 14px; color: #6b7280; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; min-height: 24px; }
    .note { margin-top: 30px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; }
    .no-print { margin-top: 20px; text-align: center; }
    @media (max-width: 640px) {
      body { padding: 10px; }
      .meta-grid { grid-template-columns: 1fr; }
      .signature-grid { grid-template-columns: 1fr; gap: 20px; }
      table { font-size: 11px; }
      th, td { padding: 6px 4px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nile Insurance Company</h1>
      <h2>Goods Receiving Note</h2>
      <p>GRN #${receivingGoodsData.id} &bull; ${receivingGoodsData.date}</p>
    </div>

    <div class="meta-grid">
      <div class="meta-group">
        <p class="label">Supplier</p>
        <p class="value">${receivingGoodsData.supplier}</p>
        <p class="label">Invoice / Other No.</p>
        <p class="value">${receivingGoodsData.suppliers_inv_other_no}</p>
      </div>
      <div class="meta-group">
        <p class="label">Store Location</p>
        <p class="value">${receivingGoodsData.store_location}</p>
        <p class="label">Purchase Req. No.</p>
        <p class="value">${receivingGoodsData.purchase_req_num}</p>
        <p class="label">Purchase Order No.</p>
        <p class="value">${receivingGoodsData.purchase_order_num}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 8%;">Serial No</th>
          <th style="width: 22%;">Description</th>
          <th style="width: 14%;">Unit</th>
          <th class="text-center" style="width: 14%;">Ordered</th>
          <th class="text-center" style="width: 14%;">Delivered</th>
          <th class="text-center" style="width: 14%;">Received</th>
          <th class="text-right" style="width: 14%;">Unit Price</th>
          <th class="text-right" style="width: 14%;">Total Price</th>
        </tr>
      </thead>
      <tbody>
        ${grnItems.map(
          (item) => `
          <tr>
            <td class="font-medium">${item.ser_no}</td>
            <td>${item.description || "&mdash;"}</td>
            <td>${item.unit_measurement?.unit || "&mdash;"}</td>
            <td class="text-center">${item.qua_ordered}</td>
            <td class="text-center">${item.qua_delivered}</td>
            <td class="text-center">${item.quantity_received}</td>
            <td class="text-right">${formatCurrency(item.unit_price)}</td>
            <td class="text-right">${formatCurrency(item.total_item_price)}</td>
          </tr>`
        ).join("")}
        <tr class="total-row">
          <td colspan="7" class="text-right font-bold">Total</td>
          <td class="text-right">${formatCurrency(totalValue)}</td>
        </tr>
      </tbody>
    </table>

    <div class="actions">
      <button class="no-print" onclick="window.close()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Close Print</button>
    </div>

    <div class="signature">
      <div class="signature-grid">
        <div class="sig-field">
          <p class="sig-label">Prepared By</p>
          <p class="sig-value">${receivingGoodsData.approvement?.prepared_by_id ? `Employee #${receivingGoodsData.approvement.prepared_by_id}` : "__________"}</p>
        </div>
        <div class="sig-field">
          <p class="sig-label">Checked By</p>
          <p class="sig-value">${receivingGoodsData.approvement?.checked_by_id ? `Employee #${receivingGoodsData.approvement.checked_by_id}` : "__________"}</p>
        </div>
        <div class="sig-field">
          <p class="sig-label">Received By</p>
          <p class="sig-value">${receivingGoodsData.approvement?.received_by_id ? `Employee #${receivingGoodsData.approvement.received_by_id}` : "__________"}</p>
        </div>
      </div>
    </div>

    <p class="note">
      Goods Receiving Note #${receivingGoodsData.id} &bull; Nile Insurance Company Store Management System
    </p>
  </div>
</body>
</html>`;

    const printDoc = printWindow.document;
    printDoc.open();
    printDoc.write(printHtml);
    printDoc.close();

    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  badgeConfig.className,
                  "px-3 py-1 rounded-full text-xs font-bold"
                )}
              >
                {badgeConfig.label}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                GRN #{receivingGoodsData.id}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Receiving Goods Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {darkMode ? "Dark mode" : "Light mode"} &bull; Nile Insurance Company
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀" : "🌙"}
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2"
            >
              <FaPrint className="text-sm" /> Print
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Total Value
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Line Items
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalItems}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Total Quantity
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalQuantity}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Supplier
            </p>
            <p className="text-lg font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">
              {receivingGoodsData.supplier}
            </p>
          </div>
        </div>

        {/* Supplier & Meta Info */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Shipment Details
            </h2>
            <Badge tone="blue" className="text-xs">
              {receivingGoodsData.suppliers_inv_other_no}
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                Date
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                {new Date(receivingGoodsData.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                Store Location
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                {receivingGoodsData.store_location}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                Purchase Req.
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                #{receivingGoodsData.purchase_req_num}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                Purchase Order
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                #{receivingGoodsData.purchase_order_num}
              </p>
            </div>
          </div>
        </section>

        {/* Items Table */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Received Items ({totalItems})
            </h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {grnItems.length} line item(s)
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    S.No
                  </Th>
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Item Description
                  </Th>
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Unit
                  </Th>
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center whitespace-nowrap">
                    Ordered
                  </Th>
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center whitespace-nowrap">
                    Delivered
                  </Th>
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center whitespace-nowrap">
                    Received
                  </Th>
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                    Unit Price
                  </Th>
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                    Total Price
                  </Th>
                  <Th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center whitespace-nowrap">
                    Actions
                  </Th>
                </tr>
              </thead>
              <tbody>
                {grnItems.map((item) => (
                  <Tr
                    key={item.ser_no}
                    className="border-b border-slate-100 dark:border-slate-700/60 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <Td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {item.ser_no}
                    </Td>
                    <Td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {item.description || "—"}
                      </div>
                      {item.remark && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">
                          {item.remark}
                        </p>
                      )}
                    </Td>
                    <Td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {item.unit_measurement?.unit || "—"}
                    </Td>
                    <Td className="px-4 py-3 text-sm text-center text-slate-600 dark:text-slate-400">
                      {item.qua_ordered}
                    </Td>
                    <Td className="px-4 py-3 text-sm text-center text-slate-600 dark:text-slate-400">
                      {item.qua_delivered}
                    </Td>
                    <Td className="px-4 py-3 text-sm text-center font-semibold text-slate-800 dark:text-slate-200">
                      {item.quantity_received}
                    </Td>
                    <Td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.unit_price)}
                    </Td>
                    <Td className="px-4 py-3 text-sm text-right font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(item.total_item_price)}
                    </Td>
                    <Td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit item"
                          onClick={() => console.log("Edit item", item.ser_no)}
                        >
                          <span className="text-xs">✎</span>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete item"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this item?"
                              )
                            ) {
                              // Delete item logic
                            }
                          }}
                        >
                          <span className="text-xs">✕</span>
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
                <Tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 font-bold">
                  <td colSpan={7} className="px-4 py-3 text-right text-slate-800 dark:text-slate-200">
                    Total
                  </td>
                  <Td className="px-4 py-3 text-right text-slate-900 dark:text-white">
                    {formatCurrency(totalValue)}
                  </Td>
                  <Td className="px-4 py-3" />
                </Tr>
              </tbody>
            </Table>
          </div>
        </section>

        {/* Authorization Section */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-6">
            Authorization & Signatures
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Prepared By
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {receivingGoodsData.approvement?.prepared_by_id
                  ? `Employee #${receivingGoodsData.approvement.prepared_by_id}`
                  : "__________"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Checked By
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {receivingGoodsData.approvement?.checked_by_id
                  ? `Employee #${receivingGoodsData.approvement.checked_by_id}`
                  : "__________"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Received By
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {receivingGoodsData.approvement?.received_by_id
                  ? `Employee #${receivingGoodsData.approvement.received_by_id}`
                  : "__________"}
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Goods Receiving Note #{receivingGoodsData.id} &bull;
              Nile Insurance Company Store Management System
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span
                className={cn(
                  badgeConfig.className,
                  "px-2 py-0.5 rounded text-[10px] font-medium"
                )}
              >
                {badgeConfig.label}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ViewReceivingGoods;
