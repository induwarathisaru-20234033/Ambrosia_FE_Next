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
import axiosAuth from "@/utils/AxiosInstance";
import { useToastRef } from "@/contexts/ToastContext";
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
  orderStatus: number;
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
  const toastRef = useToastRef();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

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
    ["bds-orders", refreshKey],
    "/orders",
    {
      PageNumber: 1,
      PageSize: 100,
      SortField: "createdDate",
      SortOrder: 1,
    },
    { enabled: true, toastRef }
  );

  const getItemStatusFromOrderStatus = (
    orderStatus: number
  ): "new" | "preparing" | "ready" => {
    switch (orderStatus) {
      case 3:
        return "preparing";
      case 4:
        return "preparing"; 
      case 5:
        return "ready";
      default:
        return "new";
    }
  };

  const bdsTabs: BDSTab[] = useMemo(() => {
    const orders = ordersResponse?.data?.items ?? [];

    return orders
      .filter((order) => [2, 3, 4, 5].includes(order.orderStatus))
      .map((order) => {
        const drinkItems = order.items.filter(
          (item) =>
            item.category?.toLowerCase() === "drinks" && item.isAvailable
        );

        return {
          id: order.id,
          tabName: `#${order.orderNumber}`,
          orderNumber: "",
          orderStatus: order.orderStatus,
          items: drinkItems.map((item) => ({
            id: item.id,
            name: item.menuItemName,
            quantity: item.quantity,
            status: getItemStatusFromOrderStatus(order.orderStatus),
            tag: userInitials,
          })),
        };
      })
      .filter((tab) => tab.items.length > 0);
  }, [ordersResponse, userInitials]);

  const updateOrderStatus = async (
    orderId: number,
    status: number,
    successMessage: string
  ) => {
    try {
      setUpdatingOrderId(orderId);

      await axiosAuth.put(`/orders/${orderId}/status`, {
        orderId,
        status,
        reason: "Updated from BDS",
      });

      toastRef?.current?.show({
        severity: "success",
        summary: "Success",
        detail: successMessage,
        life: 3000,
      });

      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        error?.message ||
        "Failed to update order status";

      toastRef?.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStartOrder = async (orderId: number) => {
    await updateOrderStatus(orderId, 3, "Order status changed to Preparing");
  };

  const handleReadyOrder = async (orderId: number) => {
    await updateOrderStatus(orderId, 5, "Order status changed to Ready");
  };

  const handleOnHoldOrder = async (orderId: number) => {
  await updateOrderStatus(orderId, 4, "Order status changed to On Hold");
};

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
              No drink orders available for bar display.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {bdsTabs.map((tab) => (
                <TabCard
                  key={tab.id}
                  tabName={tab.tabName}
                  orderNumber={tab.orderNumber}
                  orderStatus={tab.orderStatus}
                  items={tab.items}
                  isUpdating={updatingOrderId === tab.id}
                  onAddClick={() => {
                    console.log(`Add clicked for ${tab.tabName}`);
                  }}
                  onStartClick={() => handleStartOrder(tab.id)}
                  onOnHoldClick={() => handleOnHoldOrder(tab.id)}
                  onReadyClick={() => handleReadyOrder(tab.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}