"use client";

import Button from "@/components/Button";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IPaginatedApiResponse,
  IReservation,
  IWaiterCurrentAllocation,
  IWaiterAllocationTable,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog } from "primereact/dialog";

type SelectedTableAllocation = {
  waiterId: number;
  waiterName: string;
  table: IWaiterAllocationTable;
};

type SelectedUnassignWaiter = {
  waiterId: number;
  waiterName: string;
  reservations: IWaiterCurrentAllocation["reservations"];
};

type ReservationAllocationQueryParams = {
  ReservationStatus: number;
  PageNumber: number;
  PageSize: number;
  ReservationDateFrom: string;
  ReservationDateTo: string;
};

type WaiterAssignmentRequest = {
  reservationIds: number[];
  employeeId: number;
};

const getTodayReservationRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 1, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 0, 0);

  return {
    ReservationDateFrom: start.toISOString(),
    ReservationDateTo: end.toISOString(),
  };
};

export default function WaiterAllocations() {
  const toastRef = useToastRef();
  const queryClient = useQueryClient();
  const [selectedWaiterId, setSelectedWaiterId] = useState<number | null>(null);
  const [selectedReservationIds, setSelectedReservationIds] = useState<
    number[]
  >([]);
  const [selectedTableAllocation, setSelectedTableAllocation] =
    useState<SelectedTableAllocation | null>(null);
  const [selectedUnassignWaiter, setSelectedUnassignWaiter] =
    useState<SelectedUnassignWaiter | null>(null);

  const { data, isLoading } = useGetQuery<
    IBaseApiResponse<IWaiterCurrentAllocation[]>,
    undefined
  >(
    ["waiterCurrentAllocations"],
    "/Employees/waiters/current-allocations",
    undefined,
    {
      enabled: true,
      toastRef,
      showErrorToast: true,
    },
  );

  const todayReservationRange = getTodayReservationRange();

  const reservationQueryParams: ReservationAllocationQueryParams | undefined =
    selectedTableAllocation
      ? {
          ReservationStatus: 2,
          PageNumber: 1,
          PageSize: 0,
          ReservationDateFrom: todayReservationRange.ReservationDateFrom,
          ReservationDateTo: todayReservationRange.ReservationDateTo,
        }
      : undefined;

  const { data: reservationData, isLoading: isReservationsLoading } =
    useGetQuery<
      IPaginatedApiResponse<IReservation>,
      ReservationAllocationQueryParams | undefined
    >(
      [
        "waiterAllocationReservations",
        selectedTableAllocation?.waiterId ?? 0,
        selectedTableAllocation?.table.tableId ?? 0,
      ],
      "/Reservations",
      reservationQueryParams,
      {
        enabled: Boolean(selectedTableAllocation),
        toastRef,
        showErrorToast: true,
      },
    );

  const { mutate: assignWaiter, isPending: isAssigningWaiter } = usePatchQuery({
    toastRef,
    successMessage: "Waiter assigned successfully",
  });

  const { mutate: unassignWaiter, isPending: isUnassigningWaiter } =
    usePatchQuery({
      toastRef,
      successMessage: "Waiter unassigned successfully",
    });

  const waiters = data?.data ?? [];
  const reservationsForSelectedTable =
    reservationData?.data?.items?.filter(
      (reservation) =>
        reservation.table?.id === selectedTableAllocation?.table.tableId,
    ) ?? [];
  const showReservationEmptyState =
    !isReservationsLoading && reservationsForSelectedTable.length === 0;
  const showReservationList =
    !isReservationsLoading && reservationsForSelectedTable.length > 0;
  const unassignReservations = selectedUnassignWaiter?.reservations ?? [];
  const showUnassignReservationEmptyState =
    Boolean(selectedUnassignWaiter) && unassignReservations.length === 0;
  const showUnassignReservationList =
    Boolean(selectedUnassignWaiter) && unassignReservations.length > 0;

  const handleOpenAllocationDialog = (
    waiter: IWaiterCurrentAllocation,
    table: IWaiterAllocationTable,
  ) => {
    setSelectedWaiterId(waiter.waiterId);
    setSelectedReservationIds([]);
    setSelectedTableAllocation({
      waiterId: waiter.waiterId,
      waiterName: waiter.fullName,
      table,
    });
  };

  const handleCloseAllocationDialog = () => {
    setSelectedTableAllocation(null);
    setSelectedReservationIds([]);
  };

  const handleOpenUnassignDialog = (waiter: IWaiterCurrentAllocation) => {
    setSelectedWaiterId(waiter.waiterId);
    setSelectedReservationIds([]);
    setSelectedUnassignWaiter({
      waiterId: waiter.waiterId,
      waiterName: waiter.fullName,
      reservations: waiter.reservations,
    });
  };

  const handleCloseUnassignDialog = () => {
    setSelectedUnassignWaiter(null);
    setSelectedReservationIds([]);
  };

  const toggleReservationSelection = (reservationId: number) => {
    setSelectedReservationIds((current) =>
      current.includes(reservationId)
        ? current.filter((id) => id !== reservationId)
        : [...current, reservationId],
    );
  };

  const refreshAllocationQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["waiterCurrentAllocations"],
      refetchType: "active",
    });

    queryClient.invalidateQueries({
      queryKey: ["waiterAllocationReservations"],
      refetchType: "active",
    });

    queryClient.invalidateQueries({
      queryKey: ["getReservations"],
      refetchType: "active",
    });
  };

  const handleAssignReservations = () => {
    if (!selectedTableAllocation || selectedReservationIds.length === 0) {
      return;
    }

    const body: WaiterAssignmentRequest = {
      reservationIds: selectedReservationIds,
      employeeId: selectedTableAllocation.waiterId,
    };

    assignWaiter(
      {
        url: "/Reservations/assign-waiter",
        body,
      },
      {
        onSuccess: () => {
          refreshAllocationQueries();
          handleCloseAllocationDialog();
        },
      },
    );
  };

  const handleUnassignReservations = () => {
    if (!selectedUnassignWaiter || selectedReservationIds.length === 0) {
      return;
    }

    const body: WaiterAssignmentRequest = {
      reservationIds: selectedReservationIds,
      employeeId: selectedUnassignWaiter.waiterId,
    };

    unassignWaiter(
      {
        url: "/Reservations/unassign-waiter",
        body,
      },
      {
        onSuccess: () => {
          refreshAllocationQueries();
          handleCloseUnassignDialog();
        },
      },
    );
  };

  const handleOpenAssignDialog = (waiter: IWaiterCurrentAllocation) => {
    const firstTable = waiter.tables[0];

    if (!firstTable) {
      toastRef.current?.show({
        severity: "info",
        summary: "Info",
        detail: "Click a table to allocate reservations for this waiter.",
        life: 3000,
      });
      return;
    }

    handleOpenAllocationDialog(waiter, firstTable);
  };

  return (
    <div className="py-6">
      <Dialog
        visible={Boolean(selectedTableAllocation)}
        onHide={handleCloseAllocationDialog}
        modal
        draggable={false}
        closable={false}
        style={{ width: "min(92vw, 820px)" }}
        header={
          <div className="relative flex w-full items-center justify-center py-1">
            <span className="text-[26px] font-semibold text-white">
              Allocate Waiter
            </span>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-black transition-opacity hover:opacity-70"
              onClick={handleCloseAllocationDialog}
            >
              <span className="pi pi-times text-3xl" />
            </button>
          </div>
        }
        headerClassName="!bg-[#FF6B6B] !text-white"
      >
        <div className="px-2 py-4 md:px-5 md:py-6">
          <p className="text-[18px] leading-8 text-[#111827]">
            Select one or more reservations to allocate to{" "}
            <span className="font-semibold">
              {selectedTableAllocation?.waiterName}
            </span>
          </p>

          <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="max-h-[380px] space-y-4 overflow-y-auto pr-2">
              {isReservationsLoading
                ? ["one", "two", "three", "four"].map((skeletonKey) => (
                    <div
                      key={`reservation-skeleton-${skeletonKey}`}
                      className="h-16 animate-pulse rounded-2xl border border-[#F3F4F6] bg-[#FAFAFA]"
                    />
                  ))
                : null}

              {showReservationEmptyState ? (
                <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8 text-center text-sm text-[#6B7280]">
                  No reservations found for{" "}
                  {selectedTableAllocation?.table.tableName} today.
                </div>
              ) : null}

              {showReservationList
                ? reservationsForSelectedTable.map((reservation) => {
                    const isChecked = selectedReservationIds.includes(
                      reservation.id,
                    );

                    return (
                      <label
                        key={reservation.id}
                        className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#F1F5F9] bg-white px-5 py-4 shadow-sm transition-colors hover:bg-[#FFF7F7]"
                      >
                        <span className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] px-3 py-2 text-sm font-medium text-[#374151]">
                          {selectedTableAllocation?.table.tableName}
                        </span>

                        <span className="min-w-0 flex-1 text-[16px] text-[#111827]">
                          {reservation.id} - {reservation.reservationCode}
                        </span>

                        <input
                          type="checkbox"
                          className="h-6 w-6 shrink-0 cursor-pointer rounded-md border border-[#D1D5DB] accent-[#FF6B6B]"
                          checked={isChecked}
                          onChange={() =>
                            toggleReservationSelection(reservation.id)
                          }
                        />
                      </label>
                    );
                  })
                : null}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              id="assign-selected-reservations"
              text="Assign"
              type="button"
              className="!min-w-[240px] !rounded-2xl !bg-[#FF6B6B] !px-8 !py-4 !text-white !shadow-md"
              state={!isAssigningWaiter}
              disabled={false}
              onClick={handleAssignReservations}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={Boolean(selectedUnassignWaiter)}
        onHide={handleCloseUnassignDialog}
        modal
        draggable={false}
        closable={false}
        style={{ width: "min(92vw, 820px)" }}
        header={
          <div className="relative flex w-full items-center justify-center py-1">
            <span className="text-[26px] font-semibold text-white">
              Unassign Waiter
            </span>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-black transition-opacity hover:opacity-70"
              onClick={handleCloseUnassignDialog}
            >
              <span className="pi pi-times text-3xl" />
            </button>
          </div>
        }
        headerClassName="!bg-[#FF6B6B] !text-white"
      >
        <div className="px-2 py-4 md:px-5 md:py-6">
          <p className="text-[18px] leading-8 text-[#111827]">
            Select one or more reservations to unassign from{" "}
            <span className="font-semibold">
              {selectedUnassignWaiter?.waiterName}
            </span>
          </p>

          <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="max-h-[380px] space-y-4 overflow-y-auto pr-2">
              {showUnassignReservationEmptyState ? (
                <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8 text-center text-sm text-[#6B7280]">
                  No reservations are currently assigned to this waiter.
                </div>
              ) : null}

              {showUnassignReservationList
                ? unassignReservations.map((reservation) => {
                    const isChecked = selectedReservationIds.includes(
                      reservation.reservationId,
                    );

                    return (
                      <label
                        key={reservation.reservationId}
                        className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#F1F5F9] bg-white px-5 py-4 shadow-sm transition-colors hover:bg-[#FFF7F7]"
                      >
                        <span className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] px-3 py-2 text-sm font-medium text-[#374151]">
                          {reservation.tableName}
                        </span>

                        <span className="min-w-0 flex-1 text-[16px] text-[#111827]">
                          {reservation.reservationId} - {reservation.reservationCode}
                        </span>

                        <input
                          type="checkbox"
                          className="h-6 w-6 shrink-0 cursor-pointer rounded-md border border-[#D1D5DB] accent-[#FF6B6B]"
                          checked={isChecked}
                          onChange={() =>
                            toggleReservationSelection(reservation.reservationId)
                          }
                        />
                      </label>
                    );
                  })
                : null}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              id="unassign-selected-reservations"
              text="Un-assign"
              type="button"
              className="!min-w-[240px] !rounded-2xl !bg-[#FF6B6B] !px-8 !py-4 !text-white !shadow-md"
              state={!isUnassigningWaiter}
              disabled={false}
              onClick={handleUnassignReservations}
            />
          </div>
        </div>
      </Dialog>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {["a", "b", "c", "d"].map((skeletonKey) => (
            <div
              key={`waiter-skeleton-${skeletonKey}`}
              className="h-44 rounded-xl border border-[#D1D5DB] bg-white animate-pulse"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && waiters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white p-6 text-sm text-[#6B7280]">
          No waiter allocations found.
        </div>
      ) : null}

      {!isLoading && waiters.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {waiters.map((waiter, index) => {
            const isSelected = selectedWaiterId
              ? selectedWaiterId === waiter.waiterId
              : index === 0;

            return (
              <div
                key={waiter.waiterId}
                className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
                  isSelected
                    ? "border-[#3B82F6] ring-2 ring-[#3B82F6]/40"
                    : "border-[#D1D5DB]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9CA3AF] text-[#4B5563]">
                    <span className="pi pi-user text-sm" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111827]">
                      {waiter.fullName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          waiter.isOnline ? "bg-[#22C55E]" : "bg-[#9CA3AF]"
                        }`}
                      />
                      <span>{waiter.isOnline ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#4B5563]">
                    Active Tables
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {waiter.tables.length > 0 ? (
                      waiter.tables.map((table) => (
                        <button
                          type="button"
                          key={table.tableId}
                          title={table.tableName}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenAllocationDialog(waiter, table);
                          }}
                          className="inline-flex min-w-7 items-center justify-center rounded-md bg-[#9CA3AF] px-2 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-85"
                        >
                          {table.tableName}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-[#9CA3AF]">None</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    id={`assign-waiter-${waiter.waiterId}`}
                    text="Assign"
                    type="button"
                    className="!w-full !rounded-full !bg-[#FF6B6B] !border !border-[#FF6B6B] !text-white !py-2"
                    state={true}
                    disabled={false}
                    onClick={() => handleOpenAssignDialog(waiter)}
                  />
                  <Button
                    id={`unassign-waiter-${waiter.waiterId}`}
                    text="Un-assign"
                    type="button"
                    className="!w-full !rounded-full !bg-white !border !border-[#FF6B6B] !text-[#FF6B6B] !py-2"
                    state={!isUnassigningWaiter}
                    outlined={true}
                    disabled={false}
                    onClick={() => handleOpenUnassignDialog(waiter)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
