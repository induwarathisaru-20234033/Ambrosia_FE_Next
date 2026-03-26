"use client";

import { useToastRef } from "@/contexts/ToastContext";
import {
  IPaginatedApiResponse,
  IReservation,
  ISearchReservationsRequest,
} from "@/data-types";
import { ReservationStatus } from "@/enums/reservationStatus";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";
import LabelGroup from "@/components/LabelGroup";
import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Sidebar } from "primereact/sidebar";
import { Toast } from "primereact/toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ReservationHistoryTableProps {
  refreshTrigger?: number;
}

type ReservationActionType = "arrived" | "noShow" | "cancel";

interface IConfirmationState {
  visible: boolean;
  action: ReservationActionType | null;
  reservation: IReservation | null;
}

export default function ReservationHistoryTable({
  refreshTrigger = 0,
}: Readonly<ReservationHistoryTableProps>) {
  const toastRef = useToastRef();
  const queryClient = useQueryClient();
  const [filterParams, setFilterParams] = useState<ISearchReservationsRequest>(
    {},
  );
  const [confirmationState, setConfirmationState] =
    useState<IConfirmationState>({
      visible: false,
      action: null,
      reservation: null,
    });
  const [selectedReservation, setSelectedReservation] =
    useState<IReservation | null>(null);

  const {
    mutate: confirmGuestArrival,
    isPending: isConfirmGuestArrivalPending,
  } = usePatchQuery({ toastRef });
  const { mutate: confirmNoShow, isPending: isConfirmNoShowPending } =
    usePatchQuery({ toastRef });
  const {
    mutate: confirmCancellation,
    isPending: isConfirmCancellationPending,
  } = usePatchQuery({ toastRef });
  const { data: reservationData, isLoading } = useGetQuery<
    IPaginatedApiResponse<IReservation>,
    ISearchReservationsRequest
  >(
    ["getReservations", refreshTrigger, JSON.stringify(filterParams)],
    "Reservations",
    filterParams,
    {
      enabled: true,
      toastRef,
      showErrorToast: true,
    },
  );

  const handleFilter = (values: ISearchReservationsRequest) => {
    const cleanedParams: ISearchReservationsRequest = {};

    if (values.reservationCode)
      cleanedParams.reservationCode = values.reservationCode;
    if (values.customerName) cleanedParams.customerName = values.customerName;
    if (values.customerEmail)
      cleanedParams.customerEmail = values.customerEmail;
    if (values.customerPhone)
      cleanedParams.customerPhone = values.customerPhone;
    if (values.tableNo) cleanedParams.tableNo = values.tableNo;
    if (values.reservationDateFrom)
      cleanedParams.reservationDateFrom = values.reservationDateFrom;
    if (values.reservationDateTo)
      cleanedParams.reservationDateTo = values.reservationDateTo;
    if (values.createdDateFrom)
      cleanedParams.createdDateFrom = values.createdDateFrom;
    if (values.createdDateTo)
      cleanedParams.createdDateTo = values.createdDateTo;
    if (values.timeSlot) cleanedParams.timeSlot = values.timeSlot;

    setFilterParams(cleanedParams);
  };

  const getReservationStatus = (status: number) => {
    switch (status) {
      case ReservationStatus.Booked:
        return "Booked";
      case ReservationStatus.Arrived:
        return "Arrived";
      case ReservationStatus.NoShow:
        return "No Show";
      case ReservationStatus.Cancelled:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const handleClear = (resetForm: any) => {
    resetForm();
    setFilterParams({});
  };

  const handleViewMore = (reservation: IReservation) => {
    setSelectedReservation(reservation);
  };

  const closeViewMoreSheet = () => {
    setSelectedReservation(null);
  };

  const handleMarkNoShow = (reservation: IReservation) => {
    if (reservation.reservationStatus !== ReservationStatus.Booked) return;

    setConfirmationState({
      visible: true,
      action: "noShow",
      reservation,
    });
  };

  const handleMarkArrived = (reservation: IReservation) => {
    if (reservation.reservationStatus !== ReservationStatus.Booked) return;

    setConfirmationState({
      visible: true,
      action: "arrived",
      reservation,
    });
  };

  const handleCancel = (reservation: IReservation) => {
    if (reservation.reservationStatus !== ReservationStatus.Booked) return;

    setConfirmationState({
      visible: true,
      action: "cancel",
      reservation,
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationState({
      visible: false,
      action: null,
      reservation: null,
    });
  };

  const refreshReservationsTable = () => {
    queryClient.invalidateQueries({
      queryKey: ["getReservations"],
      refetchType: "active",
    });
  };

  const getConfirmationContent = () => {
    switch (confirmationState.action) {
      case "arrived":
        return {
          header: "Confirm Guest Arrival",
          message: "Are you sure you want to mark the reservation as Arrived?",
        };
      case "noShow":
        return {
          header: "Confirm No Show",
          message:
            "Are you sure you want to mark the reservation as No show? This action is irreversible.",
        };
      case "cancel":
        return {
          header: "Confirm Cancellation",
          message:
            "Are you sure you want to cancel the reservation? This action is irreversible.",
        };
      default:
        return {
          header: "Confirm Action",
          message: "Are you sure you want to proceed?",
        };
    }
  };

  const handleConfirmAction = () => {
    if (!confirmationState.reservation || !confirmationState.action) return;

    const reservationId = confirmationState.reservation.id;

    if (confirmationState.action === "arrived") {
      confirmGuestArrival(
        {
          url: `/Reservations/${reservationId}/arrived`,
          body: {},
        },
        {
          onSuccess: () => {
            refreshReservationsTable();
            closeConfirmationDialog();
          },
        },
      );
      return;
    }

    if (confirmationState.action === "noShow") {
      confirmNoShow(
        {
          url: `/Reservations/${reservationId}/no-show`,
          body: {},
        },
        {
          onSuccess: () => {
            refreshReservationsTable();
            closeConfirmationDialog();
          },
        },
      );
      return;
    }

    confirmCancellation(
      {
        url: `/Reservations/${reservationId}/cancel`,
        body: {},
      },
      {
        onSuccess: () => {
          refreshReservationsTable();
          closeConfirmationDialog();
        },
      },
    );
  };

  const isActionSubmitting =
    isConfirmGuestArrivalPending ||
    isConfirmNoShowPending ||
    isConfirmCancellationPending;

  const confirmationContent = getConfirmationContent();

  const confirmationFooter = (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        label="No"
        className="!h-9 !px-4 !rounded-md !bg-white !text-[#4B5563] !border !border-[#D1D5DB]"
        onClick={closeConfirmationDialog}
        disabled={isActionSubmitting}
      />
      <Button
        type="button"
        label="Yes"
        className="!h-9 !px-4 !rounded-md !bg-[#FF6B6B] !border !border-[#FF6B6B] !text-white"
        onClick={handleConfirmAction}
        loading={isActionSubmitting}
        disabled={isActionSubmitting}
      />
    </div>
  );

  const formatLocalDate = (value?: string | Date) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatLocalDateTime = (value?: string | Date) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatLocalTime = (value?: string | Date) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeSlotRange = (reservation: IReservation) => {
    const startTime = reservation.bookingSlot?.startTime;
    const endTime = reservation.bookingSlot?.endTime;

    if (typeof startTime === "string" && typeof endTime === "string") {
      const reservationDate = reservation.reservationDate
        ? new Date(reservation.reservationDate)
        : new Date();
      const toDate = (timeValue: string) => {
        const [hours = 0, minutes = 0, seconds = 0] = timeValue
          .split(":")
          .map((part) => Number.parseInt(part, 10));

        return new Date(
          Date.UTC(
            reservationDate.getUTCFullYear(),
            reservationDate.getUTCMonth(),
            reservationDate.getUTCDate(),
            hours,
            minutes,
            seconds,
          ),
        );
      };

      return `${formatLocalTime(toDate(startTime))} - ${formatLocalTime(toDate(endTime))}`;
    }

    return `${formatLocalTime(startTime)} - ${formatLocalTime(endTime)}`;
  };

  const getCustomerDetails = (reservation: IReservation) => {
    const reservationData = reservation as IReservation & {
      customerDetail?: {
        name?: string;
        email?: string;
        phoneNumber?: string;
      };
      createdDate?: string | Date;
    };

    return reservation.customerDetails ?? reservationData.customerDetail;
  };

  const renderDetailItem = (label: string, value?: string) => (
    <div className="space-y-3">
      <p className="text-[17px] font-medium text-[#6B7280]">{label}</p>
      <div className="min-h-[42px] rounded-lg bg-[#EEF2F6] px-4 py-3 text-[15px] text-[#374151]">
        {value && value.trim() ? value : "-"}
      </div>
    </div>
  );

  const bookingTimeBodyTemplate = (rowData: IReservation) => {
    if (!rowData.reservationDate) return <span>-</span>;
    const localized = new Date(rowData.reservationDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return <span className="text-md text-black">{localized}</span>;
  };

  const statusBodyTemplate = (rowData: IReservation) => {
    return (
      <div className="text-md text-black">
        {getReservationStatus(rowData.reservationStatus)}
      </div>
    );
  };

  const notesBodyTemplate = (rowData: IReservation) => {
    const notes = [rowData.occasion, rowData.specialRequests]
      .filter(Boolean)
      .join(" | ");
    return (
      <span
        className="text-md text-black block max-w-[180px] truncate"
        title={notes || undefined}
      >
        {notes || "-"}
      </span>
    );
  };

  const actionBodyTemplate = (rowData: IReservation) => {
    const isBooked = rowData.reservationStatus === ReservationStatus.Booked;

    return (
      <div className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap min-w-max">
        <Button
          label="Mark as Arrived"
          className="!h-8 !px-3 !text-xs !font-medium !rounded-md !bg-[#FF6B6B] !border !border-[#FF6B6B] !text-white !shrink-0 !whitespace-nowrap !bg-opacity-100"
          size="small"
          onClick={() => handleMarkArrived(rowData)}
          disabled={!isBooked}
        />
        <Button
          label="No Show"
          className="!h-8 !px-3 !text-xs !font-medium !rounded-md !bg-[#FF6B6B] !border !border-[#FF6B6B] !text-white !shrink-0 !whitespace-nowrap !bg-opacity-100"
          size="small"
          onClick={() => handleMarkNoShow(rowData)}
          disabled={!isBooked}
        />
        <Button
          label="View More"
          className="!h-8 !px-3 !text-xs !font-medium !rounded-md !bg-white !text-[#FF6B6B] !border !border-[#FF6B6B] !shrink-0 !whitespace-nowrap !bg-opacity-100"
          size="small"
          onClick={() => handleViewMore(rowData)}
        />
        <Button
          label="Cancel"
          className="!h-8 !px-3 !text-xs !font-medium !rounded-md !bg-white !text-[#FF6B6B] !border !border-[#FF6B6B] !shrink-0 !whitespace-nowrap !bg-opacity-100"
          size="small"
          onClick={() => handleCancel(rowData)}
          disabled={!isBooked}
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      <Toast ref={toastRef} />
      <Sidebar
        visible={Boolean(selectedReservation)}
        onHide={closeViewMoreSheet}
        position="right"
        showCloseIcon
        dismissable
        className="!w-[min(96vw,780px)]"
        header={
          <div className="w-full text-[28px] font-medium text-[#FF6B6B]">
            More Information
          </div>
        }
      >
        {selectedReservation && (
          <div className="space-y-10 border-t border-[#E5E7EB] pt-10">
            <div className="grid grid-cols-1 gap-x-8 gap-y-9 md:grid-cols-3">
              {renderDetailItem(
                "Reservation Code",
                selectedReservation.reservationCode,
              )}
              {renderDetailItem(
                "Customer Name",
                getCustomerDetails(selectedReservation)?.name,
              )}
              {renderDetailItem(
                "Customer Email",
                getCustomerDetails(selectedReservation)?.email,
              )}
              {renderDetailItem(
                "Customer Mobile No.",
                getCustomerDetails(selectedReservation)?.phoneNumber,
              )}
              {renderDetailItem(
                "Reservation Date",
                formatLocalDate(selectedReservation.reservationDate),
              )}
              {renderDetailItem(
                "Time Slot",
                formatTimeSlotRange(selectedReservation),
              )}
              {renderDetailItem(
                "Occasion",
                selectedReservation.occasion ?? "-",
              )}
              {renderDetailItem(
                "Created Date Time",
                formatLocalDateTime(
                  (
                    selectedReservation as IReservation & {
                      createdDate?: string | Date;
                    }
                  ).createdDate,
                ),
              )}
              {renderDetailItem(
                "Arrived Date Time",
                formatLocalDateTime(selectedReservation.arrivedAt),
              )}
              {renderDetailItem(
                "Canceled Date Time",
                formatLocalDateTime(selectedReservation.cancelledAt),
              )}
              {renderDetailItem(
                "No Show Date Time",
                formatLocalDateTime(selectedReservation.noShowMarkedAt),
              )}
              {renderDetailItem(
                "Special Requests",
                selectedReservation.specialRequests ?? "-",
              )}
            </div>
          </div>
        )}
      </Sidebar>
      <Dialog
        visible={confirmationState.visible}
        onHide={closeConfirmationDialog}
        header={
          <div className="w-full text-center font-semibold">
            {confirmationContent.header}
          </div>
        }
        modal
        draggable={false}
        closable={!isActionSubmitting}
        footer={confirmationFooter}
        headerClassName="!bg-[#FF6B6B] !text-white"
        style={{ width: "min(92vw, 700px)" }}
      >
        <p className="px-4 text-black text-center pt-2 text-lg md:text-xl leading-relaxed">
          {confirmationContent.message}
        </p>
      </Dialog>

      <Formik
        initialValues={{
          reservationCode: "",
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          tableNo: "",
          reservationDateFrom: null,
          reservationDateTo: null,
          createdDateFrom: null,
          createdDateTo: null,
          timeSlot: "",
        }}
        onSubmit={(values) => handleFilter(values)}
      >
        {({ resetForm }) => (
          <Form className="">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end lg:grid-cols-4 lg:items-end">
              <LabelGroup
                name="reservationCode"
                label="Reservation Code"
                type="text"
                placeholder="Enter Reservation Code"
              />
              <LabelGroup
                name="customerName"
                label="Guest Name"
                type="text"
                placeholder="Enter Guest Name"
              />
              <LabelGroup
                name="customerEmail"
                label="Guest Email"
                type="text"
                placeholder="Enter Guest Email"
              />
              <LabelGroup
                name="customerPhone"
                label="Contact Number"
                type="text"
                placeholder="Enter Phone Number"
              />
              <LabelGroup
                name="tableNo"
                label="Table No."
                type="text"
                placeholder="Enter Table No."
              />
              <LabelGroup
                name="reservationDateFrom"
                label="Reservation Date From"
                type="date"
                placeholder="From"
              />
              <LabelGroup
                name="reservationDateTo"
                label="Reservation Date To"
                type="date"
                placeholder="To"
              />
              <div className="mb-3 flex h-full items-end gap-2">
                <Button
                  type="submit"
                  label="Filter"
                  className="inline-flex h-[42px] items-center justify-center bg-[#FF6B6B] px-4 py-2 text-white font-semibold rounded-md shadow-lg hover:bg-[#FF6B6B]"
                />
                <Button
                  type="button"
                  label="Clear"
                  className="inline-flex h-[42px] items-center justify-center border-2 border-[#FF6B6B] bg-white px-4 py-2 text-[#FF6B6B] font-semibold rounded-md hover:bg-[#FF6B6B]"
                  onClick={() => handleClear(resetForm)}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Data Table */}
      <div className="bg-white rounded-lg overflow-x-auto">
        <DataTable
          value={reservationData?.data?.items || []}
          loading={isLoading}
          scrollable
          scrollHeight="600px"
          stripedRows
          paginator
          rows={10}
          rowsPerPageOptions={[10, 20, 50]}
          className="w-full"
          tableStyle={{ minWidth: "1700px" }}
        >
          <Column
            field="reservationCode"
            header="Reservation Code"
            sortable
            style={{ width: "140px" }}
          />
          <Column
            body={bookingTimeBodyTemplate}
            header="Booking Time"
            style={{ width: "160px" }}
          />
          <Column
            field="customerDetail.name"
            header="Guest Name"
            sortable
            style={{ width: "140px" }}
          />
          <Column
            field="partySize"
            header="Party Size"
            sortable
            style={{ width: "110px" }}
          />
          <Column
            field="table.tableName"
            header="Table"
            sortable
            style={{ width: "100px" }}
          />
          <Column
            body={statusBodyTemplate}
            header="Status"
            sortable
            style={{ width: "130px" }}
          />
          <Column
            field="customerDetail.phoneNumber"
            header="Contact"
            sortable
            style={{ width: "140px" }}
          />
          <Column
            body={notesBodyTemplate}
            header="Occasion/Notes"
            style={{ width: "200px" }}
          />
          <Column
            body={actionBodyTemplate}
            style={{
              width: "200px",
              minWidth: "200px",
              opacity: 1,
            }}
          />
        </DataTable>
      </div>
    </div>
  );
}
