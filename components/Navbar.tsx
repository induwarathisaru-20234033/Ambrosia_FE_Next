"use client";

import AmbLogo from "@/public/images/AmbrosiaLogoClearBG.png";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchUserProfile,
  getCachedUserProfile,
  type UserProfile,
} from "@/utils/auth/userProfile";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRouter } from "next/navigation";
import { performLogout } from "@/utils/auth/logout";
import { NavGroup } from "@/data-types";

const navbarGroups: NavGroup[] = [
  {
    label: "Front-of-House Operations",
    items: [
      {
        label: "Reservation Management",
        href: "/menu/foh/reservations",
        icon: "pi-calendar",
      },
      {
        label: "Restaurant Configurations",
        href: "/menu/foh/configurations",
        icon: "pi-cog",
      },
    ],
  },
  {
    label: "Kitchen and Bar Operations",
    items: [
      {
        label: "Kitchen Display System",
        href: "/menu/kitchen-bar-ops/kds",
        icon: "pi-check-circle",
      },
      {
        label: "Bar Display System",
        href: "/menu/kitchen-bar-ops/bds",
        icon: "pi-check-square",
      },
      {
        label: "Order Management",
        href: "/menu/kitchen-bar-ops/order-mgt",
        icon: "pi-list",
      },
      {
        label: "Menu Management",
        href: "/menu/kitchen-bar-ops/menu-mgt",
        icon: "pi-book",
      },
    ],
  },
  {
    label: "Inventory and Procurement",
    items: [
      {
        label: "Inventory Management",
        href: "/menu/iap/inventory/items",
        icon: "pi-box",
      },
      {
        label: "Good Receipt Notes",
        href: "/menu/iap/good-receipt-notes",
        icon: "pi-file-check",
      },
      {
        label: "Goods Issue Notes",
        href: "/menu/iap/good-issue", 
        icon: "pi-file-export",
      },
      {
        label: "Purchase Requests",
        href: "/menu/iap/purchase-requests",
        icon: "pi-shopping-cart",
      },
      {
        label: "Wastage Management",
        href: "/menu/iap/wastage",
        icon: "pi-trash",
      },
    ],
  },
];

function DesktopDropdown({
  group,
  router,
}: Readonly<{
  group: NavGroup;
  router: ReturnType<typeof useRouter>;
}>) {
  const panelRef = useRef<OverlayPanel>(null);

  return (
    <div className="relative">
      <button
        className="text-gray-800 font-medium text-sm hover:text-gray-900 flex items-center gap-1 transition-colors"
        onClick={(e) => panelRef.current?.toggle(e)}
        aria-haspopup="true"
      >
        <span>{group.label}</span>
        <i className="pi pi-chevron-down text-xs" />
      </button>

      <OverlayPanel
        ref={panelRef}
        className="!bg-white !border !border-gray-200 !shadow-xl !rounded-lg !p-1"
        style={{ minWidth: "220px" }}
      >
        <ul className="flex flex-col py-1">
          {group.items.map((item) => (
            <li key={item.href}>
              <button
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => {
                  router.push(item.href);
                  panelRef.current?.hide();
                }}
              >
                {item.icon && (
                  <i className={`pi ${item.icon} text-gray-500 text-base`} />
                )}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </OverlayPanel>
    </div>
  );
}

function MobileAccordion({
  group,
  router,
}: Readonly<{
  group: NavGroup;
  router: ReturnType<typeof useRouter>;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex items-center justify-between w-full text-gray-800 font-medium text-sm text-left hover:text-gray-900 transition-colors py-1"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{group.label}</span>
        <i
          className={`pi ${open ? "pi-chevron-up" : "pi-chevron-down"} text-xs`}
        />
      </button>

      {open && (
        <ul className="flex flex-col mt-1 ml-2 border-l border-gray-300 pl-3 gap-1">
          {group.items.map((item) => (
            <li key={item.href}>
              <button
                className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-gray-900 py-1 transition-colors"
                onClick={() => router.push(item.href)}
              >
                {item.icon && (
                  <i className={`pi ${item.icon} text-xs text-gray-500`} />
                )}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
    if (!profile) return "User";
    if (profile.name) return profile.name;
    const parts = [profile.given_name, profile.family_name].filter(Boolean);
    if (parts.length) return parts.join(" ");
    return profile.email || "User";
  }, [profile]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    userMenuRef.current?.hide();
    await performLogout((logoutUrl) => {
      globalThis.location.href = logoutUrl;
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
            className="mr-2 cursor-pointer"
            onClick={() => router.push("/menu")}
          />
        </div>

        {/* Center Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center gap-8 flex-1">
          {navbarGroups.map((group) => (
            <DesktopDropdown key={group.label} group={group} router={router} />
          ))}

          {/* Employee Management — direct link */}
          <button
            className="text-gray-800 font-medium text-sm hover:text-gray-900 flex items-center gap-1 transition-colors"
            onClick={() => router.push("/menu/emp-mgt")}
          >
            <span>User Management</span>
          </button>
        </nav>

        {/* Right Side — User Profile (Desktop) */}
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
              <i className="pi pi-user text-lg" />
            )}
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-1 text-gray-800 font-medium text-sm hover:text-gray-900 transition-colors"
              onClick={(event) => userMenuRef.current?.toggle(event)}
              aria-haspopup="true"
            >
              <span>{displayName}</span>
              <i className="pi pi-chevron-down text-xs" />
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
          <i className="pi pi-bars text-xl" />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden px-6 pb-4 ${isMenuOpen ? "block" : "hidden"}`}>
        <nav className="flex flex-col gap-3">
          {navbarGroups.map((group) => (
            <MobileAccordion key={group.label} group={group} router={router} />
          ))}

          {/* Employee Management */}
          <button
            className="text-gray-800 font-medium text-sm text-left hover:text-gray-900 transition-colors py-1"
            onClick={() => router.push("/menu/emp-mgt")}
          >
            User Management
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
              <i className="pi pi-user text-lg" />
            )}
            <span className="text-sm font-medium">{displayName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="text-gray-700 hover:text-gray-900 text-sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
