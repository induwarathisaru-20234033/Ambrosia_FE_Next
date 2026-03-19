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
import { useGetQuery } from "@/services/queries/getQuery";
import {
  IBaseApiResponse,
  IPaginatedData,
  IBackendOrder,
} from "@/data-types";

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
    if (!profile) return "User";

    if (profile.name) return profile.name;

    const parts = [profile.given_name, profile.family_name].filter(Boolean);
    if (parts.length) return parts.join(" ");

    return profile.email || "User";
  }, [profile]);

  const userInitials = useMemo(() => getInitials(displayName), [displayName]);

  const {
    data: ordersResponse,
    isLoading,
    isError,
  } = useGetQuery<
    IBaseApiResponse<IPaginatedData<IBackendOrder>>,
    Record<string, any>
  >(
    ["bds-orders"],
    "/orders",
    {
      Status: 2, // Sent to KDS
      PageNumber: 1,
      PageSize: 50,
      SortField: "createdDate",
      SortOrder: 1,
    }
  );

  const bdsTabs: BDSTab[] = useMemo(() => {
    const orders = ordersResponse?.data?.items ?? [];

    return orders
      .map((order) => {
        const drinkItems = order.items.filter(
          (item) =>
            item.category?.toLowerCase() === "drinks" && item.isAvailable
        );

        return {
          id: order.id,
          tabName: `#${order.orderNumber}`,
          orderNumber: "",
          items: drinkItems.map((item) => ({
            id: item.id,
            name: item.menuItemName,
            quantity: item.quantity,
            status: "new" as const,
            tag: userInitials,
          })),
        };
      })
      .filter((tab) => tab.items.length > 0);
  }, [ordersResponse, userInitials]);

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

      {isLoading && <p>Loading bar orders...</p>}
      {isError && (
        <p className="text-red-500">Failed to load bar display orders.</p>
      )}

      {!isLoading && !isError && (
        <div
          className="w-full rounded-sm p-4"
          style={{ backgroundColor: "#ded0bc" }}
        >
          {bdsTabs.length === 0 ? (
            <p className="text-gray-700">
              No drink orders in Sent to KDS status.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {bdsTabs.map((tab) => (
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
          )}
        </div>
      )}
    </div>
  );
}