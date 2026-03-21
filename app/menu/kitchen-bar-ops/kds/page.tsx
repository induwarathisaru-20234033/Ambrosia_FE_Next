"use client";

import { useMemo, useState,useEffect } from "react";
import { AiButton } from "@/components/AiButton";
import KitchenCard from "@/components/KitchenCard";
import { YellowButton } from "../layout";
import "../styles/kitchen-bar-ops.css";
import { useGetQuery } from "@/services/queries/getQuery";
import axiosAuth from "@/utils/AxiosInstance";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IPaginatedData,
  IBackendOrder,
} from "@/data-types";
import {
  fetchUserProfile,
  getCachedUserProfile,
  type UserProfile,
} from "@/utils/auth/userProfile";  
import OrderMgtBackButton from "@/components/OrderMgtBackButton";

interface KDSItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  status: "new" | "preparing" | "ready" | "done";
  tag?: string;
  category?: string;
}

interface KDSCard {
  id: number;
  cardName: string;
  orderNumber: string;
  tableName?: string | null;
  orderStatus: number;
  items: KDSItem[];
}

const getItemStatus = (
  orderStatus: number
): "new" | "preparing" | "ready" | "done" => {
  switch (orderStatus) {
    case 3: return "preparing";
    case 4: return "preparing";
    case 5: return "ready";
    case 6: return "done";
    default: return "new";
  }
};

export default function ViewKitchenBarOpsPage() {
  const toastRef = useToastRef();
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
    if (isActive && freshProfile) setProfile(freshProfile);
  };
  void loadProfile();
  return () => { isActive = false; };
}, []);

const displayName = useMemo(() => {
  if (!profile) return "User";
  if (profile.name) return profile.name;
  const parts = [profile.given_name, profile.family_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return profile.email || "User";
}, [profile]);

const userInitials = useMemo(() => {
  return displayName
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}, [displayName]);

  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  type OrdersQuery = IBaseApiResponse<IPaginatedData<IBackendOrder>>;
  type OrdersParams = Record<string, any>;

  const {
    data: ordersResponse,
    isLoading,
    isError,
  } = useGetQuery<OrdersQuery, OrdersParams>(
    ["kds-orders", refreshKey],
    "/orders",
    {
      PageNumber: 1,
      PageSize: 100,
      SortField: "createdDate",
      SortOrder: 1,
    },
    { enabled: true, toastRef }
  );

  const kdsCards: KDSCard[] = useMemo(() => {
    const orders = ordersResponse?.data?.items ?? [];

    return orders
      .filter((order) => [2, 3, 4, 5].includes(order.orderStatus))
      .map((order, index) => {
        const foodItems = order.items.filter(
          (item) => item.category?.toLowerCase() !== "drinks" && item.isAvailable
        );

        return {
          id: order.id,
          cardName: `Table ${order.tableName ?? index + 1}`,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          tableName: order.tableName,
          items: foodItems.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            name: item.menuItemName,
            quantity: item.quantity,
            price: item.unitPrice,
            specialInstructions: item.specialInstructions ?? "",
            status: getItemStatus(order.orderStatus),
            category: item.category,
             tag: userInitials,
          })),
        };
      })
      .filter((card) => card.items.length > 0);
  }, [ordersResponse]);

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
        reason: "Updated from KDS",
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

  const handleStartOrder  = (orderId: number) =>
    updateOrderStatus(orderId, 3, "Order is now Preparing");

  const handleOnHoldOrder = (orderId: number) =>
    updateOrderStatus(orderId, 4, "Order placed On Hold");

  const handleReadyOrder  = (orderId: number) =>
    updateOrderStatus(orderId, 5, "Order marked as Ready");

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-12 md:py-16">

        <div className="flex justify-between items-start mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-[#FBB365] text-left">
            Kitchen Display System
          </h2>
          <div className="flex justify-end gap-3">
            {/* <AiButton className="px-3 py-2 text-sm bg-[#FBB365] text-black rounded-lg">
              AI Recommendation
            </AiButton> */}
            <OrderMgtBackButton />
          </div>
        </div>

        {isLoading && <p>Loading kitchen orders...</p>}
        {isError && (
          <p className="text-red-500">Failed to load kitchen display orders.</p>
        )}

        {!isLoading && !isError && (
          <div
            className="w-full rounded-sm p-4"
            style={{ backgroundColor: "#ded0bc" }}
          >
            {kdsCards.length === 0 ? (
              <p className="text-gray-700">
                No food orders available for kitchen display.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {kdsCards.map((card) => (
                  <KitchenCard
                    key={card.id}
                    cardName={card.cardName}
                    orderNumber={card.orderNumber}
                    tableName={card.tableName}
                    orderStatus={card.orderStatus}
                    items={card.items}
                    isUpdating={updatingOrderId === card.id}
                    onStartClick={() => handleStartOrder(card.id)}
                    onHoldClick={() => handleOnHoldOrder(card.id)}
                    onReadyClick={() => handleReadyOrder(card.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}