"use client";

import AmbLogo from "@/public/images/AmbrosiaLogoClearBG.png";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchUserProfile,
  getCachedUserProfile,
  type UserProfile,
} from "@/utils/userProfile";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRouter } from "next/navigation";
import { performLogout } from "@/utils/logout";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<OverlayPanel>(null);
  const router = useRouter();

  useEffect(() => {
    const cached = getCachedUserProfile();
    if (cached) {
      setProfile(cached);
      return;
    }

    let isActive = true;
    const loadProfile = async () => {
      const freshProfile = await fetchUserProfile();
      if (isActive && freshProfile) {
        setProfile(freshProfile);
      }
    };

    void loadProfile();
    return () => {
      isActive = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!profile) {
      return "User";
    }

    if (profile.name) {
      return profile.name;
    }

    const parts = [profile.given_name, profile.family_name].filter(Boolean);
    if (parts.length) {
      return parts.join(" ");
    }

    return profile.email || "User";
  }, [profile]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    userMenuRef.current?.hide();
    await performLogout((logoutUrl) => {
      window.location.href = logoutUrl;
    });
  };

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
            {profile?.picture ? (
              <Image
                src={profile.picture}
                alt={displayName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <i className="pi pi-user text-lg"></i>
            )}
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-1 text-gray-800 font-medium text-sm hover:text-gray-900 transition-colors"
              onClick={(event) => userMenuRef.current?.toggle(event)}
              aria-haspopup="true"
            >
              <span>{displayName}</span>
              <i className="pi pi-chevron-down text-xs"></i>
            </button>
            <OverlayPanel
              ref={userMenuRef}
              className="!bg-white !border !border-gray-200 !shadow-xl !rounded-lg mt-2"
            >
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-4 w-48 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="pi pi-sign-out" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </button>
            </OverlayPanel>
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
            {profile?.picture ? (
              <Image
                src={profile.picture}
                alt={displayName}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <i className="pi pi-user text-lg"></i>
            )}
            <span className="text-sm font-medium">{displayName}</span>
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
