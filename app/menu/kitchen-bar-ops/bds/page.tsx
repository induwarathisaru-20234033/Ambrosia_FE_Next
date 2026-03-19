"use client";

import { useEffect, useMemo, useState } from "react";
import TabCard from "@/components/TabCard";
import { WhiteButton } from "../layout";
import "../styles/kitchen-bar-ops.css";
import {
  fetchUserProfile,
  getCachedUserProfile,
  type UserProfile,
} from "@/utils/auth/userProfile";

interface BDSItem {
  id: number;
  name: string;
  quantity: number;
  status: "new" | "preparing" | "ready";
  tag?: string;
}

interface BDSTab {
  id: number;
  tabName: string;
  orderNumber: string;
  items: BDSItem[];
}

const getInitials = (name: string) => {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function BDSPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

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

  const userInitials = useMemo(() => getInitials(displayName), [displayName]);

  const mockTabs: BDSTab[] = useMemo(
    () => [
      {
        id: 1,
        tabName: "Tab 9",
        orderNumber: "#2340",
        items: [
          {
            id: 1,
            name: "Johnnie Walker Black – Bottle (750ml)",
            quantity: 1,
            status: "new",
            tag: "⊕",
          },
        ],
      },
      {
        id: 2,
        tabName: "Tab 2",
        orderNumber: "#2341",
        items: [
          {
            id: 1,
            name: "Johnnie Walker Black – Bottle (750ml)",
            quantity: 2,
            status: "preparing",
            tag: userInitials,
          },
          {
            id: 2,
            name: "Lime Mojito",
            quantity: 2,
            status: "preparing",
            tag: userInitials,
          },
        ],
      },
      {
        id: 3,
        tabName: "Tab 1",
        orderNumber: "#2339",
        items: [
          {
            id: 1,
            name: "Johnnie Walker Black – Bottle (750ml)",
            quantity: 2,
            status: "preparing",
            tag: userInitials,
          },
          {
            id: 2,
            name: "Lime Mojito",
            quantity: 2,
            status: "preparing",
            tag: userInitials,
          },
        ],
      },
      {
        id: 4,
        tabName: "Tab 6",
        orderNumber: "#2334",
        items: [
          {
            id: 1,
            name: "Johnnie Walker Black – Bottle (750ml)",
            quantity: 1,
            status: "preparing",
            tag: userInitials,
          },
          {
            id: 2,
            name: "Lime Mojito",
            quantity: 2,
            status: "preparing",
            tag: userInitials,
          },
        ],
      },
    ],
    [userInitials]
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="kbo-title !mb-0">Bar Display System</h1>

        <div className="flex gap-3">
          <WhiteButton
            onClick={() => {
              window.location.href =
                "/menu/kitchen-bar-ops/bds/direct-bar-orders";
            }}
          >
            Direct Order Creation
          </WhiteButton>
        </div>
      </div>

      <div
        className="w-full rounded-sm p-4"
        style={{ backgroundColor: "#ded0bc" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockTabs.map((tab) => (
            <TabCard
              key={tab.id}
              tabName={tab.tabName}
              orderNumber={tab.orderNumber}
              items={tab.items}
              onAddClick={() => {
                console.log(`Add clicked for ${tab.tabName}`);
              }}
              onBumpClick={() => {
                console.log(`Bump clicked for ${tab.tabName}`);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}