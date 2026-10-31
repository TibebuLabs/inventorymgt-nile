import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      <div
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-gray-800 text-white transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-5">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <nav className="mt-8 space-y-4">
            <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-700">
              Dashboard Home
            </Link>
            <Link to="/dashboard/overview" className="block py-2 px-4 hover:bg-gray-700">
              Overview
            </Link>
          </nav>
        </div>
      </div>

      <button
        className="md:hidden absolute top-5 left-5 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bars"></i>
      </button>
    </div>
  );
};
