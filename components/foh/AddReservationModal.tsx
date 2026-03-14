"use client";

import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  ICreateReservationRequest,
  ITable,
} from "@/data-types";
import { AddReservationSchema } from "@/schemas";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePostQuery } from "@/services/queries/postQuery";
import { Form, Formik } from "formik";
import { Dialog } from "primereact/dialog";
import { useEffect, useMemo, useState } from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import LabelGroup from "../LabelGroup";

interface AddReservationModalProps {
  readonly visible: boolean;
  readonly onHide: () => void;
  readonly onSuccess?: () => void;
}

interface IBookingSlotAvailability {
  id: number;
  slotId: string;
  startTime: string;
  endTime: string;
  existingAllocations?: number;
  allocatedTableIds?: number[];
}

interface IAddReservationFormValues {
  name: string;
  phone: string;
  email: string;
  partySize: string;
  occasion: string;
  timeSlot: string;
  tableId: string;
  specialRequests: string;
}

export default function AddReservationModal({
  visible,
  onHide,
  onSuccess,
}: AddReservationModalProps) {
  const toastRef = useToastRef();
  const [submitting, setSubmitting] = useState(false);
  const [utcDateTime, setUtcDateTime] = useState("");

  const { mutate: createReservation, isPending: isCreateReservationPending } =
    usePostQuery({
      successMessage: "Reservation added successfully",
      toastRef,
    });

  useEffect(() => {
    if (!visible) return;
    setUtcDateTime(new Date().toISOString());
  }, [visible]);

  const { data: bookingSlotsResponse, isLoading: isBookingSlotsLoading } =
    useGetQuery<
      IBaseApiResponse<IBookingSlotAvailability[]>,
      { dateTime: string }
    >(
      ["bookingSlots", utcDateTime],
      "/Configs/booking-slots",
      utcDateTime ? { dateTime: utcDateTime } : undefined,
      {
        enabled: visible && Boolean(utcDateTime),
        toastRef,
      },
    );

  const { data: tablesResponse, isLoading: isTablesLoading } = useGetQuery<
    IBaseApiResponse<ITable[]>,
    {}
  >(["tablesForReservation"], "/Tables", undefined, {
    enabled: visible,
    toastRef,
  });

  const availableBookingSlots = useMemo(
    () =>
      (bookingSlotsResponse?.data ?? []).filter(
        (slot) => (slot.existingAllocations ?? 0) === 0,
      ),
    [bookingSlotsResponse],
  );

  const formatSlotTime = (timeValue: string) => {
    const [hours = 0, minutes = 0, seconds = 0] = timeValue
      .split(":")
      .map((value) => Number.parseInt(value, 10));

    const referenceDate = utcDateTime ? new Date(utcDateTime) : new Date();
    const utcDate = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
        hours,
        minutes,
        seconds,
      ),
    );

    return utcDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeSlotOptions = useMemo(
    () =>
      availableBookingSlots.map((slot) => ({
        value: slot.slotId,
        label: `${formatSlotTime(slot.startTime)} - ${formatSlotTime(slot.endTime)}`,
      })),
    [availableBookingSlots, utcDateTime],
  );

  const getReservationDateTime = (selectedSlot: IBookingSlotAvailability) => {
    const [hours = 0, minutes = 0, seconds = 0] = selectedSlot.startTime
      .split(":")
      .map((value) => Number.parseInt(value, 10));

    const referenceDate = utcDateTime ? new Date(utcDateTime) : new Date();
    return new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
        hours,
        minutes,
        seconds,
      ),
    ).toISOString();
  };

  const handleSubmit = async (values: IAddReservationFormValues) => {
    const selectedSlot = availableBookingSlots.find(
      (slot) => slot.slotId === values.timeSlot,
    );

    if (!selectedSlot) return;

    setSubmitting(true);

    const payload: ICreateReservationRequest = {
      partySize: Number(values.partySize) || 0,
      reservationDate: getReservationDateTime(selectedSlot),
      occasion: values.occasion || "",
      specialRequests: values.specialRequests || "",
      customerName: values.name,
      customerEmail: values.email || "",
      customerPhoneNumber: values.phone,
      bookingSlotId: selectedSlot.id,
      tableId: Number(values.tableId) || 0,
    };

    createReservation(
      { url: "/Reservations", body: payload },
      {
        onSuccess: () => {
          onSuccess?.();
          onHide();
          setSubmitting(false);
        },
        onError: () => {
          setSubmitting(false);
        },
      },
    );
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      showHeader={false}
      contentClassName="!p-0 rounded-2xl"
      style={{ width: "min(96vw, 760px)" }}
    >
      <div className="bg-[#f3f3f3] max-h-[90vh] overflow-y-auto">
        <div className="relative bg-[#FF6B6B] px-8 py-6 text-white">
          <h2 className="text-center text-xl font-semibold">
            Add New Reservation
          </h2>
          <button
            type="button"
            onClick={onHide}
            aria-label="Close modal"
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white"
          >
            <i className="pi pi-times text-2xl" />
          </button>
        </div>

        <div className="px-10 py-8 md:px-14 md:py-10">
          <Formik
            initialValues={{
              name: "",
              phone: "",
              email: "",
              partySize: "",
              occasion: "",
              timeSlot: "",
              tableId: "",
              specialRequests: "",
            }}
            validationSchema={AddReservationSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty, values, setFieldValue }) => {
              const selectedTimeSlot = availableBookingSlots.find(
                (slot) => slot.slotId === values.timeSlot,
              );
              const allocatedTableIds = new Set(
                selectedTimeSlot?.allocatedTableIds ?? [],
              );

              const filteredTables = (tablesResponse?.data ?? []).filter(
                (table) => !allocatedTableIds.has(table.id),
              );

              const tableOptions = filteredTables.map((table) => ({
                value: String(table.id),
                label: `${table.tableName} (Seats ${table.capacity})`,
              }));

              return (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-2">
                    <LabelGroup
                      name="name"
                      label="Name *"
                      type="text"
                      className="h-[42px] w-full rounded-md border border-gray-300 px-3"
                    />
                    <LabelGroup
                      name="phone"
                      label="Phone Number *"
                      type="text"
                      className="h-[42px] w-full rounded-md border border-gray-300 px-3"
                    />

                    <LabelGroup
                      name="email"
                      label="Email"
                      type="email"
                      className="h-[42px] w-full rounded-md border border-gray-300 px-3"
                    />
                    <LabelGroup
                      name="partySize"
                      label="Party Size *"
                      type="number"
                      className="h-[42px] w-full rounded-md border border-gray-300 px-3"
                    />

                    <Dropdown
                      id="reservation-time-slot"
                      name="timeSlot"
                      label="Time Slot *"
                      placeholder={
                        isBookingSlotsLoading
                          ? "Loading available slots..."
                          : "Select a time slot"
                      }
                      options={timeSlotOptions}
                      className="h-[42px] w-full"
                      disabled={
                        isBookingSlotsLoading || timeSlotOptions.length === 0
                      }
                      onChange={() => {
                        setFieldValue("tableId", "");
                      }}
                    />

                    <Dropdown
                      id="reservation-table"
                      name="tableId"
                      label="Table*"
                      placeholder={
                        !values.timeSlot
                          ? "Select a time slot first"
                          : isTablesLoading
                            ? "Loading tables..."
                            : "Select a table"
                      }
                      options={tableOptions}
                      className="h-[42px] w-full"
                      disabled={
                        !values.timeSlot ||
                        isTablesLoading ||
                        tableOptions.length === 0
                      }
                    />
                  </div>

                  <LabelGroup
                    name="occasion"
                    label="Occasion"
                    type="text"
                    className="h-[42px] w-full rounded-md border border-gray-300 px-3"
                  />

                  <LabelGroup
                    name="specialRequests"
                    label="Special Requests"
                    type="text"
                    as="textarea"
                    className="w-full rounded-md border border-gray-300 p-3 min-h-[150px]"
                    style={{ minHeight: "150px" }}
                  />

                  <div className="flex justify-center pt-4">
                    <Button
                      id="confirmReservationButton"
                      text="Confirm Reservation"
                      type="submit"
                      className="h-[46px] min-w-[280px] rounded-2xl bg-[#FF6B6B] px-6 text-white shadow-md"
                      state={!submitting}
                      disabled={
                        submitting ||
                        isCreateReservationPending ||
                        !isValid ||
                        !dirty ||
                        !values.timeSlot ||
                        !values.tableId
                      }
                      onClick={() => {}}
                    />
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </Dialog>
  );
}
