"use client";

import AmbLogo from "@/public/images/AmbrosiaLogoClearBG.png";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#D9D9D9] shadow-sm">
      <div className="h-16 flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center min-w-fit">
          <Image
            src={AmbLogo}
            alt="Ambrosia Logo"
            width={150}
            height={50}
            className="mr-2"
          />
        </div>

        {/* Center Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center gap-8 flex-1">
          {/* Front-of-House Operations */}
          <div className="relative group">
            <button className="text-gray-800 font-medium text-sm hover:text-gray-900 flex items-center gap-1 transition-colors">
              <span>Front-of-House Operations</span>
            </button>
          </div>

          {/* Kitchen and Bar Operations */}
          <div className="relative group">
            <button className="text-gray-800 font-medium text-sm hover:text-gray-900 flex items-center gap-1 transition-colors">
              <span>Kitchen and Bar Operations</span>
            </button>
          </div>

          {/* Inventory and Supply Chain */}
          <div className="relative group">
            <button className="text-gray-800 font-medium text-sm hover:text-gray-900 flex items-center gap-1 transition-colors">
              <span>Purchasing and Inventory</span>
            </button>
          </div>

          {/* Employee Management */}
          <div className="relative group">
            <button className="text-gray-800 font-medium text-sm hover:text-gray-900 flex items-center gap-1 transition-colors">
              <span>Employee Management</span>
            </button>
          </div>

          {/* Analytics
          <button className="text-gray-800 font-medium text-sm hover:text-gray-900 transition-colors">
            Analytics
          </button> */}
        </nav>

        {/* Right Side - User Profile (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <button className="text-gray-800 hover:text-gray-900 transition-colors">
            <i className="pi pi-user text-lg"></i>
          </button>
          <div className="relative group">
            <button className="flex items-center gap-1 text-gray-800 font-medium text-sm hover:text-gray-900 transition-colors">
              <span>John Doe</span>
              <i className="pi pi-chevron-down text-xs"></i>
            </button>
            <div className="absolute right-0 mt-0 w-48 bg-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                Profile
              </button>
              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm border-t">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Hamburger (Mobile) */}
        <button
          className="lg:hidden inline-flex items-center justify-center text-gray-800 hover:text-gray-900 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <i className="pi pi-bars text-xl"></i>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden px-6 pb-4 ${isMenuOpen ? "block" : "hidden"}`}>
        <nav className="flex flex-col gap-3">
          <button className="text-gray-800 font-medium text-sm text-left hover:text-gray-900 transition-colors">
            Front-of-House Operations
          </button>
          <button className="text-gray-800 font-medium text-sm text-left hover:text-gray-900 transition-colors">
            Kitchen and Bar Operations
          </button>
          <button className="text-gray-800 font-medium text-sm text-left hover:text-gray-900 transition-colors">
            Purchasing and Inventory
          </button>
          <button className="text-gray-800 font-medium text-sm text-left hover:text-gray-900 transition-colors">
            Employee Management
          </button>
          <button className="text-gray-800 font-medium text-sm text-left hover:text-gray-900 transition-colors">
            Analytics
          </button>
        </nav>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800">
            <i className="pi pi-user text-lg"></i>
            <span className="text-sm font-medium">John Doe</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-700 hover:text-gray-900 text-sm">
              Profile
            </button>
            <button className="text-gray-700 hover:text-gray-900 text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
