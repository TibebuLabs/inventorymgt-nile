import React, { useState } from "react";
import { FaPrint, FaSearch } from "react-icons/fa";

interface UnitMeasurement {
  id: number;
  unit: string;
}

interface StockIn {
  id: number;
  quantity: number;
  ref_key: number;
  unit_price: number;
  total_price: number;
}

interface StockOut {
  id: number;
  quantity: number;
  ref_key: number;
  unit_price: number;
  total_price: number;
}

interface StockBalance {
  id: number;
  quantity: number;
  ref_key: number;
  unit_price: number;
  total_price: number;
}

interface Grn {
  id: number;
  date: string;
  supplier: string;
  suppliers_inv_other_no: string;
  store_location: string;
  purchase_req_num: number;
  purchase_order_num: number;
}

interface Siv {
  id: number;
  issued_to: string;
  date: string;
  store_req_num: number;
}

interface ReferanceScc {
  id: number;
  scc_id: number;
  date: string;
  grn_id: number;
  iv_id: number;
  unit_measurement_id: number;
  unit_measurement: UnitMeasurement;
  stock_in_key: number;
  stock_out_key: number;
  stock_balance_key: number;
  grn: Grn;
  siv: Siv;
  stock_in: StockIn[];
  stock_out: StockOut[];
  stock_balance: StockBalance[];
  remark?: string;
}

interface ItemDetails {
  id: number;
  name: string;
  unit_measurement_id: number;
  unit_measurement: UnitMeasurement;
  type_id: number;
  type: {
    id: number;
    type: string;
  };
}

interface StockControlCard {
  id: number;
  item: string;
  location_shelves_no: string;
  max_stock_level: number;
  min_stock_level: number;
  referance_key: number;
  item_details: ItemDetails;
  referance_scc: ReferanceScc[];
}

const ViewStockControlCard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<StockControlCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<StockControlCard | null>(
    null
  );

  // Sample data with multiple items
  const stockControlCards: StockControlCard[] = [
    {
      id: 1,
      item: "Laptop",
      location_shelves_no: "A-12",
      max_stock_level: 100,
      min_stock_level: 10,
      referance_key: 1,
      item_details: {
        id: 1,
        name: "Laptop",
        unit_measurement_id: 1,
        unit_measurement: { id: 1, unit: "Piece" },
        type_id: 1,
        type: { id: 1, type: "Electronics" },
      },
      referance_scc: [
        {
          id: 1,
          scc_id: 1,
          date: "2024-03-12T00:00:00.000Z",
          grn_id: 1,
          iv_id: 1,
          unit_measurement_id: 1,
          unit_measurement: { id: 1, unit: "Piece" },
          stock_in_key: 1,
          stock_out_key: 1,
          stock_balance_key: 1,
          grn: {
            id: 1,
            date: "2024-03-10T00:00:00.000Z",
            supplier: "Tech Supplier Inc.",
            suppliers_inv_other_no: "INV-12345",
            store_location: "Main Warehouse",
            purchase_req_num: 5001,
            purchase_order_num: 7001,
          },
          siv: {
            id: 1,
            issued_to: "IT Department",
            date: "2024-03-11T00:00:00.000Z",
            store_req_num: 3001,
          },
          stock_in: [
            {
              id: 1,
              quantity: 20,
              ref_key: 1,
              unit_price: 1200.5,
              total_price: 24010,
            },
          ],
          stock_out: [
            {
              id: 1,
              quantity: 5,
              ref_key: 1,
              unit_price: 1200.5,
              total_price: 6002.5,
            },
          ],
          stock_balance: [
            {
              id: 1,
              quantity: 15,
              ref_key: 1,
              unit_price: 1200.5,
              total_price: 18007.5,
            },
          ],
          remark: "Initial stock entry",
        },
      ],
    },
    {
      id: 2,
      item: "Printer",
      location_shelves_no: "B-07",
      max_stock_level: 50,
      min_stock_level: 5,
      referance_key: 2,
      item_details: {
        id: 2,
        name: "Printer",
        unit_measurement_id: 1,
        unit_measurement: { id: 1, unit: "Piece" },
        type_id: 1,
        type: { id: 1, type: "Electronics" },
      },
      referance_scc: [
        {
          id: 2,
          scc_id: 2,
          date: "2024-03-15T00:00:00.000Z",
          grn_id: 2,
          iv_id: 2,
          unit_measurement_id: 1,
          unit_measurement: { id: 1, unit: "Piece" },
          stock_in_key: 2,
          stock_out_key: 2,
          stock_balance_key: 2,
          grn: {
            id: 2,
            date: "2024-03-14T00:00:00.000Z",
            supplier: "Office Supplies Co.",
            suppliers_inv_other_no: "INV-54321",
            store_location: "Main Warehouse",
            purchase_req_num: 5002,
            purchase_order_num: 7002,
          },
          siv: {
            id: 2,
            issued_to: "HR Department",
            date: "2024-03-16T00:00:00.000Z",
            store_req_num: 3002,
          },
          stock_in: [
            {
              id: 2,
              quantity: 10,
              ref_key: 2,
              unit_price: 450.75,
              total_price: 4507.5,
            },
          ],
          stock_out: [
            {
              id: 2,
              quantity: 2,
              ref_key: 2,
              unit_price: 450.75,
              total_price: 901.5,
            },
          ],
          stock_balance: [
            {
              id: 2,
              quantity: 8,
              ref_key: 2,
              unit_price: 450.75,
              total_price: 3606,
            },
          ],
          remark: "New printer stock",
        },
      ],
    },
    {
      id: 3,
      item: "Paper",
      location_shelves_no: "C-03",
      max_stock_level: 500,
      min_stock_level: 100,
      referance_key: 3,
      item_details: {
        id: 3,
        name: "Paper",
        unit_measurement_id: 2,
        unit_measurement: { id: 2, unit: "Ream" },
        type_id: 2,
        type: { id: 2, type: "Stationery" },
      },
      referance_scc: [
        {
          id: 3,
          scc_id: 3,
          date: "2024-03-18T00:00:00.000Z",
          grn_id: 3,
          iv_id: 3,
          unit_measurement_id: 2,
          unit_measurement: { id: 2, unit: "Ream" },
          stock_in_key: 3,
          stock_out_key: 3,
          stock_balance_key: 3,
          grn: {
            id: 3,
            date: "2024-03-17T00:00:00.000Z",
            supplier: "Paper World",
            suppliers_inv_other_no: "INV-98765",
            store_location: "Storage Room",
            purchase_req_num: 5003,
            purchase_order_num: 7003,
          },
          siv: {
            id: 3,
            issued_to: "All Departments",
            date: "2024-03-19T00:00:00.000Z",
            store_req_num: 3003,
          },
          stock_in: [
            {
              id: 3,
              quantity: 200,
              ref_key: 3,
              unit_price: 12.99,
              total_price: 2598,
            },
          ],
          stock_out: [
            {
              id: 3,
              quantity: 50,
              ref_key: 3,
              unit_price: 12.99,
              total_price: 649.5,
            },
          ],
          stock_balance: [
            {
              id: 3,
              quantity: 150,
              ref_key: 3,
              unit_price: 12.99,
              total_price: 1948.5,
            },
          ],
          remark: "A4 paper stock",
        },
      ],
    },

    {
      id: 3,
      item: "Paper",
      location_shelves_no: "C-03",
      max_stock_level: 500,
      min_stock_level: 100,
      referance_key: 3,
      item_details: {
        id: 3,
        name: "Paper",
        unit_measurement_id: 2,
        unit_measurement: { id: 2, unit: "Ream" },
        type_id: 2,
        type: { id: 2, type: "Stationery" },
      },
      referance_scc: [
        {
          id: 3,
          scc_id: 3,
          date: "2024-03-18T00:00:00.000Z",
          grn_id: 3,
          iv_id: 3,
          unit_measurement_id: 2,
          unit_measurement: { id: 2, unit: "Ream" },
          stock_in_key: 3,
          stock_out_key: 3,
          stock_balance_key: 3,
          grn: {
            id: 3,
            date: "2024-03-17T00:00:00.000Z",
            supplier: "Paper World",
            suppliers_inv_other_no: "INV-98765",
            store_location: "Storage Room",
            purchase_req_num: 5003,
            purchase_order_num: 7003,
          },
          siv: {
            id: 3,
            issued_to: "All Departments",
            date: "2024-03-19T00:00:00.000Z",
            store_req_num: 3003,
          },
          stock_in: [
            {
              id: 3,
              quantity: 200,
              ref_key: 3,
              unit_price: 12.99,
              total_price: 2598,
            },
          ],
          stock_out: [
            {
              id: 3,
              quantity: 50,
              ref_key: 3,
              unit_price: 12.99,
              total_price: 649.5,
            },
          ],
          stock_balance: [
            {
              id: 3,
              quantity: 150,
              ref_key: 3,
              unit_price: 12.99,
              total_price: 1948.5,
            },
          ],
          remark: "A4 paper stock",
        },
      ],
    },
  ];

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSelectedCard(null);
      return;
    }

    const results = stockControlCards.filter((card) =>
      card.item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(results);

    // If there's only one result, select it automatically
    if (results.length === 1) {
      setSelectedCard(results[0]);
    } else {
      setSelectedCard(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printable-area")?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = `
         <style>
          @media print {
            .print-header {
              text-align: center;
              margin: 20px 0;
            }
            .print-header img {
              width: 100px;
              height: 100px;
            }
            .print-header h1 {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .print-header h2 {
              font-size: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
            }
            .print-table th, .print-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .print-table th {
              background-color: #f2f2f2;
            }
            .print-actions {
              display: none;
            }
            .search-section {
              display: none;
            }
          }
        </style>
        <div class="print-header">
          <img src="logo-placeholder.png" alt="Logo" />
          <h1>Nile Insurance Company</h1>
          <h2>Stock Control Card</h2>
          <h3>Item: ${selectedCard?.item || ""}</h3>
        </div>
    
        ${printContents}
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Search Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 search-section">
        <h2 className="text-2xl font-bold mb-4">Search Stock Control Card</h2>
        <div className="flex gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search by item name (e.g., Printer, Laptop)"
              className="w-full p-3 border border-gray-300 rounded-lg pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <FaSearch
              className="absolute right-3 top-3.5 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={handleSearch}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all flex items-center"
            onClick={handleSearch}
          >
            <FaSearch className="mr-2" /> Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Search Results:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((card) => (
                <div
                  key={card.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-50 ${
                    selectedCard?.id === card.id
                      ? "bg-blue-100 border-blue-400"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedCard(card)}
                >
                  <h4 className="font-bold">{card.item}</h4>
                  <p>Location: {card.location_shelves_no}</p>
                  <p>Type: {card.item_details.type.type}</p>
                  <p className="text-sm text-gray-600">
                    Last updated:{" "}
                    {new Date(card.referance_scc[0].date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchTerm && searchResults.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            No items found matching your search.
          </div>
        )}
      </div>

      {/* Printable Area - Only shown when a card is selected */}
      {selectedCard && (
        <div id="printable-area">
          {/* Print Button */}
          <div className="flex justify-end mb-4 print-actions">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all flex items-center"
              onClick={handlePrint}
            >
              <FaPrint className="mr-2" /> Print
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-center">
            Stock Control Card Overview
          </h2>

          {/* Common Data Section */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start">
              <p>
                <strong>Item:</strong>{" "}
                <span className="ml-2">{selectedCard.item}</span>
              </p>
              <p>
                <strong>Location (shelves) No:</strong>{" "}
                <span className="ml-2">{selectedCard.location_shelves_no}</span>
              </p>
              <p>
                <strong>Type:</strong>{" "}
                <span className="ml-2">
                  {selectedCard.item_details.type.type}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-start">
              <p>
                <strong>Max. Stock Level:</strong>{" "}
                <span className="ml-2">{selectedCard.max_stock_level}</span>
              </p>
              <p>
                <strong>Min. Stock Level:</strong>{" "}
                <span className="ml-2">{selectedCard.min_stock_level}</span>
              </p>
              <p>
                <strong>Unit:</strong>{" "}
                <span className="ml-2">
                  {selectedCard.item_details.unit_measurement.unit}
                </span>
              </p>
            </div>
          </div>

          {/* GRN Items Table */}
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full table-auto border-collapse print-table">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left" rowSpan={2}>
                    Date
                  </th>
                  <th className="border px-4 py-2 text-left" colSpan={2}>
                    Reference
                  </th>
                  <th className="border px-4 py-2 text-left" rowSpan={2}>
                    Unit Measurement
                  </th>
                  <th className="border px-4 py-2 text-center" colSpan={3}>
                    In
                  </th>
                  <th className="border px-4 py-2 text-center" colSpan={3}>
                    Out
                  </th>
                  <th className="border px-4 py-2 text-center" colSpan={3}>
                    Balance
                  </th>
                  <th className="border px-4 py-2 text-left" rowSpan={2}>
                    Remarks
                  </th>
                </tr>
                <tr>
                  <th className="border px-4 py-2 text-left">GRN</th>
                  <th className="border px-4 py-2 text-left">IV</th>
                  <th className="border px-4 py-2 text-center">Quantity</th>
                  <th className="border px-4 py-2 text-center">Unit Price</th>
                  <th className="border px-4 py-2 text-center">Total</th>
                  <th className="border px-4 py-2 text-center">Quantity</th>
                  <th className="border px-4 py-2 text-center">Unit Price</th>
                  <th className="border px-4 py-2 text-center">Total</th>
                  <th className="border px-4 py-2 text-center">Quantity</th>
                  <th className="border px-4 py-2 text-center">Unit Price</th>
                  <th className="border px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedCard.referance_scc.map((item, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="border px-4 py-2 text-left">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2 text-left">
                      {item.grn.id}
                    </td>
                    <td className="border px-4 py-2 text-left">{item.iv_id}</td>
                    <td className="border px-4 py-2 text-left">
                      {item.unit_measurement.unit}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_in.reduce(
                        (total, stock) => total + stock.quantity,
                        0
                      )}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_in[0]?.unit_price.toFixed(2) || "0.00"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_in
                        .reduce((total, stock) => total + stock.total_price, 0)
                        .toFixed(2)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_out.reduce(
                        (total, stock) => total + stock.quantity,
                        0
                      )}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_out[0]?.unit_price.toFixed(2) || "0.00"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_out
                        .reduce((total, stock) => total + stock.total_price, 0)
                        .toFixed(2)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_balance.reduce(
                        (total, stock) => total + stock.quantity,
                        0
                      )}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_balance[0]?.unit_price.toFixed(2) || "0.00"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {item.stock_balance
                        .reduce((total, stock) => total + stock.total_price, 0)
                        .toFixed(2)}
                    </td>
                    <td className="border px-4 py-2 text-left">
                      {item.remark || "No remarks"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewStockControlCard;
