// import { useState } from "react";

// interface GoodReceivingNot {
//   serial_no: number;
//   date: string;
//   supplier: string;
//   supplier_inv_other_no: string;
//   store_location: string;
//   purchase_req_no: string;
//   purchase_order_no: string;
//   description: string;
//   unit_measurement: string;
//   quantity_ordered: number;
//   quantity_delivered: number;
//   quantity_receiving: number;
//   value_unit_price: number;
//   value_total_price: number;
//   remark: string;
// }

// // Component for General Information (First 6 Fields)
// const GeneralInformationForm = ({
//   newGood,
//   setNewGood,
//   darkMode,
// }: {
//   newGood: GoodReceivingNot;
//   setNewGood: (good: GoodReceivingNot) => void;
//   darkMode: boolean;
// }) => {
//   return (
//     <div
//       className={`shadow rounded-lg p-6 mb-6 transition-all duration-300 ${
//         darkMode ? "bg-gray-700" : "bg-gray-50"
//       }`}
//     >
//       <h3 className="text-lg font-semibold mb-4">General Information</h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* First 3 Fields */}
//         <div className="flex flex-col space-y-4">
//           {/* Date */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-sm font-medium">Date</label>
//             <input
//               type="date"
//               value={newGood.date}
//               onChange={(e) => setNewGood({ ...newGood, date: e.target.value })}
//               className={`p-2 border ${
//                 darkMode
//                   ? "border-gray-600 bg-gray-800 text-white"
//                   : "border-gray-300 bg-white"
//               } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//             />
//           </div>

//           {/* Supplier */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-sm font-medium">Supplier</label>
//             <input
//               type="text"
//               value={newGood.supplier}
//               onChange={(e) =>
//                 setNewGood({ ...newGood, supplier: e.target.value })
//               }
//               placeholder="Enter supplier..."
//               className={`p-2 border ${
//                 darkMode
//                   ? "border-gray-600 bg-gray-800 text-white"
//                   : "border-gray-300 bg-white"
//               } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//             />
//           </div>

//           {/* Supplier Invoice/Other No */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-sm font-medium">
//               Supplier Invoice/Other No
//             </label>
//             <input
//               type="text"
//               value={newGood.supplier_inv_other_no}
//               onChange={(e) =>
//                 setNewGood({
//                   ...newGood,
//                   supplier_inv_other_no: e.target.value,
//                 })
//               }
//               placeholder="Enter supplier invoice/other no..."
//               className={`p-2 border ${
//                 darkMode
//                   ? "border-gray-600 bg-gray-800 text-white"
//                   : "border-gray-300 bg-white"
//               } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//             />
//           </div>
//         </div>

//         {/* Next 3 Fields */}
//         <div className="flex flex-col space-y-4">
//           {/* Store Location */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-sm font-medium">Store Location</label>
//             <input
//               type="text"
//               value={newGood.store_location}
//               onChange={(e) =>
//                 setNewGood({ ...newGood, store_location: e.target.value })
//               }
//               placeholder="Enter store location..."
//               className={`p-2 border ${
//                 darkMode
//                   ? "border-gray-600 bg-gray-800 text-white"
//                   : "border-gray-300 bg-white"
//               } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//             />
//           </div>

//           {/* Purchase Req. No */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-sm font-medium">Purchase Req. No</label>
//             <input
//               type="text"
//               value={newGood.purchase_req_no}
//               onChange={(e) =>
//                 setNewGood({ ...newGood, purchase_req_no: e.target.value })
//               }
//               placeholder="Enter purchase req. no..."
//               className={`p-2 border ${
//                 darkMode
//                   ? "border-gray-600 bg-gray-800 text-white"
//                   : "border-gray-300 bg-white"
//               } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//             />
//           </div>

//           {/* Purchase Order No */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-sm font-medium">
//               Purchase Order No
//             </label>
//             <input
//               type="text"
//               value={newGood.purchase_order_no}
//               onChange={(e) =>
//                 setNewGood({ ...newGood, purchase_order_no: e.target.value })
//               }
//               placeholder="Enter purchase order no..."
//               className={`p-2 border ${
//                 darkMode
//                   ? "border-gray-600 bg-gray-800 text-white"
//                   : "border-gray-300 bg-white"
//               } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Component for the Add Good Form
// const AddGoodForm = ({
//   newGood,
//   setNewGood,
//   handleAddGood,
//   error,
//   darkMode,
// }: {
//   newGood: GoodReceivingNot;
//   setNewGood: (good: GoodReceivingNot) => void;
//   handleAddGood: () => void;
//   error: string;
//   darkMode: boolean;
// }) => {
//   return (
//     <div
//       className={`shadow rounded-lg p-6 mb-6 transition-all duration-300 ${
//         darkMode ? "bg-gray-800" : "bg-white"
//       }`}
//     >
//       <h3 className="text-lg font-semibold mb-4">Add New Good</h3>

//       {/* General Information Form */}
//       <GeneralInformationForm
//         newGood={newGood}
//         setNewGood={setNewGood}
//         darkMode={darkMode}
//       />

//       {/* Container for the remaining fields */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {/* Description */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Description</label>
//           <input
//             type="text"
//             value={newGood.description}
//             onChange={(e) =>
//               setNewGood({ ...newGood, description: e.target.value })
//             }
//             placeholder="Enter item description..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>

//         {/* Unit Measurement */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Unit Measurement</label>
//           <select
//             value={newGood.unit_measurement}
//             onChange={(e) =>
//               setNewGood({ ...newGood, unit_measurement: e.target.value })
//             }
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           >
//             <option value="">Select unit of measurement...</option>
//             <option value="kg">Kilogram (kg)</option>
//             <option value="g">Gram (g)</option>
//             <option value="l">Liter (l)</option>
//             <option value="ml">Milliliter (ml)</option>
//             <option value="pcs">Pieces (pcs)</option>
//           </select>
//         </div>

//         {/* Quantity Ordered */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Quantity Ordered</label>
//           <input
//             type="number"
//             value={newGood.quantity_ordered || ""}
//             onChange={(e) =>
//               setNewGood({ ...newGood, quantity_ordered: +e.target.value })
//             }
//             placeholder="Enter quantity ordered..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>

//         {/* Quantity Delivered */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Quantity Delivered</label>
//           <input
//             type="number"
//             value={newGood.quantity_delivered || ""}
//             onChange={(e) =>
//               setNewGood({ ...newGood, quantity_delivered: +e.target.value })
//             }
//             placeholder="Enter quantity delivered..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>

//         {/* Quantity Receiving */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Quantity Receiving</label>
//           <input
//             type="number"
//             value={newGood.quantity_receiving || ""}
//             onChange={(e) =>
//               setNewGood({ ...newGood, quantity_receiving: +e.target.value })
//             }
//             placeholder="Enter quantity receiving..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>

//         {/* Unit Price */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Unit Price</label>
//           <input
//             type="number"
//             value={newGood.value_unit_price || ""}
//             onChange={(e) =>
//               setNewGood({ ...newGood, value_unit_price: +e.target.value })
//             }
//             placeholder="Enter unit price..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>

//         {/* Remark */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Remark</label>
//           <input
//             type="text"
//             value={newGood.remark}
//             onChange={(e) => setNewGood({ ...newGood, remark: e.target.value })}
//             placeholder="Add remarks or notes..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>
//       </div>

//       {/* Add Button */}
//       <div className="flex justify-end mt-4">
//         <button
//           onClick={handleAddGood}
//           className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
//         >
//           Add
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//     </div>
//   );
// };

// // Component for the Goods List
// const GoodsList = ({
//   goods,
//   handleEditGood,
//   handleDeleteGood,
//   editGood,
//   setEditGood,
//   handleUpdateGood,
//   darkMode,
// }: {
//   goods: GoodReceivingNot[];
//   handleEditGood: (good: GoodReceivingNot) => void;
//   handleDeleteGood: (serial_no: number) => void;
//   editGood: GoodReceivingNot | null;
//   setEditGood: (good: GoodReceivingNot | null) => void;
//   handleUpdateGood: () => void;
//   darkMode: boolean;
// }) => {
//   return (
//     <div
//       className={`shadow rounded-lg p-6 transition-all duration-300 ${
//         darkMode ? "bg-gray-800" : "bg-white"
//       }`}
//     >
//       <h3 className="text-lg font-semibold mb-4">Goods List</h3>
//       {goods.length === 0 ? (
//         <p className="text-gray-500">No goods found.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
//                 <th className="p-3 text-left">Serial No</th>
//                 <th className="p-3 text-left">Description</th>
//                 <th className="p-3 text-left">Unit Measurement</th>
//                 <th className="p-3 text-left">Quantity Ordered</th>
//                 <th className="p-3 text-left">Quantity Delivered</th>
//                 <th className="p-3 text-left">Quantity Receiving</th>
//                 <th className="p-3 text-left">Unit Price</th>
//                 <th className="p-3 text-left">Total Price</th>
//                 <th className="p-3 text-left">Remark</th>
//                 <th className="p-3 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {goods.map((good) => (
//                 <tr
//                   key={good.serial_no}
//                   className={`border-b ${
//                     darkMode
//                       ? "border-gray-700 hover:bg-gray-700"
//                       : "border-gray-200 hover:bg-gray-50"
//                   } transition-all duration-300`}
//                 >
//                   <td className="p-3">{good.serial_no}</td>
//                   <td className="p-3">{good.description}</td>
//                   <td className="p-3">{good.unit_measurement}</td>
//                   <td className="p-3">{good.quantity_ordered}</td>
//                   <td className="p-3">{good.quantity_delivered}</td>
//                   <td className="p-3">{good.quantity_receiving}</td>
//                   <td className="p-3">{good.value_unit_price}</td>
//                   <td className="p-3">{good.value_total_price}</td>
//                   <td className="p-3">{good.remark}</td>
//                   <td className="p-3 flex items-center space-x-4">
//                     {editGood?.serial_no === good.serial_no ? (
//                       <>
//                         <button
//                           onClick={handleUpdateGood}
//                           className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-300"
//                         >
//                           Save
//                         </button>
//                         <button
//                           onClick={() => setEditGood(null)}
//                           className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-all duration-300"
//                         >
//                           Cancel
//                         </button>
//                       </>
//                     ) : (
//                       <>
//                         <button
//                           onClick={() => handleEditGood(good)}
//                           className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-all duration-300"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDeleteGood(good.serial_no)}
//                           className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
//                         >
//                           Delete
//                         </button>
//                       </>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// // Signature Section Component
// const SignatureSection = ({ darkMode }: { darkMode: boolean }) => {
//   const [preparedBy, setPreparedBy] = useState("");
//   const [approvedBy, setApprovedBy] = useState("");
//   const [receivedBy, setReceivedBy] = useState("");
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isApproved, setIsApproved] = useState(false);
//   const [error, setError] = useState("");

//   const handleSign = () => {
//     setIsPopupOpen(true);
//   };

//   const handleApprove = () => {
//     if (email === "admin@example.com" && password === "password123") {
//       setIsApproved(true);
//       setError("");
//       setIsPopupOpen(false);
//     } else {
//       setError("Invalid email or password.");
//     }
//   };

//   const handleSendForApproval = () => {
//     if (isApproved) {
//       alert("Form sent for approval successfully!");
//     } else {
//       alert("Please sign and approve the form first.");
//     }
//   };

//   return (
//     <div
//       className={`shadow rounded-lg p-6 transition-all duration-300 ${
//         darkMode ? "bg-gray-800" : "bg-white"
//       }`}
//     >
//       <h3 className="text-lg font-semibold mb-4">Signature Section</h3>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {/* Prepared By */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Prepared By</label>
//           <input
//             type="text"
//             value={preparedBy}
//             onChange={(e) => setPreparedBy(e.target.value)}
//             placeholder="Enter name..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>

//         {/* Approved By */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Approved By</label>
//           <input
//             type="text"
//             value={approvedBy}
//             onChange={(e) => setApprovedBy(e.target.value)}
//             placeholder="Enter name..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>

//         {/* Received By */}
//         <div className="flex flex-col">
//           <label className="mb-1 text-sm font-medium">Received By</label>
//           <input
//             type="text"
//             value={receivedBy}
//             onChange={(e) => setReceivedBy(e.target.value)}
//             placeholder="Enter name..."
//             className={`p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//           />
//         </div>
//       </div>

//       {/* Sign Button */}
//       <div className="flex justify-end mt-4">
//         <button
//           onClick={handleSign}
//           className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
//         >
//           Sign
//         </button>
//       </div>

//       {/* Send for Approval Button */}
//       <div className="flex justify-end mt-4">
//         <button
//           onClick={handleSendForApproval}
//           className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300"
//         >
//           Send for Approval
//         </button>
//       </div>

//       {/* Approval Popup */}
//       {isPopupOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div
//             className={`p-6 rounded-lg shadow-lg ${
//               darkMode ? "bg-gray-800" : "bg-white"
//             }`}
//           >
//             <h3 className="text-lg font-semibold mb-4">Approve Signature</h3>
//             <div className="flex flex-col space-y-4">
//               {/* Email */}
//               <div className="flex flex-col">
//                 <label className="mb-1 text-sm font-medium">Email</label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email..."
//                   className={`p-2 border ${
//                     darkMode
//                       ? "border-gray-700 bg-gray-800 text-white"
//                       : "border-gray-300 bg-white"
//                   } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//                 />
//               </div>

//               {/* Password */}
//               <div className="flex flex-col">
//                 <label className="mb-1 text-sm font-medium">Password</label>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password..."
//                   className={`p-2 border ${
//                     darkMode
//                       ? "border-gray-700 bg-gray-800 text-white"
//                       : "border-gray-300 bg-white"
//                   } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//                 />
//               </div>

//               {/* Error Message */}
//               {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

//               {/* Approve Button */}
//               <div className="flex justify-end">
//                 <button
//                   onClick={handleApprove}
//                   className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
//                 >
//                   Approve
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Approval Status */}
//       {isApproved && (
//         <div className="mt-4 text-green-500 font-semibold">
//           ✅ Approved! Thank you for signing.
//         </div>
//       )}
//     </div>
//   );
// };

// // Main Component
// const GoodReceivingNot = () => {
//   const [goods, setGoods] = useState<GoodReceivingNot[]>([]);
//   const [newGood, setNewGood] = useState<GoodReceivingNot>({
//     serial_no: 0,
//     date: "",
//     supplier: "",
//     supplier_inv_other_no: "",
//     store_location: "",
//     purchase_req_no: "",
//     purchase_order_no: "",
//     description: "",
//     unit_measurement: "",
//     quantity_ordered: 0,
//     quantity_delivered: 0,
//     quantity_receiving: 0,
//     value_unit_price: 0,
//     value_total_price: 0,
//     remark: "",
//   });
//   const [editGood, setEditGood] = useState<GoodReceivingNot | null>(null);
//   const [error, setError] = useState<string>("");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [darkMode, setDarkMode] = useState<boolean>(false);

//   // Add a new goods entry
//   const handleAddGood = () => {
//     if (!newGood.description.trim()) {
//       setError("Description cannot be empty.");
//       return;
//     }

//     const newEntry: GoodReceivingNot = {
//       ...newGood,
//       serial_no: Date.now(),
//       value_total_price: newGood.value_unit_price * newGood.quantity_ordered,
//     };
//     setGoods([...goods, newEntry]);

//     // Reset the form
//     setNewGood({
//       serial_no: 0,
//       date: "",
//       supplier: "",
//       supplier_inv_other_no: "",
//       store_location: "",
//       purchase_req_no: "",
//       purchase_order_no: "",
//       description: "",
//       unit_measurement: "",
//       quantity_ordered: 0,
//       quantity_delivered: 0,
//       quantity_receiving: 0,
//       value_unit_price: 0,
//       value_total_price: 0,
//       remark: "",
//     });
//     setError("");
//   };

//   // Edit an existing good entry
//   const handleEditGood = (good: GoodReceivingNot) => {
//     setEditGood(good);
//   };

//   // Update an existing good entry
//   const handleUpdateGood = () => {
//     if (!editGood?.description.trim()) {
//       setError("Description cannot be empty.");
//       return;
//     }
//     const updatedGoods = goods.map((good) =>
//       good.serial_no === editGood.serial_no
//         ? {
//             ...good,
//             ...editGood,
//             value_total_price:
//               editGood.value_unit_price * editGood.quantity_ordered,
//           }
//         : good
//     );
//     setGoods(updatedGoods);
//     setEditGood(null);
//     setError("");
//   };

//   // Delete a good entry
//   const handleDeleteGood = (serial_no: number) => {
//     const updatedGoods = goods.filter((good) => good.serial_no !== serial_no);
//     setGoods(updatedGoods);
//   };

//   // Toggle dark mode
//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//   };

//   return (
//     <div
//       className={`min-h-screen p-6 transition-colors duration-300 ${
//         darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
//       }`}
//     >
//       <h2 className="text-2xl font-bold mb-6">Goods Receiving Note</h2>

//       {/* Search Bar */}
//       <div className="mb-6">
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Search by description..."
//           className={`w-full p-2 border ${
//             darkMode
//               ? "border-gray-700 bg-gray-800 text-white"
//               : "border-gray-300 bg-white"
//           } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
//         />
//       </div>

//       {/* Add Good Form */}
//       <AddGoodForm
//         newGood={newGood}
//         setNewGood={setNewGood}
//         handleAddGood={handleAddGood}
//         error={error}
//         darkMode={darkMode}
//       />

//       {/* Goods List */}
//       <GoodsList
//         goods={goods}
//         handleEditGood={handleEditGood}
//         handleDeleteGood={handleDeleteGood}
//         editGood={editGood}
//         setEditGood={setEditGood}
//         handleUpdateGood={handleUpdateGood}
//         darkMode={darkMode}
//       />

//       {/* Signature Section */}
//       <SignatureSection darkMode={darkMode} />

//       {/* Dark Mode Toggle */}
//       <div className="mt-6">
//         <button
//           onClick={toggleDarkMode}
//           className={`px-4 py-2 rounded-lg text-white ${
//             darkMode ? "bg-gray-800" : "bg-gray-600"
//           } transition-all duration-300`}
//         >
//           Toggle Dark Mode
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GoodReceivingNot;
