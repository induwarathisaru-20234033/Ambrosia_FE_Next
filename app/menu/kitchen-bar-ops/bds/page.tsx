"use client";

import { useEffect, useMemo, useState } from "react";
import TabCard from "@/components/TabCard";
import ItemDetailModal from "@/components/ItemDetailModal";
import PlaceDirectOrderModal from "@/components/PlaceDirectOrderModal";
import { YellowButton } from "../layout";
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
  ITable,
} from "@/data-types";
import { useRouter } from "next/navigation";
import OrderMgtBackButton from "@/components/order-mgt/OrderMgtBackButton";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface BDSItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  status: "new" | "preparing" | "ready" | "onhold";
  tag?: string;
}

interface BDSTab {
  id: number | string;
  tabName: string;
  orderNumber: string;
  tableName?: string | null;
  orderStatus: number;
  items: BDSItem[];
  isManual?: boolean;
  isPlaced?: boolean;
}

interface DirectBarModalItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
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
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const [manualTabs, setManualTabs] = useState<BDSTab[]>([]);
  const [selectedManualTab, setSelectedManualTab] = useState<BDSTab | null>(null);

  const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);

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

  const { data: menuResponse } = useGetQuery<
    IBaseApiResponse<MenuItem[]> | MenuItem[],
    Record<string, any>
  >(
    ["bds-drink-menu"],
    "/menu",
    {
      category: "Drinks",
      isAvailable: true,
    },
    { enabled: true, toastRef }
  );

  const { data: tablesResponse } = useGetQuery<
    IBaseApiResponse<ITable[]>,
    undefined
  >(["bds-tables"], "/tables", undefined, { enabled: true, toastRef });

  const drinkMenuItems: MenuItem[] = Array.isArray(menuResponse)
    ? menuResponse
    : menuResponse?.data ?? [];

  const tables: ITable[] = tablesResponse?.data ?? [];

  const getItemStatusFromOrderStatus = (
    orderStatus: number
  ): "new" | "preparing" | "ready" | "onhold" => {
    switch (orderStatus) {
      case 3:
        return "preparing";
      case 4:
        return "onhold";
      case 5:
        return "ready";
      default:
        return "new";
    }
  };

  const apiTabs: BDSTab[] = useMemo(() => {
    const orders = ordersResponse?.data?.items ?? [];

    return orders
      .filter((order) => [2, 3, 4, 5].includes(order.orderStatus))
      .map((order, index) => {
        const drinkItems = order.items.filter(
          (item) =>
            item.category?.toLowerCase() === "drinks" && item.isAvailable
        );

        return {
          id: order.id,
          tabName: `Tab ${index + 1}`,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          tableName: order.tableName,
          isManual: false,
          isPlaced: true,
          items: drinkItems.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            name: item.menuItemName,
            quantity: item.quantity,
            price: item.unitPrice,
            specialInstructions: item.specialInstructions ?? "",
            status: getItemStatusFromOrderStatus(order.orderStatus),
            tag: userInitials,
          })),
        };
      })
      .filter((tab) => tab.items.length > 0);
  }, [ordersResponse, userInitials]);

  const allTabs = [...manualTabs, ...apiTabs];

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

  const updateManualTab = (
    tabId: string | number,
    updater: (tab: BDSTab) => BDSTab
  ) => {
    setManualTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? updater(tab) : tab))
    );

    setSelectedManualTab((prev) =>
      prev && prev.id === tabId ? updater(prev) : prev
    );
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

  const handleCreateNewTab = () => {
    const nextNumber = manualTabs.length + 1;

    const newTab: BDSTab = {
      id: `manual-${Date.now()}`,
      tabName: `Direct Tab ${nextNumber}`,
      orderNumber: "",
      tableName: "",
      orderStatus: 1,
      items: [],
      isManual: true,
      isPlaced: false,
    };

    setManualTabs((prev) => [newTab, ...prev]);
  };

  const handleOpenItemDetailModal = (tab: BDSTab) => {
    if (!tab.isManual || tab.isPlaced) return;

    setSelectedManualTab(tab);
    setIsItemDetailModalOpen(true);
  };

  const handleCloseItemDetailModal = () => {
    setSelectedManualTab(null);
    setIsItemDetailModalOpen(false);
  };

  const handleOpenPlaceOrderModal = (tab: BDSTab) => {
    if (!tab.isManual || tab.isPlaced) return;

    setSelectedManualTab(tab);
    setIsPlaceOrderModalOpen(true);
  };

  const handleClosePlaceOrderModal = () => {
    setSelectedManualTab(null);
    setIsPlaceOrderModalOpen(false);
  };

  const handleEnterItemToManualTab = (selectedItem: DirectBarModalItem) => {
    if (!selectedManualTab) return;

    const currentTab = manualTabs.find((tab) => tab.id === selectedManualTab.id);
    if (!currentTab) return;

    const existingItemIndex = currentTab.items.findIndex(
      (item) => item.menuItemId === selectedItem.menuItemId
    );

    let updatedItems: BDSItem[] = [];

    if (existingItemIndex !== -1) {
      updatedItems = currentTab.items.map((item) =>
        item.menuItemId === selectedItem.menuItemId
          ? { ...item, quantity: item.quantity + selectedItem.quantity }
          : item
      );
    } else {
      updatedItems = [
        ...currentTab.items,
        {
          id: Date.now(),
          menuItemId: selectedItem.menuItemId,
          name: selectedItem.name,
          quantity: selectedItem.quantity,
          price: selectedItem.price,
          specialInstructions: "",
          status: "new",
          tag: userInitials,
        },
      ];
    }

    updateManualTab(currentTab.id, (tab) => ({
      ...tab,
      items: updatedItems,
    }));

      toastRef?.current?.show({
      severity: "success",
      summary: "Success",
      detail: `${selectedItem.name} added to ${currentTab.tabName}`,
      life: 2000,
    });
  };

  const handlePlaceManualOrder = async (tableId: number) => {
    if (!selectedManualTab) return;

    const currentTab = manualTabs.find((tab) => tab.id === selectedManualTab.id);
    if (!currentTab) return;

    if (currentTab.items.length === 0) {
      toastRef?.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Add at least one item first",
        life: 3000,
      });
      return;
    }

    try {
      await axiosAuth.post("/orders", {
        tableId,
        items: currentTab.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions ?? "",
        })),
        isDraft: false,
      });

      setManualTabs((prev) => prev.filter((tab) => tab.id !== currentTab.id));

      toastRef?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Direct bar order placed successfully",
        life: 3000,
      });

      handleClosePlaceOrderModal();
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        error?.message ||
        "Failed to place direct bar order";

      toastRef?.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    }
  };

  const handleIncreaseItem = (tabId: string | number, itemId: number) => {
    updateManualTab(tabId, (tab) => ({
      ...tab,
      items: tab.items.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    }));
  };

  const handleDecreaseItem = (tabId: string | number, itemId: number) => {
    updateManualTab(tabId, (tab) => {
      const item = tab.items.find(i => i.id === itemId);
      if (item && item.quantity <= 1) {
        // Remove item if quantity would become 0
        return {
          ...tab,
          items: tab.items.filter(i => i.id !== itemId)
        };
      }
      return {
        ...tab,
        items: tab.items.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      };
    });
  };

  const handleRemoveItem = (tabId: string | number, itemId: number) => {
    updateManualTab(tabId, (tab) => ({
      ...tab,
      items: tab.items.filter(i => i.id !== itemId)
    }));
  };


  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="kbo-title !mb-0">Bar Display System</h1>

        <div className="flex gap-3">

          <YellowButton onClick={handleCreateNewTab}>
            Create New Tab
          </YellowButton>

          <OrderMgtBackButton />
          
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
          {allTabs.length === 0 ? (
            <p className="text-gray-700">
              No drink orders available for bar display.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {allTabs.map((tab) => {
                const numericTabId = typeof tab.id === "number" ? tab.id : null;

                return (
                  <TabCard
                    key={tab.id}
                    tabName={tab.tabName}
                    orderNumber={tab.orderNumber}
                    tableName={tab.tableName}
                    orderStatus={tab.orderStatus}
                    items={tab.items}
                    isManual={!!tab.isManual}
                    isPlaced={!!tab.isPlaced}
                    isUpdating={numericTabId !== null && updatingOrderId === numericTabId}
                    isPlusDisabled={!tab.isManual || !!tab.isPlaced}
                    onAddClick={() => handleOpenItemDetailModal(tab)}
                    onPlaceOrder={
                      tab.isManual && !tab.isPlaced
                        ? () => handleOpenPlaceOrderModal(tab)
                        : undefined
                    }
                    onStartClick={
                      numericTabId !== null
                        ? () => handleStartOrder(numericTabId)
                        : undefined
                    }
                    onOnHoldClick={
                      numericTabId !== null
                        ? () => handleOnHoldOrder(numericTabId)
                        : undefined
                    }
                    onReadyClick={
                      numericTabId !== null
                        ? () => handleReadyOrder(numericTabId)
                        : undefined
                    }
                    onIncreaseItem={
                      tab.isManual && !tab.isPlaced
                        ? (itemId: number) => handleIncreaseItem(tab.id, itemId)
                        : undefined
                    }
                    onDecreaseItem={
                      tab.isManual && !tab.isPlaced
                        ? (itemId: number) => handleDecreaseItem(tab.id, itemId)
                        : undefined
                    }
                    onRemoveItem={
                      tab.isManual && !tab.isPlaced
                        ? (itemId: number) => handleRemoveItem(tab.id, itemId)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      <ItemDetailModal
        isOpen={isItemDetailModalOpen}
        onClose={handleCloseItemDetailModal}
        tabName={selectedManualTab?.tabName ?? ""}
        drinkItems={drinkMenuItems}
        onEnter={handleEnterItemToManualTab}
      />

      <PlaceDirectOrderModal
        isOpen={isPlaceOrderModalOpen}
        onClose={handleClosePlaceOrderModal}
        tables={tables}
        onConfirm={handlePlaceManualOrder}
      />
    </div>
  );
}